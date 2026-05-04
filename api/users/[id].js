import dbConnect from '../../lib/db.js';
import User from '../../lib/models/User.js';
import { getAuthUser } from '../../lib/auth.js';

export default async function handler(req, res) {
  const { id } = req.query;
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const user = await User.findById(id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const auth = getAuthUser(req);
      if (!auth || auth.id !== id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true }).select('-password');
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
