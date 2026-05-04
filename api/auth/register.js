import dbConnect from '../../lib/db.js';
import User from '../../lib/models/User.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { name, email, password, ...rest } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      ...rest,
    });

    // Generate token
    const token = signToken(user);

    // Remove password from response
    const { password: _, ...safeUser } = user._doc;

    res.status(201).json({ user: safeUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
