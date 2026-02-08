import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; 
import User from './models/User.js'; 
import connectDB from './config/db.js'; 

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        // 1. Check if Admin already exists
        const adminExists = await User.findOne({ email: "admin@foodconnect.com" });
        if (adminExists) {
            console.log("⚠️ Admin already exists.");
            process.exit();
        }

        // 2. Hash the Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt); // <--- CHANGE PASSWORD HERE

        // 3. Create the Admin
        const adminUser = new User({
            name: "Super Admin",
            email: "admin@foodconnect.com",
            password: hashedPassword,
            role: "Admin",
            phone: "9999999999",
            address: "Headquarters",
            isVerified: true
        });

        await adminUser.save();
        console.log("✅ Super Admin created!");
        console.log("📧 Login: admin@foodconnect.com");
        console.log("🔑 Pass: admin123");
        
        process.exit();
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

seedAdmin();