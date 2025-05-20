import { useNavigate } from "react-router-dom";
import logo from "../assets/Logos.jpeg";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-50 to-white">
      
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <img
          src={logo}
          alt="Ram Institute"
          className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto shadow-lg object-cover border-4 border-white"
        />
        <h1 className="mt-6 text-3xl md:text-5xl font-extrabold text-blue-800 drop-shadow-sm">
          Welcome to Ram Institute
        </h1>
        <p className="mt-3 text-base md:text-xl text-gray-600 font-medium max-w-lg mx-auto">
          Your journey to knowledge and success starts here.
        </p>
      </div>

      {/* Call to Action Buttons */}
      <div className="flex flex-col md:flex-row items-center gap-4 mt-6">
        <button
          onClick={() => navigate("/student-Register")}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all duration-300"
        >
          Create a Student Account
        </button>
        <button
          onClick={() => navigate("/student-Login")}
          className="w-full md:w-auto px-6 py-3 bg-white border border-blue-600 text-blue-600 rounded-xl shadow hover:bg-blue-100 transition-all duration-300"
        >
          Already Have an Account? Login
        </button>
      </div>

     
    </div>
  );
}
