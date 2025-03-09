import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { email, password } = req.body;

    console.log('Login request:', { email, password }); 

    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found:', email); 
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = password===user.password;
      console.log('Password match:', isMatch); 

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.status(200).json({ user: { id: user._id, email: user.email }, token });
    } catch (error) {
      console.error('Login error:', error); 
      res.status(500).json({ message: 'Failed to login' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}