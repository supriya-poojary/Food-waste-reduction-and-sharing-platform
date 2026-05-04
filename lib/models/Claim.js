import mongoose from 'mongoose';

const ClaimSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
  claimerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimerName: { type: String, required: true },
  claimerAvatar: { type: String },
  status: { type: String, enum: ['active', 'completed', 'expired', 'cancelled'], default: 'active' },
  claimedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }, // claimedAt + 2 hours
  pickedUpAt: { type: Date },
  notes: { type: String },
});

// Index for fast expiry queries
ClaimSchema.index({ expiresAt: 1, status: 1 });
ClaimSchema.index({ foodId: 1, status: 1 });
ClaimSchema.index({ claimerId: 1 });

// Virtual id
ClaimSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Claim || mongoose.model('Claim', ClaimSchema);
