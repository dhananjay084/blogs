import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import dbConnect from '../../../lib/db';
import Blog from '@/models/Blog';

export default function BlogDetail({ blog }) {
  const router = useRouter();
  const { user } = useAuth();

  if (!blog) {
    return <div>Blog not found</div>;
  }

  const handleEdit = () => {
    router.push(`/blogs/${blog._id}/edit`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{blog.title}</h1>
      {blog.image && (
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full max-w-1/2 mx-auto my-4 rounded-lg"
          loading="lazy" // Add lazy loading here
        />
      )}
      <p>{blog.content}</p>
      <p className="text-sm text-gray-600">Author: {blog.author?.email}</p>

      {user && user.email === blog.author?.email && (
        <button
          onClick={handleEdit}
          className="bg-yellow-500 text-white p-2 rounded mt-4"
        >
          Edit
        </button>
      )}
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