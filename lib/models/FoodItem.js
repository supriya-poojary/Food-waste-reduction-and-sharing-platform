import mongoose from 'mongoose';

const FoodItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  location: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorName: { type: String, required: true },
  donorAvatar: { type: String },
  status: { type: String, enum: ['available', 'claimed', 'requested', 'completed', 'expired'], default: 'available' },
  image: { type: String },
  price: { type: Number, default: 0 }, // 0 means free/donation
  tags: [{ type: String }],
  postedAt: { type: Date, default: Date.now },
  servings: { type: Number },
  isVeg: { type: Boolean, default: true },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  claimExpiresAt: { type: Date, default: null },
});

// Indexes for matching performance
FoodItemSchema.index({ status: 1, expiryDate: 1 });
FoodItemSchema.index({ lat: 1, lng: 1 });
FoodItemSchema.index({ postedAt: -1 });

FoodItemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.FoodItem || mongoose.model('FoodItem', FoodItemSchema);
