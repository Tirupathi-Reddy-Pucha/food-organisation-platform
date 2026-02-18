import express from 'express';
import mongoose from 'mongoose';
import FoodListing from '../models/FoodListing.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/stats/
// @desc    Global Platform Stats (Don't count Cancelled items!)
router.get('/', async (req, res) => {
    try {
        // 1. Count listings that are NOT Cancelled
        const totalDonations = await FoodListing.countDocuments({ status: 'Delivered' });

        // 2. Calculate savings (Assuming avg 0.5kg per meal and 2.5kg CO2 per kg food)
        // We aggregate only Delivered donations for true impact
        const result = await FoodListing.aggregate([
            { $match: { status: 'Delivered' } },
            {
                $group: {
                    _id: null,
                    totalQty: { $sum: "$quantity" }
                }
            }
        ]);

        const totalKg = result.length > 0 ? result[0].totalQty : 0;

        // Formulas: 
        // 1 meal ≈ 0.4 kg
        // 1 kg food waste ≈ 2.5 kg CO2
        const mealsSaved = Math.floor(totalKg / 0.4);
        const co2Saved = Math.floor(totalKg * 2.5);
        const waterSaved = mealsSaved * 800; // 800L per meal saved

        res.json({ total_donations: totalDonations, meals_saved: mealsSaved, co2_saved: co2Saved, water_saved: waterSaved });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/stats/leaderboard
// @desc    Get Top 5 Donors (Exclude Cancelled Donations)
router.get('/leaderboard', async (req, res) => {
    try {
        const { type } = req.query; // 'donors' or 'volunteers'

        // 1. Determine Match and Group fields based on type
        // Both leaderboards only count Delivered items for verified impact
        const matchStage = { status: 'Delivered' };
        let groupField = "$donor";

        if (type === 'volunteers') {
            matchStage.collectedBy = { $exists: true, $ne: null };
            matchStage.status = 'Delivered'; // Volunteers only get credit for completed work
            groupField = "$collectedBy";
        }

        const leaderboard = await FoodListing.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: groupField,
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 3 } // Restrict to top 3
        ]);

        const populatedLeaderboard = await User.populate(leaderboard, { path: "_id", select: "name" });

        const formatted = populatedLeaderboard.map(item => ({
            name: item._id ? item._id.name : "Unknown",
            count: item.count
        }));

        res.json(formatted);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/stats/user/:id
// @desc    Get stats for a specific donor (Deliveries & Avg Rating)
router.get('/user/:id', async (req, res) => {
    try {

        // Ensure ID is valid before using it
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: 'Invalid Donor ID format' });
        }

        const donorId = new mongoose.Types.ObjectId(req.params.id);

        const stats = await FoodListing.aggregate([
            { $match: { donor: donorId } },
            {
                $group: {
                    _id: null,
                    totalDeliveries: {
                        $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] }
                    },
                    avgRating: {
                        $avg: { $cond: [{ $gt: ["$rating", 0] }, "$rating", null] }
                    }
                }
            }
        ]);


        if (stats.length === 0) {
            return res.json({ totalDeliveries: 0, avgRating: 0 });
        }

        res.json({
            totalDeliveries: stats[0].totalDeliveries || 0,
            avgRating: stats[0].avgRating ? parseFloat(stats[0].avgRating.toFixed(1)) : 0
        });
    } catch (err) {
        console.error("📊 User Stats Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;