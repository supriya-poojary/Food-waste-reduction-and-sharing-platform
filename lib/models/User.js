import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  bio: { type: String },
  location: { type: String },
  phone: { type: String },
  joinedAt: { type: Date, default: Date.now },
  donationsCount: { type: Number, default: 0 },
  requestsCount: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  badges: [{ type: String }],
  role: { type: String, enum: ['donor', 'requester'], default: 'requester' },
});

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
