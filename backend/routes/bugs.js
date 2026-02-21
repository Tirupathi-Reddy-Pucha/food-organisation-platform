import express from 'express';
import BugReport from '../models/BugReport.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// @route   POST api/bugs
// @desc    Report a bug
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ msg: 'Please provide a bug description' });
        }

        const newBug = new BugReport({
            reporter: req.user.id,
            description
        });

        const bug = await newBug.save();
        res.json(bug);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/bugs
// @desc    Get all bug reports (Admin only)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const bugs = await BugReport.find().populate('reporter', 'name email').sort({ createdAt: -1 });
        res.json(bugs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
