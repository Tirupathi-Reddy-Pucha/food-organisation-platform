import express from 'express';
import FoodListing from '../models/FoodListing.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/stats/
// @desc    Global Platform Stats (Don't count Cancelled items!)
router.get('/', async (req, res) => {
    try {
        // 1. Count listings that are NOT Cancelled
        const totalDonations = await FoodListing.countDocuments({ status: { $ne: 'Cancelled' } });

        // 2. Calculate savings (Assuming avg 0.5kg per meal and 2.5kg CO2 per kg food)
        // We aggregate only Valid donations
        const result = await FoodListing.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } }, // <--- FILTER: Ignore Cancelled
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

        res.json({ total_donations: totalDonations, meals_saved: mealsSaved, co2_saved: co2Saved });
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
        const matchStage = { status: { $ne: 'Cancelled' } };
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

export default router;