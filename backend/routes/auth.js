import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middlewares/auth.js'; // Import auth middleware
import dotenv from 'dotenv';
import FoodListing from '../models/FoodListing.js';

dotenv.config();
const router = express.Router();

// @route   POST /api/auth/register
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        // ADDED: ngoRegNumber to destructuring
        const { name, email, password, role, phone, address, ngoRegNumber } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ 
            name, 
            email, 
            password, 
            role,
            phone,
            address,
            ngoRegNumber // ADDED: Save to DB
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, role: user.role, phone: user.phone, address: user.address } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
            if (err) throw err;
            // Send phone/address back too so we can fill the edit form
            res.json({ token, user: { id: user.id, name: user.name, role: user.role, phone: user.phone, address: user.address } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/auth/update
// @desc    Update user profile (Name, Phone, Address)
// --- NEW ROUTE ADDED HERE ---
router.put('/update', auth, async (req, res) => {
    const { name, phone, address } = req.body;
    try {
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Update fields if provided
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        await user.save();

        res.json({ 
            id: user.id, 
            name: user.name, 
            role: user.role, 
            phone: user.phone, 
            address: user.address 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/delete', auth, async (req, res) => {
    try {
        // 1. Delete all listings posted by this user
        await FoodListing.deleteMany({ donor: req.user.id });

        // 2. Delete the user profile
        await User.findByIdAndDelete(req.user.id);

        res.json({ msg: 'Account and all data deleted successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;