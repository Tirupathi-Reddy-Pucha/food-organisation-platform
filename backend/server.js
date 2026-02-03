import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import statsRoutes from './routes/stats.js'; // <--- The new Stats Route

// Load environment variables from .env file
dotenv.config();

// Initialize Express App
const app = express();

// Middleware
app.use(cors()); // Allow Frontend to talk to Backend
app.use(express.json()); // Allow Backend to read JSON data

// Define Routes
app.use('/api/auth', authRoutes);       // Login & Register
app.use('/api/listings', listingRoutes); // Food Donations & Logistics
app.use('/api/stats', statsRoutes);      // Dashboard & Leaderboard

// Database Connection
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("✅ MongoDB Connected...");
    // Start Server only after DB connects
    app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
}).catch(err => {
    console.log("❌ Database Connection Error:", err);
});