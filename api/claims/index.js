import dbConnect from '../../lib/db.js';
import FoodItem from '../../lib/models/FoodItem.js';
import Claim from '../../lib/models/Claim.js';
import { getAuthUser } from '../../lib/auth.js';

export default async function handler(req, res) {
  await dbConnect();
  const auth = getAuthUser(req);

  if (req.method === 'POST') {
    // Claim a food item
    if (!auth) return res.status(401).json({ message: 'Please login to claim food' });

    try {
      const { foodId, notes } = req.body;

      // Check food exists and is available
      const food = await FoodItem.findById(foodId);
      if (!food) return res.status(404).json({ message: 'Food item not found' });
      if (food.status !== 'available') {
        return res.status(409).json({ message: 'This food has already been claimed' });
      }

      // Check user hasn't already claimed this
      const existing = await Claim.findOne({ foodId, claimerId: auth.id, status: 'active' });
      if (existing) return res.status(409).json({ message: 'You have already claimed this item' });

      const claimedAt = new Date();
      const expiresAt = new Date(claimedAt.getTime() + 2 * 60 * 60 * 1000); // 2 hours

      // Create claim
      const claim = await Claim.create({
        foodId,
        claimerId: auth.id,
        claimerName: auth.name || 'User',
        claimerAvatar: auth.avatar || auth.name?.[0] || 'U',
        status: 'active',
        claimedAt,
        expiresAt,
        notes: notes || '',
      });

      // Lock the food item
      await FoodItem.findByIdAndUpdate(foodId, {
        status: 'claimed',
        claimedBy: auth.id,
        claimExpiresAt: expiresAt,
      });

      res.status(201).json({ claim, expiresAt });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'GET') {
    // Get user's active claims
    if (!auth) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const claims = await Claim.find({ claimerId: auth.id })
        .populate('foodId')
        .sort({ claimedAt: -1 });
      res.status(200).json(claims);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
