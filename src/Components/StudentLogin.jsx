import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../config/API";
import logo from "../assets/Icon.jpeg";
import { toast } from "react-toastify";
export default function StudentLogin() {
  const navigate = useNavigate();
  const [FormData, setFormData] = useState({
    mobileNumber: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...FormData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("Student/Login", { ...FormData }, { withCredentials: true });
      console.log("response", response);
      toast.success('Login Successful!')
      const UserId = response.data.User
      localStorage.setItem('userId',UserId)
      
      setTimeout(()=>{
      navigate("/student");

      },100)
    } catch (error) {
      console.error(error);
     if(error.response?.status === 404){
             toast.error('User not Found')
           }
           else{
              toast.error("Invalid credentials. Please try again.");
           }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <img src={logo} alt="Your company" className="mx-auto h-25 w-25" />
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Sign in to your Student Account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              pattern="[0-9]{10}"
              maxLength={10}
              required
              value={FormData.mobileNumber}
              onChange={handleChange}
              placeholder="Enter mobile number"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={FormData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/student-Register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Create an Account
          </Link>
        </p>

      </div>
    </div>
  );
}
