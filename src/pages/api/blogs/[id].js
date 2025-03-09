import dbConnect from '../../../lib/db';
import Blog from '../../../models/Blog';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();

  const token = req.headers.authorization?.split(' ')[1];

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const blog = await Blog.findById(id).populate('author', 'name');
      res.status(200).json(blog);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch blog' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, content } = req.body;
      const blog = await Blog.findByIdAndUpdate(
        id,
        { title, content },
        { new: true }
      );
      res.status(200).json(blog);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update blog' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await Blog.findByIdAndDelete(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete blog' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}