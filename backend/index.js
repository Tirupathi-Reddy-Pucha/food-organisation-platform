import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Route Files
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import statsRoutes from './routes/stats.js';
import uploadRoutes from './routes/upload.js';
import bugRoutes from './routes/bugs.js';
import notificationRoutes from './routes/notifications.js';
import foodNeedRoutes from './routes/foodNeeds.js';

dotenv.config();

const app = express();

// 1. Connect Database (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// 2. Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

// 3. Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/food-needs', foodNeedRoutes);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

export default app;