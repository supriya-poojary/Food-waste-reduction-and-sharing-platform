import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterName: { type: String, required: true },
  
  // Fields for general requests
  type: { type: String, default: 'general' },
  name: { type: String },
  phone: { type: String },
  location: { type: String },
  foodType: { type: String },
  peopleCount: { type: Number },
  urgency: { type: String },
  description: { type: String },
  dietaryRestrictions: { type: String },
  preferredPickupTime: { type: Date },

  message: { type: String },
  pickupDetails: { type: String }, // Collection instructions from donor
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Request || mongoose.model('Request', RequestSchema);
