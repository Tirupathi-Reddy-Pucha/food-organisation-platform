import express from 'express';
import auth from '../middlewares/auth.js';
import FoodListing from '../models/FoodListing.js';
import User from '../models/User.js';

const router = express.Router();

// ==========================================
// 1. GET ALL LISTINGS (With Search & Filters)
// ==========================================
// @route   GET /api/listings
router.get('/', async (req, res) => {
    try {
        const { search, category, filterVeg } = req.query;

        let query = {};
        
        // Search Logic (Title or Description)
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
            // 👇 CRITICAL: Fetches 'createdAt' for the New Donor Badge
            .populate('donor', 'name phone address createdAt') 
            // 👇 CRITICAL: Fetches 'ngoRegNumber' for the Verified Tick
            .populate('claimedBy', 'name phone address ngoRegNumber')
            .populate('collectedBy', 'name phone address');

        // Smart Expiry Logic (Filter out expired items mostly)
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
// 2. GET USER HISTORY
// ==========================================
// @route   GET /api/listings/user/:id
router.get('/user/:id', async (req, res) => {
    try {
        const listings = await FoodListing.find({ donor: req.params.id })
            .sort({ date: -1 })
            .populate('donor', 'name phone address createdAt')
            .populate('claimedBy', 'name phone address ngoRegNumber')
            .populate('collectedBy', 'name phone address');
            
        res.json(listings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 3. CREATE LISTING
// ==========================================
// @route   POST /api/listings
router.post('/', auth, async (req, res) => {
    try {
        const { 
            title, description, quantity, unit, category, expiry_hours,
            isVeg, requiresRefrigeration, isFresh, isHygienic, 
            hasAllergens, temperature 
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

        // Ensure user owns the listing
        if (listing.donor.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Prevent deleting active orders
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
        const { status, reason } = req.body; // Added 'reason'
        let listing = await FoodListing.findById(req.params.id);
        
        if (!listing) return res.status(404).json({ msg: 'Listing not found' });

        listing.status = status;

        if (status === 'Claimed') {
            listing.claimedBy = req.user.id;
        } 
        else if (status === 'In Transit') {
            listing.collectedBy = req.user.id;
        }
        else if (status === 'Cancelled' && reason) {
            listing.cancellationReason = reason; // Save the reason
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

        // Check if Donor needs banning (Avg Rating < 2 after 3 ratings)
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

export default router;