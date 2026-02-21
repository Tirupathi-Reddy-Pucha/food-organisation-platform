import mongoose from 'mongoose';

const FoodNeedSchema = new mongoose.Schema({
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['Cooked', 'Raw', 'Bakery', 'Cooked Meal', 'Raw Ingredients', 'Bakery Item'], required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    urgency: { type: String, enum: ['Standard', 'Urgent', 'Immediate'], default: 'Standard' },
    isPerishable: { type: Boolean, default: false },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    status: { type: String, enum: ['Open', 'Fulfilled', 'Cancelled'], default: 'Open' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('FoodNeed', FoodNeedSchema);
