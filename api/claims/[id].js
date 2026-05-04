import dbConnect from '../../lib/db.js';
import FoodItem from '../../lib/models/FoodItem.js';
import Claim from '../../lib/models/Claim.js';
import { getAuthUser } from '../../lib/auth.js';

export default async function handler(req, res) {
  const { id } = req.query; // claim ID
  await dbConnect();
  const auth = getAuthUser(req);
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'PUT') {
    const { action } = req.body; // 'cancel' | 'complete'
    try {
      const claim = await Claim.findById(id);
      if (!claim) return res.status(404).json({ message: 'Claim not found' });
      if (claim.claimerId.toString() !== auth.id) return res.status(403).json({ message: 'Forbidden' });

      if (action === 'cancel') {
        claim.status = 'cancelled';
        await claim.save();
        await FoodItem.findByIdAndUpdate(claim.foodId, {
          status: 'available',
          claimedBy: null,
          claimExpiresAt: null,
        });
        return res.status(200).json({ message: 'Claim cancelled, food is available again' });
      }

      if (action === 'complete') {
        claim.status = 'completed';
        claim.pickedUpAt = new Date();
        await claim.save();
        await FoodItem.findByIdAndUpdate(claim.foodId, { status: 'completed' });
        return res.status(200).json({ message: 'Food picked up! Thank you for reducing waste.' });
      }

      return res.status(400).json({ message: 'Invalid action' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
