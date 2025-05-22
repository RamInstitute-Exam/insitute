import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../config/API"; // Axios instance
import logo from "../assets/Icon.jpeg";
import { toast } from "react-toastify";
export default function StudentRegister() {
  const [formData, setFormData] = useState({
    Batch: "",
    name: "",
    mobileNumber: "",
    whatsappNumber: "",
    email: "",
    password: "",
    gender: "",
    fathername: "",
    fatherOccupation: "",
    mothername: "",
    motherOccupation: "",
    Degree: "",
    Year_of_passing: "",
    working: "",
    workdesc: "",
    permanent_address: "",
    residential_address: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "profile");
    data.append("folder", "students/profiles");

    const res = await fetch("https://api.cloudinary.com/v1_1/dfrfq0ch8/image/upload", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    return result.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = "";
      if (profilePhoto) {
        imageUrl = await uploadToCloudinary(profilePhoto);
      }

      const res = await API.post("Student/Register", {
        ...formData,
        profilePhoto: imageUrl,
      });
    toast.success('Registered Successful!');
console.log("Registration successful", res.data);
  navigate("/student-Login");

    } catch (err) {
      console.error("Registration failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <img className="mx-auto h-24 w-24 rounded-full shadow-lg" src={logo} alt="Logo" />
          <h2 className="text-3xl font-bold text-indigo-700 mt-4">Student Signup Form</h2>
          <p className="text-sm text-gray-600">Please fill in the details carefully to register</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input label="Batch" name="Batch" value={formData.Batch} onChange={handleChange} placeholder="e.g. 2021 - 2025" pattern="\d{4}\s*-\s*\d{4}" />
          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
          <Input label="Mobile Number" name="mobileNumber" type="tel" pattern="[0-9]{10}" maxLength="10" value={formData.mobileNumber} onChange={handleChange} />
          <Input label="Whatsapp Number" name="whatsappNumber" type="tel" pattern="[0-9]{10}" maxLength="10" value={formData.whatsappNumber} onChange={handleChange} />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />

          {/* Gender */}
          <div className="flex flex-col">
            <label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <Input label="Father's Name" name="fathername" value={formData.fathername} onChange={handleChange} />
          <Input label="Father's Occupation" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} />
          <Input label="Mother's Name" name="mothername" value={formData.mothername} onChange={handleChange} />
          <Input label="Mother's Occupation" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} />
          <Input label="Degree" name="Degree" value={formData.Degree} onChange={handleChange} />
          <Input label="Year of Passing" name="Year_of_passing" value={formData.Year_of_passing} onChange={handleChange} />
          <Input label="Are You Working?" name="working" value={formData.working} onChange={handleChange} />
          <Input label="Work Description" name="workdesc" value={formData.workdesc} onChange={handleChange} />
          <Input label="Permanent Address" name="permanent_address" value={formData.permanent_address} onChange={handleChange} />
          <Input label="Residential Address" name="residential_address" value={formData.residential_address} onChange={handleChange} />

          {/* Profile Photo Upload */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="mt-2 h-24 w-24 rounded-full object-cover border" />
            )}
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow transition duration-200"
            >
              Register Now
            </button>
          </div>
        </form>

        <div className="text-center mt-6 space-y-3">
          <p className="text-sm text-gray-600">
            Already registered?{" "}
            <Link to="/student-Login" className="text-indigo-600 hover:text-indigo-500 font-semibold">Login here</Link>
          </p>
        
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component
function Input({ label, name, type = "text", placeholder = "", pattern, maxLength, value, onChange, required = true }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        pattern={pattern}
        maxLength={maxLength}
        required={required}
        value={value}
        onChange={onChange}
        className="border border-gray-300 rounded-md px-3 py-2"
      />
    </div>
  );
}
