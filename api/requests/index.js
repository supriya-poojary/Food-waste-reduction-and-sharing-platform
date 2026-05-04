import dbConnect from '../../lib/db.js';
import Request from '../../lib/models/Request.js';
import FoodItem from '../../lib/models/FoodItem.js';
import { getAuthUser } from '../../lib/auth.js';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const auth = getAuthUser(req);
      if (!auth) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const requests = await Request.find({ requesterId: auth.id }).sort({ createdAt: -1 });
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
        foodId,
        requesterId: auth.id,
        status: 'pending',
        createdAt: new Date(),
      });

      // Update food status
      await FoodItem.findByIdAndUpdate(foodId, { status: 'requested' });

      res.status(201).json(newRequest);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
