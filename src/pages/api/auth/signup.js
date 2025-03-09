import dbConnect from '../../../lib/db';
import User from '../../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }


      const user = new User({ name, email, password: password });
      await user.save();

      res.status(201).json({ user: { id: user._id, email: user.email } });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}