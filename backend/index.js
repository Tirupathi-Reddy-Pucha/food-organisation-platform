import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Route Files
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import statsRoutes from './routes/stats.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();

// 1. Connect Database
connectDB();

// 2. Middleware
app.use(express.json()); 
app.use(cors()); 

// 3. Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));