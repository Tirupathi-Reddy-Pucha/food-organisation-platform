import FoodListing from '../models/FoodListing.js';
import FoodNeed from '../models/FoodNeed.js';
import Notification from '../models/Notification.js';
import { calculateDistance } from './haversine.js';

/**
 * Checks for matches when a NEW LISTING is created.
 */
export const checkMatchesForListing = async (listing) => {
    try {
        const openNeeds = await FoodNeed.find({
            status: 'Open',
            category: listing.category
        }).populate('ngo');

        const matches = openNeeds.filter(need => {
            const dist = calculateDistance(
                listing.location.lat,
                listing.location.lng,
                need.location.lat,
                need.location.lng
            );
            return dist <= 5; // 5km proximity
        });

        for (const match of matches) {
            const isPriority = listing.isFresh || match.isPerishable || match.urgency === 'Immediate';
            const priorityPrefix = isPriority ? '🚨 HIGH PRIORITY MATCH: ' : '📍 MATCH FOUND: ';

            // Notify NGO
            await new Notification({
                recipient: match.ngo._id,
                msg: `${priorityPrefix}An item you requested ("${match.title}") was just donated nearby!`,
                type: isPriority ? 'Success' : 'Info'
            }).save();

            // Notify Donor
            await new Notification({
                recipient: listing.donor,
                msg: `${priorityPrefix}Your donation of "${listing.title}" matches a request from ${match.ngo.name} nearby!`,
                type: 'Success'
            }).save();
        }

        return matches.length;
    } catch (err) {
        console.error("Matching engine (listing) error:", err);
        return 0;
    }
};

/**
 * Checks for matches when a NEW NEED is created.
 */
export const checkMatchesForNeed = async (need) => {
    try {
        const availableListings = await FoodListing.find({
            status: 'Available',
            category: need.category
        }).populate('donor');

        const matches = availableListings.filter(listing => {
            const dist = calculateDistance(
                need.location.lat,
                need.location.lng,
                listing.location.lat,
                listing.location.lng
            );
            return dist <= 5;
        });

        for (const match of matches) {
            const isPriority = match.isFresh || need.isPerishable || need.urgency === 'Immediate';
            const priorityPrefix = isPriority ? '🚨 HIGH PRIORITY MATCH: ' : '📍 MATCH FOUND: ';

            // Notify NGO (requester)
            await new Notification({
                recipient: need.ngo,
                msg: `${priorityPrefix}A donation for "${need.title}" is already available nearby!`,
                type: 'Success'
            }).save();

            // Notify Donor
            await new Notification({
                recipient: match.donor._id,
                msg: `${priorityPrefix}Your donation of "${match.title}" matches a new request from an NGO nearby!`,
                type: 'Info'
            }).save();
        }

        return matches.length;
    } catch (err) {
        console.error("Matching engine (need) error:", err);
        return 0;
    }
};
