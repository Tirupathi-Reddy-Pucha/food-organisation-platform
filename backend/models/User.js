import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Donor', 'NGO', 'Volunteer', 'Admin'], default: 'Donor' },

  // Contact Info
  phone: { type: String, default: '' },
  address: { type: String, default: '' },

  // Verification & Status
  verificationDocument: { type: String, default: '' },
  ngoRegNumber: { type: String },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },

  // --- FIX: THIS IS THE FIELD YOU NEED ---
  isAvailable: { type: Boolean, default: false },
  isTrained: { type: Boolean, default: false },
  credits: { type: Number, default: 0 },
  servedGroups: { type: String, default: 'General' },

  ngoCapacity: {
    fridge: { type: String, default: '' },
    dryStorage: { type: String, default: '' }
  },

  // Settings
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },

  date: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);