import React, { useState, useEffect } from "react";
import API from "../../config/API";
import { useParams,useNavigate } from "react-router-dom";

const QuestionPerPage = 20;

export default function StudentExamPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const { examCode } = useParams();
  const navigate = useNavigate()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentId = localStorage.getItem("userId");
        if (!studentId) {
          alert("User not logged in");
          return;
        }

        // Check if student already submitted the exam
        const statusRes = await API.get(
          `Student/student/${studentId}/exam/${examCode}/status`
        );

        if (statusRes.data?.isSubmitted) {
          setIsSubmitted(true);
          setScore(statusRes.data?.score || null);
          return;
        }

        // Fetch questions if not submitted
        const res = await API.get(`Question/exams/${examCode}/questions`);
        setQuestions(res.data.questions || []);
      } catch (error) {
        console.error("Error fetching exam data:", error);
        alert("Something went wrong. Please try again later.");
      }
    };

    fetchData();
  }, [examCode]);

  const handleChange = (Qno, option) => {
    setAnswers(prev => ({ ...prev, [Qno]: option }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const studentId = localStorage.getItem("userId");
      const response = await API.post(`Question/student/exam/submit`, {
        examCode,
        studentId,
        answers,
      });

      const result = response.data.studentExam;
      console.log("result",result);
      
      setIsSubmitted(true);
      setScore(result?.score);
      alert(`✅ Your score: ${result?.score} / ${questions.length}`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("Submission failed. Please try again.");
    }
  };

  const totalPages = questions.length ? Math.ceil(questions.length / QuestionPerPage) : 0;
  const startIndex = (currentPage - 1) * QuestionPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + QuestionPerPage);

  // ✅ Show "Exam Completed" message
  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto p-8 mt-20 text-center bg-green-50 border border-green-300 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-green-700">✅ You have already completed this exam.</h2>
        <button onClick={navigate("/student")}>Go to back</button>
        {score !== null && (
          <p className="mt-4 text-gray-800 font-semibold">
            Your Score: <span className="text-blue-600">{score}</span> / {questions.length || "N/A"}
          </p>
        )}
        <p className="mt-2 text-gray-600">Thank you for your submission.</p>
      </div>
    );
  }

  // ✅ Main Exam UI
  return (
    <div className="max-w-5xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">📘 Exam: {examCode}</h2>

      <form onSubmit={handleSubmit}>
        {currentQuestions.map(q => (
          <div
            key={q.questionNumber}
            className="mb-8 p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-lg text-gray-800 mb-3">
              {q.questionNumber}. {q.questionText}
            </p>

            <div className="ml-4 grid gap-2">
              {Object.entries(q.options).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all"
                >
                  <input
                    type="radio"
                    name={`question-${q.questionNumber}`}
                    value={key}
                    checked={answers[q.questionNumber] === key}
                    onChange={() => handleChange(q.questionNumber, key)}
                    className="form-radio text-blue-600 h-5 w-5 mr-3"
                  />
                  <span className="text-gray-700 font-medium">
                    {key}. {value}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Pagination and Submit Buttons */}
        <div className="flex justify-between items-center mt-10">
          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            ⬅ Previous
          </button>

          <span className="text-gray-600 font-semibold">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage === totalPages ? (
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              🚀 Submit Exam
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Next ➡
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
