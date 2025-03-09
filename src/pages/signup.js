import { useState } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify"; // Import React Toastify
import "react-toastify/dist/ReactToastify.css"; // Import React Toastify CSS

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Signup successful! Redirecting to login..."); // Show success toast
        setTimeout(() => {
          router.push("/login"); // Redirect to the login page after 2 seconds
        }, 2000);
      } else {
        toast.error(data.message || "Signup failed"); // Show error toast
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed"); // Show error toast
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Create an Account
        </h1>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
            required
          />
          <input
            type="password"
            placeholder="Password"
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
            {loading ? "Creating user..." : "Sign Up"} {/* Show loading text */}
          </button>
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 font-semibold hover:underline">
            Login
          </a>
        </p>
      </form>

      {/* React Toastify Container */}
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