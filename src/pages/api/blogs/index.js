import dbConnect from '../../../lib/db';
import Blog from '../../../models/Blog';
import { verifyToken } from '../../../lib/auth';
import { IncomingForm } from 'formidable';
import cloudinary from 'cloudinary';
import fs from 'fs/promises'; // Use fs.promises for async file handling

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: 'dl3nn6nqr', // Replace with your Cloudinary cloud name
  api_key: '336414231912979', // Replace with your Cloudinary API key
  api_secret: 'lhxibLlOsv6maWhdi9r6vlGocMI', // Replace with your Cloudinary API secret
});

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for FormData
  },
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const form = new IncomingForm({ multiples: false, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ message: 'Failed to parse form' });
      }

      // Ensure title and content are valid strings
      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const content = Array.isArray(fields.content) ? fields.content[0] : fields.content;

      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      let imageUrl = '';
      console.log('Fields:', fields);
      console.log('Files:', files);
      if (files.image && files.image[0].filepath) {
        try {
          console.log('Uploading image to Cloudinary:', files.image[0].filepath); // Debug log
      
          const uploadResponse = await cloudinary.v2.uploader.upload(files.image[0].filepath, {
            folder: 'blogs',
            use_filename: true,
            unique_filename: false,
          });
      
          imageUrl = uploadResponse.secure_url;
          console.log('Uploaded Image URL:', imageUrl); // Debug log
      
          await fs.unlink(files.image[0].filepath); // Delete temp file after upload
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          return res.status(500).json({ message: 'Image upload failed' });
        }
      }
      
      

      // Create new blog post
      const blog = new Blog({
        title,
        content,
        image: imageUrl, // Ensure this field is not empty
        author: decoded.id,
      });
      
      console.log('Blog data before saving:', blog);
      await blog.save();
      
      res.status(201).json(blog);
    });
  } catch (error) {
    console.error('Failed to create blog:', error);
    res.status(500).json({ message: 'Failed to create blog' });
  }
}
