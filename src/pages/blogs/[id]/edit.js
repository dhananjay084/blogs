import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import dbConnect from '../../../lib/db';
import Blog from '@/models/Blog';

export default function EditBlog({ blog }) {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState(blog.title);
  const [content, setContent] = useState(blog.content);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/blogs/${blog._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, 
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update blog');
      }

      router.push(`/blogs/${blog._id}`);
    } catch (err) {
      console.error('Error updating blog:', err);
      setError('Failed to update blog');
    } finally {
      setLoading(false);
    }
  };

  if (user?.email !== blog.author?.email) {
    return <div>You are not authorized to edit this blog.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Blog</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
            rows="6"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          {loading ? 'Updating...' : 'Update Blog'}
        </button>
      </form>
    </div>
  );
}

export async function getServerSideProps(context) {
  await dbConnect();

  const { id } = context.params;

  try {
    const blog = await Blog.findById(id).populate('author', 'email');

    if (!blog) {
      return {
        notFound: true,
      };
    }

    const serializedBlog = {
      ...blog.toObject(),
      _id: blog._id.toString(),
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString(),
      author: {
        ...blog.author.toObject(),
        _id: blog.author._id.toString(),
      },
    };

    return {
      props: {
        blog: serializedBlog,
      },
    };
  } catch (error) {
    console.error('Failed to fetch blog:', error);
    return {
      notFound: true,
    };
  }
}