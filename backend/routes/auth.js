import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middlewares/auth.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// ==========================================
// 1. REGISTER USER
// ==========================================
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
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
            ngoRegNumber
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        console.log(`📧 New User Registered: ${email}`);

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, role: user.role, credits: user.credits, isAvailable: user.isAvailable } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 2. LOGIN USER
// ==========================================
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Auto-fix Admin role if needed
        if (email.toLowerCase() === 'admin@foodconnect.com' && user.role !== 'Admin') {
            user.role = 'Admin';
            await user.save();
        }

        if (user.isBanned) return res.status(403).json({ msg: '🚫 Your account has been banned.' });

        // Auto-reactivate if account was deactivated
        if (user.isActive === false) {
            user.isActive = true;
            await user.save();
            console.log(`♻️ Account Reactivated: ${email}`);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            // Send back all necessary fields
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                    isVerified: user.isVerified,
                    isTrained: user.isTrained,
                    isAvailable: user.isAvailable, // <--- Important for Volunteer Toggle
                    credits: user.credits,
                    servedGroups: user.servedGroups,
                    ngoCapacity: user.ngoCapacity,
                    notifications: user.notifications,
                    verificationDocument: user.verificationDocument
                }
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 3. GET CURRENT USER
// ==========================================
// @route   GET /api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 4. UPDATE PROFILE
// ==========================================
// @route   PUT /api/auth/update
router.put('/update', auth, async (req, res) => {
    try {
        const {
            name, phone, address, ngoCapacity, notifications, verificationDocument,
            isAvailable, servedGroups // <--- Extract isAvailable
        } = req.body;

        // 1. Find User First
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // 2. Update Fields Manually
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (ngoCapacity) user.ngoCapacity = ngoCapacity;
        if (servedGroups) user.servedGroups = servedGroups;
        if (notifications) user.notifications = notifications;
        if (verificationDocument) user.verificationDocument = verificationDocument;

        // 3. Update Boolean Toggle (Check undefined because false is a valid value)
        if (isAvailable !== undefined) {
            user.isAvailable = isAvailable;
        }

        // 4. Save
        await user.save();

        res.json(user);
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 5. ADMIN ROUTES
// ==========================================

// @route   GET /api/auth/all-users
router.get('/all-users', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ msg: "Access Denied" });
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/auth/verify/:id
router.put('/verify/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ msg: "Access Denied" });

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 6. VOLUNTEER TRAINING
// ==========================================
// @route   PUT /api/auth/train
router.put('/train', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { isTrained: true },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 7. ACCOUNT MANAGEMENT
// ==========================================

// @route   PUT /api/auth/deactivate
router.put('/deactivate', auth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { isActive: false });
        res.json({ msg: "Account Deactivated" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/auth/delete
router.delete('/delete', auth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ msg: "User Deleted" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// ==========================================
// ADMIN: UNBAN USER
// ==========================================
// @route   PUT /api/auth/admin/unban/:userId
router.put('/admin/unban/:userId', auth, async (req, res) => {
    try {
        // Check if requester is admin
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ msg: 'Access Denied. Admin only.' });
        }

        const userId = req.params.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Unban the user
        await User.findByIdAndUpdate(userId, {
            isBanned: false,
            banReason: '',
            bannedAt: null
        });

        console.log(` Admin ${req.user.id} unbanned user ${userId}`);
        res.json({ msg: 'User has been unbanned successfully', user: { id: user.id, name: user.name } });
    } catch (err) {
        console.error('Unban Error:', err);
        res.status(500).send('Server Error');
    }
});

export default router;
