import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import dbConnect from '../../lib/db';
import Blog from '../../models/Blog';
import { useRouter } from 'next/router';

export default function Blogs({ blogs }) {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in');
        return;
      }

      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        window.location.reload();
      } else {
        setError(data.message || 'Failed to create blog');
      }
    } catch (error) {
      console.error('Failed to create blog:', error);
      setError('Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not logged in');
        return;
      }

      const res = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert('Failed to delete blog');
      }
    } catch (error) {
      console.error('Failed to delete blog:', error);
      alert('Failed to delete blog');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Blogs</h1>

      {user && (
        <>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="bg-blue-600 text-white p-2 rounded mb-4 rounded-lg cursor-pointer"
          >
            {isFormVisible ? 'Cancel' : 'Add Blog'}
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isFormVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <form onSubmit={handleSubmit} className="mb-8">
              <h2 className="text-xl font-bold mb-4">Create a New Blog</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <textarea
                  placeholder="Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full p-2 border rounded"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  {loading ? 'Creating...' : 'Create Blog'}
                </button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogs.length === 0 ? (
          <p>No blogs found.</p>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog._id}
              className="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/blogs/${blog._id}`)}
            >
              {blog.image && (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                  loading="lazy" 
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
                <p className="text-gray-700">
                  {blog.content.length > 20
                    ? `${blog.content.substring(0, 20)}...`
                    : blog.content}
                </p>
                <p className="text-sm text-gray-600 mt-2">Author: {blog.author}</p>

                {user && user.email === blog.author && (
                  <div className="mt-4 space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/blogs/${blog._id}/edit`);
                      }}
                      className="bg-yellow-500 text-white p-2 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(blog._id);
                      }}
                      className="bg-red-500 text-white p-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  await dbConnect();

  try {
    const blogs = await Blog.find({}).populate('author', 'email');

    const serializedBlogs = blogs.map((blog) => ({
      ...blog.toObject(),
      _id: blog._id.toString(),
      author: blog.author.email,
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString(),
    }));

    return {
      props: {
        blogs: serializedBlogs,
      },
    };
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    return {
      props: {
        blogs: [],
      },
    };
  }
}