import dbConnect from '../../lib/db.js';
import FoodItem from '../../lib/models/FoodItem.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const item = await FoodItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
