import dbConnect from '../../lib/db.js';
import Request from '../../lib/models/Request.js';
import FoodItem from '../../lib/models/FoodItem.js';
import User from '../../lib/models/User.js';
import { getAuthUser } from '../../lib/auth.js';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const auth = getAuthUser(req);
      if (!auth) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { type } = req.query;

      if (type === 'incoming') {
        // Find food items owned by this donor
        const myItems = await FoodItem.find({ donorId: auth.id }).select('_id');
        const itemIds = myItems.map(item => item._id);
        
        // Find requests for these items
        const requests = await Request.find({ foodId: { $in: itemIds } })
          .populate('foodId')
          .sort({ createdAt: -1 });
        return res.status(200).json(requests);
      }

      // Default: outgoing requests
      const requests = await Request.find({ requesterId: auth.id })
        .populate('foodId')
        .sort({ createdAt: -1 });
      res.status(200).json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const auth = getAuthUser(req);
      if (!auth) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { foodId, ...rest } = req.body;

      const newRequest = await Request.create({
        ...rest,
        ...(foodId && { foodId }),
        requesterId: auth.id,
        status: 'pending',
        createdAt: new Date(),
      });

      // Update food status only if it's a specific request
      if (foodId) {
        await FoodItem.findByIdAndUpdate(foodId, { status: 'requested' });
      }

      // Update user's requestsCount
      await User.findByIdAndUpdate(auth.id, { $inc: { requestsCount: 1 } });

      res.status(201).json(newRequest);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
