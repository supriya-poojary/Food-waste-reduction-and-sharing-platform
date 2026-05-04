import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['none', 'pending', 'paid'], default: 'none' },
  orderStatus: { type: String, enum: ['accepted', 'in_progress', 'completed', 'cancelled'], default: 'accepted' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
