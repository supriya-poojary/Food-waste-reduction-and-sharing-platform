import dbConnect from '../../lib/db.js';
import User from '../../lib/models/User.js';
import { getAuthUser } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(auth.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
