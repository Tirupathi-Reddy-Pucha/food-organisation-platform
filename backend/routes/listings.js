import express from 'express';
import auth from '../middlewares/auth.js';
import FoodListing from '../models/FoodListing.js';
import User from '../models/User.js';

const router = express.Router();

// ==========================================
// 1. GET ALL LISTINGS (With Search & Filters)
// ==========================================
// @route   GET /api/listings

router.get('/admin/reports', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Access Denied' });
        
        // Find listings where 'reports' array is not empty
        const reportedListings = await FoodListing.find({ reports: { $exists: true, $not: { $size: 0 } } })
            .populate('donor', 'name email')
            .populate('reports.reportedBy', 'name');
            
        res.json(reportedListings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const { search, category, filterVeg } = req.query;

        let query = {};
        
        // Search Logic
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Category Filter
        if (category && category !== 'All') {
            query.category = category;
        }

        // Veg/Non-Veg Filter
        if (filterVeg === 'Veg') {
            query.isVeg = true;
        } else if (filterVeg === 'Non-Veg') {
            query.isVeg = false;
        }

        // FETCH DATA & POPULATE FIELDS
        const listings = await FoodListing.find(query)
            .sort({ date: -1 })
            .populate('donor', 'name phone address createdAt isVerified') 
            .populate('claimedBy', 'name phone address ngoRegNumber')
            .populate('collectedBy', 'name phone address');

        // Smart Expiry Logic
        const currentTime = Date.now();
        const activeListings = listings.filter(item => {
            const createdTime = new Date(item.createdAt).getTime();
            const expiryTime = createdTime + (item.expiry_hours * 60 * 60 * 1000); 

            // If item is already claimed/delivered, keep it visible for history
            if (item.status !== 'Available') return true;
            
            // If Available, only show if not expired
            return currentTime < expiryTime;
        });

        res.json(activeListings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 2. GET USER HISTORY (Specific User)
// ==========================================
// @route   GET /api/listings/user/:id
router.get('/user/:id', async (req, res) => {
    try {
        const listings = await FoodListing.find({ donor: req.params.id })
            .sort({ date: -1 })
            .populate('donor', 'name phone address createdAt isVerified')
            .populate('claimedBy', 'name phone address ngoRegNumber')
            .populate('collectedBy', 'name phone address');
            
        res.json(listings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/listings/history
// @desc    Get ONLY the logged-in user's listings
router.get('/history', auth, async (req, res) => {
    try {
        const history = await FoodListing.find({
            $or: [
                { donor: req.user.id },
                { claimedBy: req.user.id },
                { collectedBy: req.user.id }
            ]
        })
        .populate('donor', 'name phone address isVerified')
        .populate('claimedBy', 'name phone address')
        .sort({ createdAt: -1 });

        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 3. CREATE LISTING (Updated for Batch 1 & 2)
// ==========================================
// @route   POST /api/listings
router.post('/', auth, async (req, res) => {
    try {
        const { 
            title, description, quantity, unit, category, expiry_hours,
            isVeg, requiresRefrigeration, isFresh, isHygienic, 
            hasAllergens, temperature, image, 
            // Batch 1 Fields
            allergens, handlingInstructions, containerType, pickupNote,
            // Batch 2 Fields (Location)
            lat, lng 
        } = req.body;

        // Backend Validation
        if (quantity <= 0) return res.status(400).json({ msg: "⚠️ Quantity must be positive." });
        if (expiry_hours <= 0) return res.status(400).json({ msg: "⚠️ Expiry time must be valid." });

        // Check Ban Status
        const user = await User.findById(req.user.id);
        if (user.isBanned) {
            return res.status(403).json({ msg: "🚫 You are BANNED due to low ratings." });
        }

        const newListing = new FoodListing({
            title,
            description,
            quantity,
            unit,
            category,
            expiry_hours,
            isVeg,
            requiresRefrigeration,
            isFresh,
            isHygienic,
            hasAllergens,
            temperature,
            image,
            
            // New Batch 1 Fields
            allergens, 
            handlingInstructions, 
            containerType, 
            pickupNote,

            // New Batch 2 Field (Constructing Location Object)
            location: {
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            },

            donor: req.user.id,
            status: 'Available'
        });

        const listing = await newListing.save();
        res.json(listing);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 4. DELETE LISTING
// ==========================================
// @route   DELETE /api/listings/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const listing = await FoodListing.findById(req.params.id);
        if (!listing) return res.status(404).json({ msg: 'Listing not found' });

        if (listing.donor.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        if (listing.status !== 'Available') {
            return res.status(400).json({ msg: 'Cannot delete. Item has already been claimed.' });
        }

        await listing.deleteOne();
        res.json({ msg: 'Listing removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 5. UPDATE STATUS (Claim/Pickup/Deliver)
// ==========================================
// @route   PUT /api/listings/:id/status
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status, reason } = req.body; 
        let listing = await FoodListing.findById(req.params.id);
        
        if (!listing) return res.status(404).json({ msg: 'Listing not found' });

        listing.status = status;

        if (status === 'Cancelled') listing.statusReason = reason;
        if (status === 'Claimed') listing.claimedBy = req.user.id;
        if (status === 'In Transit') listing.collectedBy = req.user.id;

        if (status === 'Delivered') {
             // Find the donor and add 10 credits
             const donorUser = await User.findById(listing.donor);
             if (donorUser) {
                 donorUser.credits += 10;
                 await donorUser.save();
                 console.log(`🌟 Added 10 credits to donor: ${donorUser.name}`);
                 console.log("❌ ERROR: Donor not found for credit update.");
             }
        }

        if (status === 'Claimed') {
            listing.claimedBy = req.user.id;
        } 
        else if (status === 'In Transit') {
            listing.collectedBy = req.user.id;
        }
        else if (status === 'Cancelled' && reason) {
            listing.cancellationReason = reason; 
        }

        if (status === 'Claimed') {
             console.log(`📱 [SMS ALERT] To Donor: "Your food ${listing.title} has been claimed by an NGO! Please have it ready."`);
        }
        if (status === 'In Transit') {
             console.log(`📱 [SMS ALERT] To NGO: "A volunteer has picked up ${listing.title}. It is on the way!"`);
        }
        if (status === 'Delivered') {
             console.log(`📱 [SMS ALERT] To Donor: "Great news! Your donation has reached its destination."`);
        }

        await listing.save();
        res.json(listing);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 6. RATE DONATION & AUTO-BAN LOGIC
// ==========================================
// @route   PUT /api/listings/:id/rate
router.put('/:id/rate', async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        
        let listing = await FoodListing.findById(req.params.id);
        if (!listing) return res.status(404).json({ msg: 'Listing not found' });

        listing.rating = rating;
        if (feedback) listing.feedback = feedback;

        await listing.save();

        // Check if Donor needs banning
        if (listing.donor) {
            const donorId = listing.donor; 
            const donorListings = await FoodListing.find({ donor: donorId, rating: { $gt: 0 } });
            
            if (donorListings.length > 0) {
                const totalRating = donorListings.reduce((sum, item) => sum + item.rating, 0);
                const avgRating = totalRating / donorListings.length;

                if (donorListings.length >= 3 && avgRating < 2.0) {
                    await User.findByIdAndUpdate(donorId, { isBanned: true });
                    console.log(`User ${donorId} has been banned due to low rating: ${avgRating}`);
                }
            }
        }
        
        res.json(listing);
    } catch (err) {
        console.error("Rate Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// ... Add this NEW ROUTE at the end of the file ...

// @route   POST /api/listings/:id/report
// @desc    Report a listing for safety issues
router.post('/:id/report', auth, async (req, res) => {
    try {
        const { reason } = req.body;
        const listing = await FoodListing.findById(req.params.id);
        
        if (!listing) return res.status(404).json({ msg: 'Listing not found' });

        // Add report
        listing.reports.unshift({
            reportedBy: req.user.id,
            reason: reason
        });

        await listing.save();
        res.json({ msg: 'Report submitted. Admin will review.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;