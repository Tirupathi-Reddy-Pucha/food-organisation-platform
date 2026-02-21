import express from 'express';
import auth from '../middlewares/auth.js';
import FoodNeed from '../models/FoodNeed.js';
import User from '../models/User.js';
import { checkMatchesForNeed } from '../utils/matchingEngine.js';

const router = express.Router();

// @route   GET /api/food-needs
// @desc    Get all open food needs
router.get('/', async (req, res) => {
    try {
        const needs = await FoodNeed.find({ status: 'Open' })
            .populate('ngo', 'name phone address')
            .sort({ createdAt: -1 });
        res.json(needs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/food-needs/my
// @desc    Get current NGO's food needs
router.get('/my', auth, async (req, res) => {
    try {
        const needs = await FoodNeed.find({ ngo: req.user.id })
            .sort({ createdAt: -1 });
        res.json(needs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/food-needs
// @desc    Create a food need (NGO only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'NGO') {
            return res.status(403).json({ msg: 'Only NGOs can post food needs.' });
        }

        const { title, description, category, quantity, unit, urgency, isPerishable, lat, lng } = req.body;

        const newNeed = new FoodNeed({
            ngo: req.user.id,
            title,
            description,
            category,
            quantity,
            unit,
            urgency,
            isPerishable,
            location: { lat, lng }
        });

        const need = await newNeed.save();

        // Trigger matching engine
        await checkMatchesForNeed(need);

        res.json(need);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/food-needs/:id
// @desc    Cancel/Delete a food need
router.delete('/:id', auth, async (req, res) => {
    try {
        const need = await FoodNeed.findById(req.params.id);
        if (!need) return res.status(404).json({ msg: 'Need not found' });

        if (need.ngo.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await need.deleteOne();
        res.json({ msg: 'Food need removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
