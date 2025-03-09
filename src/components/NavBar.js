import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          Blogs App
        </Link>
        <div className="space-x-4">
          
          <Link href="/blogs" className="text-white hover:text-gray-200">
            Blogs
          </Link>
          {user ? (
            <button
              onClick={logout}
              className="text-white hover:text-gray-200"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="text-white hover:text-gray-200">
                Login
              </Link>
              <Link href="/signup" className="text-white hover:text-gray-200">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;