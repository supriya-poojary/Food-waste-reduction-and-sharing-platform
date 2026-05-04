import dbConnect from '../../lib/db.js';
import FoodItem from '../../lib/models/FoodItem.js';
import { getAuthUser } from '../../lib/auth.js';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { category, search, status, isVeg } = req.query;
      let query = {};

      if (category && category !== 'all') query.category = category;
      if (status) query.status = status;
      if (isVeg !== undefined) query.isVeg = isVeg === 'true';
      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [
          { title: regex },
          { description: regex },
          { location: regex },
          { tags: { $in: [regex] } },
        ];
      }

      const items = await FoodItem.find(query).sort({ postedAt: -1 });
      res.status(200).json(items);
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

      const newItem = await FoodItem.create({
        ...req.body,
        donorId: auth.id,
        status: 'available',
        postedAt: new Date(),
      });

      res.status(201).json(newItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
