import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Donor', 'NGO', 'Volunteer'], default: 'Donor' },
  
  // --- NEW FIELDS ---
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  // ------------------

  ngoRegNumber: { type: String },
  createdAt: { type: Date, default: Date.now }, // <--- MAKE SURE THIS IS HERE
  
  isBanned: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

export default mongoose.model('User', UserSchema);