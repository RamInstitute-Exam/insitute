import { Link, useNavigate } from "react-router-dom";
import API from "../config/API";
import { useState } from "react";
import { toast } from "react-toastify";
import logo from "../assets/Logos.jpeg"
export default function AdminLogin() {
  const navigate = useNavigate();
  const [Form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...Form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Form.email || !Form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await API.post("Admin/Login", { ...Form });
      toast.success("Login Successful!");
      setTimeout(() => {
        navigate("/admin");
      }, 100);
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      if (error.response?.status === 404) {
        toast.error("User not Found");
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-md">
        {/* Logo + Heading */}
        <div className="text-center mb-6">
          <img
            alt="Your Company"
            src={logo}
            className="mx-auto h-35 w-auto"
          />
          <h2 className="mt-4 text-xl sm:text-2xl font-bold text-gray-900">
            Sign in to your Admin Dashboard
          </h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              onChange={handleChange}
              value={Form.email}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              onChange={handleChange}
              value={Form.password}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              placeholder="Enter your password"
            />   
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          >
            Sign in
          </button>
        </form>

      
      </div>
    </div>
  );
}
