import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext"; 
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const router = useRouter();
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 

    try {
      const success = await login(email, password); 
      if (success) {
        toast.success("Login successful!"); 
        setTimeout(() => {
          router.push("/blogs"); 
        }, 2000); 
      }
    } catch (error) {
      toast.error(error.message || "Login failed"); 
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Login
        </h1>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
            required
          />
          <button
            type="submit"
            disabled={loading} // Disable the button when loading
            className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"} {/* Show loading text */}
          </button>
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 font-semibold hover:underline">
            Sign up
          </a>
        </p>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}