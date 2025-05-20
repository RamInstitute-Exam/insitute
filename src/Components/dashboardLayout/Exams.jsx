import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import API from "../../config/API";

const AdminExamsList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingExam, setDeletingExam] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await API.get("Question/exams/list");
        setExams(response.data);
      } catch (error) {
        console.error("Error fetching exams", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleDelete = async (examCode) => {
    const confirm = window.confirm("Are you sure you want to delete this exam?");
    if (!confirm) return;

    try {
      setDeletingExam(examCode);
      await axios.delete(`http://localhost:5000/Question/exams/delete/${examCode}`);
      setExams((prev) => prev.filter((exam) => exam.examCode !== examCode));
    } catch (error) {
      console.error("Error deleting exam", error);
    } finally {
      setDeletingExam(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        📝 Admin - Exams List
      </h1>

      {loading ? (
        <div className="text-center text-gray-600 text-lg">Loading exams...</div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden shadow rounded-lg sm:block">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Exam Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.examCode} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">{exam.examCode}</td>
                    <td className="px-6 py-4">{exam.examName}</td>
                    <td className="px-6 py-4">{exam.examDescription}</td>
                    <td className="px-6 py-4 text-center space-x-4">
                      <Link
                        to={`/admin/exams/edit/${exam.examCode}`}
                        aria-label={`Edit exam ${exam.examCode}`}
                        className="inline-block text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(exam.examCode)}
                        disabled={deletingExam === exam.examCode}
                        aria-label={`Delete exam ${exam.examCode}`}
                        className={`inline-block text-red-600 hover:text-red-800 ${
                          deletingExam === exam.examCode ? "opacity-50 cursor-wait" : ""
                        }`}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-6">
            {exams.map((exam) => (
              <div
                key={exam.examCode}
                className="bg-white border border-gray-200 rounded-lg shadow p-5"
              >
                <p className="mb-2 text-base font-semibold text-gray-700">
                  Exam Code: <span className="font-normal">{exam.examCode}</span>
                </p>
                <p className="mb-2 text-base font-semibold text-gray-700">
                  Name: <span className="font-normal">{exam.examName}</span>
                </p>
                <p className="mb-4 text-base font-semibold text-gray-700">
                  Description: <span className="font-normal">{exam.examDescription}</span>
                </p>
                <div className="flex justify-end space-x-6">
                  <Link
                    to={`/admin/exams/edit/${exam.examCode}`}
                    aria-label={`Edit exam ${exam.examCode}`}
                    className="text-blue-600 hover:text-blue-800 text-xl"
                  >
                    <FaEdit />
                  </Link>
                  <button
                    onClick={() => handleDelete(exam.examCode)}
                    disabled={deletingExam === exam.examCode}
                    aria-label={`Delete exam ${exam.examCode}`}
                    className={`text-red-600 hover:text-red-800 text-xl ${
                      deletingExam === exam.examCode ? "opacity-50 cursor-wait" : ""
                    }`}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminExamsList;
