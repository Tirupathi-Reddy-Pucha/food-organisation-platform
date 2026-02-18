import mongoose from 'mongoose';

const FoodListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  category: { type: String, enum: ['Cooked', 'Raw', 'Bakery', 'Cooked Meal', 'Raw Ingredients', 'Bakery Item'], default: 'Cooked' },

  // Expiry & Safety
  expiry_hours: { type: Number, required: true },
  image: { type: String, default: '' }, // Stores the photo URL
  dietaryType: { type: String, enum: ['Veg', 'Non-Veg', 'Vegan'], default: 'Veg' },
  requiresRefrigeration: { type: Boolean, default: false },
  isFresh: { type: Boolean, default: false },
  isHygienic: { type: Boolean, default: false },
  hasAllergens: { type: Boolean, default: false },
  temperature: { type: String, enum: ['Hot', 'Cold'], default: 'Hot' },
  location: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
  reports: [{ reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reason: String, createdAt: { type: Date, default: Date.now } }],
  allergens: { type: [String], default: [] },
  handlingInstructions: { type: String, default: '' },
  containerType: { type: String, enum: ['Disposable', 'Returnable'], default: 'Disposable' },
  pickupNote: { type: String, default: '' },

  // Relations
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Status
  status: {
    type: String,
    enum: ['Available', 'Claimed', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Available'
  },

  // NEW: Reason for cancellation (Task 2.4.1)
  cancellationReason: { type: String },

  // NEW: QR Verification Workflow
  isReadyForPickup: { type: Boolean, default: false },
  pickupProof: { type: String }, // URL of the photo taken by volunteer

  // Rating
  rating: { type: Number, default: 0 },
  feedback: { type: String },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('FoodListing', FoodListingSchema);