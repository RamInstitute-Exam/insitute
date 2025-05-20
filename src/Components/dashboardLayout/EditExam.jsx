import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";

const EditExam = () => {
  const { examCode } = useParams();
  const history = useHistory();
  const [examDetails, setExamDetails] = useState({
    examName: "",
    examDescription: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/Question/exams/${examCode}`);
        setExamDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exam details", error);
        setLoading(false);
      }
    };
    fetchExamDetails();
  }, [examCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExamDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/Question/exams/update/${examCode}`, examDetails);
      alert("Exam updated successfully");
      history.push("/admin/exams");
    } catch (error) {
      console.error("Error updating exam", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Edit Exam</h1>
      {loading ? (
        <p>Loading exam details...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="examName" className="block text-sm font-medium text-gray-700">Exam Name</label>
            <input
              type="text"
              id="examName"
              name="examName"
              value={examDetails.examName}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="examDescription" className="block text-sm font-medium text-gray-700">Exam Description</label>
            <textarea
              id="examDescription"
              name="examDescription"
              value={examDetails.examDescription}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditExam;
