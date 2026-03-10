import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * @route   POST /api/routing/optimize
 * @desc    Optimize a route for multiple pickup locations
 * @access  Private (or Public depending on your auth setup)
 */
router.post('/optimize', async (req, res) => {
    const { coordinates, preference = 'fastest' } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
        return res.status(400).json({ message: 'At least two coordinates are required' });
    }

    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'OpenRouteService API key is not configured' });
    }

    try {
        // 1. Separate coordinates to enforce Volunteer -> Pickups -> NGOs sequence
        // coordinates[0] is always the volunteer
        const volunteer = coordinates[0];
        const otherCoords = coordinates.slice(1);

        let pickups = otherCoords.filter(c => c.type === 'pickup');
        let ngos = otherCoords.filter(c => c.type === 'ngo');

        // Fallback if frontend didn't supply types (e.g. legacy request)
        if (pickups.length === 0 && ngos.length === 0) {
            pickups = otherCoords;
        }

        // 2. Ordered coordinates: Volunteer -> Pickups -> NGOs
        const orderedCoords = [volunteer, ...pickups, ...ngos];

        // 3. Create mock 'optimizedSequence' for the frontend marker compatibility
        // The frontend expects: { type: 'start' }, { type: 'job', id: X }...
        // Where `id` maps to the ORIGINAL coordinates array index + 1
        const optimizedSequence = [];
        optimizedSequence.push({ type: 'start' });

        orderedCoords.slice(1).forEach((coord) => {
            const originalIndex = coordinates.indexOf(coord);
            optimizedSequence.push({ type: 'job', id: originalIndex + 1 });
        });
        optimizedSequence.push({ type: 'end' }); // Mark end

        // 4. Get the full polyline for the physically sequential route
        const directionsResponse = await axios.post('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
            coordinates: orderedCoords.map(c => [c.lng, c.lat]),
            instructions: true,
            preference: preference === 'eco' ? 'recommended' : preference // 'eco' maps to 'recommended'
        }, {
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });

        const dirData = directionsResponse.data;
        const dirSummary = dirData.features?.[0]?.properties?.summary || {};
        console.log('ORS Sequential Directions Summary:', dirSummary);

        res.json({
            summary: dirSummary,
            optimizedSequence: optimizedSequence,
            geojson: dirData,
            totalDistance: dirSummary.distance || 0,
            totalDuration: dirSummary.duration || 0
        });

    } catch (error) {
        console.error('Routing Error Details:', error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(error.response ? error.response.status : 500).json({
            message: 'Error calculating optimized route',
            error: error.response ? error.response.data : error.message
        });
    }
});

export default router;
