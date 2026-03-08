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
    const { coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
        return res.status(400).json({ message: 'At least two coordinates are required' });
    }

    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'OpenRouteService API key is not configured' });
    }

    try {
        // ORS Optimization API (VRP)
        // https://openrouteservice.org/dev/#/api-docs/optimization/post

        // Prepare jobs for ORS
        const jobs = coordinates.map((coord, index) => ({
            id: index + 1,
            location: [coord.lng, coord.lat], // ORS uses [lng, lat]
            service: 120 // mock service time in seconds
        }));

        // We assume the first point is the start and end (Return to base)
        // Or we can define a separate vehicle with start/end
        const vehicle = {
            id: 1,
            profile: 'driving-car',
            start: [coordinates[0].lng, coordinates[0].lat],
            end: [coordinates[0].lng, coordinates[0].lat]
        };

        const response = await axios.post('https://api.openrouteservice.org/optimization', {
            jobs,
            vehicles: [vehicle]
        }, {
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });

        const result = response.data;
        console.log('ORS Optimization Summary:', result.summary);

        const optimizedSteps = result.routes[0].steps;
        const optimizedCoords = optimizedSteps.map(step => {
            if (step.type === 'job') {
                return coordinates[step.id - 1];
            }
            return coordinates[0]; // start/end
        });

        // Get the full polyline for the optimized route
        const directionsResponse = await axios.post('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
            coordinates: optimizedCoords.map(c => [c.lng, c.lat])
        }, {
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });

        const dirData = directionsResponse.data;
        const dirSummary = dirData.features?.[0]?.properties?.summary || {};
        console.log('ORS Directions Summary:', dirSummary);

        // Fallback: If optimization result distance is missing, use directions distance
        const finalDistance = result.summary.distance || dirSummary.distance || 0;
        const finalDuration = result.summary.duration || dirSummary.duration || 0;

        res.json({
            summary: result.summary,
            optimizedSequence: result.routes[0].steps,
            geojson: dirData,
            totalDistance: finalDistance,
            totalDuration: finalDuration
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
