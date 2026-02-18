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

        // Dietary Type Filter
        if (filterVeg === 'Veg') {
            query.dietaryType = 'Veg';
        } else if (filterVeg === 'Non-Veg') {
            query.dietaryType = 'Non-Veg';
        } else if (filterVeg === 'Vegan') {
            query.dietaryType = 'Vegan';
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
            dietaryType, isVeg, requiresRefrigeration, isFresh, isHygienic,
            hasAllergens, temperature, image,
            // Batch 1 Fields
            allergens, handlingInstructions, containerType, pickupNote,
            // Batch 2 Fields (Location)
            lat, lng
        } = req.body;

        // Backward compatibility for tests/older frontend
        const finalDietaryType = dietaryType || (isVeg ? 'Veg' : 'Non-Veg');

        // Backend Validation
        if (quantity <= 0) return res.status(400).json({ msg: "⚠️ Quantity must be positive." });
        if (expiry_hours <= 0) return res.status(400).json({ msg: "⚠️ Expiry time must be valid." });

        // Check Verification & Ban Status
        const user = await User.findById(req.user.id);
        if (!user.isVerified) {
            return res.status(403).json({ msg: "🔒 Account verification pending. Please wait for admin approval." });
        }
        if (user.isBanned) {
            return res.status(403).json({
                msg: `Your account has been suspended due to ${user.banReason}. Please contact an administrator for assistance.`
            });
        }

        const newListing = new FoodListing({
            title,
            description,
            quantity,
            unit,
            category,
            expiry_hours,
            dietaryType: finalDietaryType,
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
// 3.1 UPDATE LISTING (For Donors)
// ==========================================
// @route   PUT /api/listings/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const {
            title, description, quantity, unit, category, expiry_hours,
            dietaryType, isVeg, requiresRefrigeration, isFresh, isHygienic,
            hasAllergens, temperature, image,
            allergens, handlingInstructions, containerType, pickupNote,
            accessCode, lat, lng
        } = req.body;

        const finalDietaryType = dietaryType || (isVeg ? 'Veg' : 'Non-Veg');

        let listing = await FoodListing.findById(req.params.id);
        if (!listing) return res.status(404).json({ msg: 'Listing not found' });

        // Authorization check
        if (listing.donor.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Only allow edits if status is Available
        if (listing.status !== 'Available') {
            return res.status(400).json({ msg: 'Cannot edit once claimed.' });
        }

        // Update fields
        listing.title = title || listing.title;
        listing.description = description || listing.description;
        listing.quantity = quantity || listing.quantity;
        listing.unit = unit || listing.unit;
        listing.category = category || listing.category;
        listing.expiry_hours = expiry_hours || listing.expiry_hours;
        listing.dietaryType = finalDietaryType || listing.dietaryType;
        listing.requiresRefrigeration = requiresRefrigeration !== undefined ? requiresRefrigeration : listing.requiresRefrigeration;
        listing.isFresh = isFresh !== undefined ? isFresh : listing.isFresh;
        listing.isHygienic = isHygienic !== undefined ? isHygienic : listing.isHygienic;
        listing.hasAllergens = hasAllergens !== undefined ? hasAllergens : listing.hasAllergens;
        listing.temperature = temperature || listing.temperature;
        listing.image = image || listing.image;
        listing.allergens = allergens || listing.allergens;
        listing.handlingInstructions = handlingInstructions || listing.handlingInstructions;
        listing.containerType = containerType || listing.containerType;
        listing.pickupNote = pickupNote || listing.pickupNote;
        listing.accessCode = accessCode || listing.accessCode;

        if (lat && lng) {
            listing.location = { lat: parseFloat(lat), lng: parseFloat(lng) };
        }

        await listing.save();
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

        const isDonor = listing.donor.toString() === req.user.id;
        const isAdmin = req.user.role === 'Admin';

        // Expiry check
        const expiryTime = new Date(listing.createdAt).getTime() + (listing.expiry_hours * 60 * 60 * 1000);
        const isExpired = Date.now() > expiryTime;
        const isReported = listing.reports && listing.reports.length > 0;

        if (!isDonor && !isAdmin) {
            return res.status(401).json({ msg: 'User not authorized.' });
        }

        // Admin specifically needs reported or expired status
        if (isAdmin && !isReported && !isExpired) {
            return res.status(403).json({ msg: 'Admins can only delete reported or expired items.' });
        }

        // Donor can only delete if still Available OR if it's expired
        if (isDonor && !isAdmin && listing.status !== 'Available' && !isExpired) {
            return res.status(400).json({ msg: 'Cannot delete. Item has already been claimed and is not yet expired.' });
        }

        await listing.deleteOne();
        res.json({ msg: 'Listing removed' });
    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
});

// ==========================================
// 5. UPDATE STATUS (Claim/Pickup/Deliver)
// ==========================================
// @route   PUT /api/listings/:id/status
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status, reason, pickupProof } = req.body;
        let listing = await FoodListing.findById(req.params.id);

        if (!listing) return res.status(404).json({ msg: 'Listing not found' });

        // Check verification for critical actions
        const user = await User.findById(req.user.id);
        if (!user.isVerified) {
            return res.status(403).json({ msg: "🔒 Account verification pending. Please wait for admin approval." });
        }

        // Logic for Donor marking it as Ready for Pickup
        if (status === 'ReadyToPickup') {
            if (listing.donor.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'Only the donor can mark this as ready.' });
            }
            listing.isReadyForPickup = true;
            console.log(`📡 [SMS ALERT] To Volunteer/NGO: "Food ${listing.title} is ready for pickup! Generate QR now."`);
        }

        if (status === 'Cancelled') listing.cancellationReason = reason;
        if (status === 'Claimed') listing.claimedBy = req.user.id;

        // Volunteer picking up with photo proof
        if (status === 'In Transit') {
            if (req.user.role === 'Volunteer' && !pickupProof) {
                return res.status(400).json({ msg: "⚠️ Pickup requires photo proof of QR code." });
            }
            listing.collectedBy = req.user.id;
            if (pickupProof) listing.pickupProof = pickupProof;
        }

        if (status === 'Delivered' && listing.status !== 'Delivered') {
            // 1. Reward Donor
            const updatedDonor = await User.findByIdAndUpdate(listing.donor, { $inc: { credits: 10 } }, { new: true });
            if (updatedDonor) console.log(`🌟 Donor Credits: ${updatedDonor.credits}`);

            // 2. Reward Volunteer (if exists)
            if (listing.collectedBy) {
                const updatedVol = await User.findByIdAndUpdate(listing.collectedBy, { $inc: { credits: 10 } }, { new: true });
                if (updatedVol) console.log(`🌟 Volunteer Credits: ${updatedVol.credits}`);
            }

            // 3. Reward NGO (Claimer)
            if (listing.claimedBy) {
                const updatedNGO = await User.findByIdAndUpdate(listing.claimedBy, { $inc: { credits: 10 } }, { new: true });
                if (updatedNGO) console.log(`🌟 NGO Credits: ${updatedNGO.credits}`);
            }
        }

        // Final status update
        if (status !== 'ReadyToPickup') {
            listing.status = status;
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
        console.error("STATUS UPDATE ERROR:", err);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
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

        // ✨ Auto-ban check after rating submission
        if (listing.donor) {
            const { checkAndApplyBan } = await import('../utils/banCheck.js');
            await checkAndApplyBan(listing.donor.toString());
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
