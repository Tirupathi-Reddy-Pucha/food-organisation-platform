import FoodListing from '../models/FoodListing.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Check if a donor should be banned based on their ratings
 * Criteria:
 * 1. Average rating < 2.0
 * 2. Last 3 consecutive ratings all < 2.0
 * 
 * @param {String} donorId - The donor's user ID
 * @returns {Promise<Object>} { shouldBan: Boolean, reason: String }
 */
export async function checkBanCriteria(donorId) {
    try {
        // 1. Calculate average rating
        const avgStats = await FoodListing.aggregate([
            { $match: { donor: new mongoose.Types.ObjectId(donorId), status: 'Delivered' } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: { $cond: [{ $gt: ["$rating", 0] }, "$rating", null] } }
                }
            }
        ]);

        const avgRating = avgStats.length > 0 && avgStats[0].avgRating ? avgStats[0].avgRating : null;

        // Check if average rating is below threshold
        if (avgRating !== null && avgRating < 2.0) {
            return { shouldBan: true, reason: 'Low Average Rating' };
        }

        // 2. Get last 3 rated deliveries
        const recentRatings = await FoodListing.find({
            donor: new mongoose.Types.ObjectId(donorId),
            status: 'Delivered',
            rating: { $exists: true, $gt: 0 }
        })
            .sort({ createdAt: -1 })
            .limit(3)
            .select('rating');

        // Check if we have at least 3 ratings and all are below 2.0
        if (recentRatings.length >= 3) {
            const allLow = recentRatings.every(listing => listing.rating < 2.0);
            if (allLow) {
                return { shouldBan: true, reason: 'Consecutive Low Ratings' };
            }
        }

        return { shouldBan: false, reason: '' };
    } catch (err) {
        console.error('Error checking ban criteria:', err);
        return { shouldBan: false, reason: '' };
    }
}

/**
 * Apply ban to a user
 * @param {String} userId - The user ID to ban
 * @param {String} reason - The reason for the ban
 */
export async function applyBan(userId, reason) {
    try {
        await User.findByIdAndUpdate(userId, {
            isBanned: true,
            banReason: reason,
            bannedAt: new Date()
        });
        console.log(`✅ User ${userId} banned. Reason: ${reason}`);
    } catch (err) {
        console.error('Error applying ban:', err);
    }
}

/**
 * Check and apply ban if criteria are met
 * @param {String} donorId - The donor's user ID
 */
export async function checkAndApplyBan(donorId) {
    const { shouldBan, reason } = await checkBanCriteria(donorId);
    if (shouldBan) {
        await applyBan(donorId, reason);
    }
}
