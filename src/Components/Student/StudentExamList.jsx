'use client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../config/API';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function StudentExamList() {
  const [exams, setExams] = useState([]);
  const [requests, setRequests] = useState({});
  const [statuses, setStatuses] = useState({});
  const [results, setResults] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const router = useNavigate();
  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('Question/exams/list');
        setExams(res.data);
      } catch {
        toast.error('Failed to fetch exams');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (exams.length > 0) {
      fetchRequests();
      fetchStatusesAndResults();
    }
  }, [exams]);

  const fetchRequests = async () => {
    try {
      const res = await API.get(`Question/student/${studentId}/requests`);
      const map = {};
      res.data.requests?.forEach(req => {
        map[req.examCode] = req.status;
      });
      setRequests(map);
    } catch {
      toast.error('Failed to fetch access requests');
    }
  };

  const fetchStatusesAndResults = async () => {
    try {
      const statusMap = {};
      const resultMap = {};
      for (const exam of exams) {
        const res = await API.get(`Student/student/${studentId}/exam/${exam.examCode}/status`);
        statusMap[exam.examCode] = res.data.status;

        if (res.data.status === 'completed') {
          const resultRes = await API.get(`Student/student/${studentId}/exam/${exam.examCode}/result`);
          resultMap[exam.examCode] = resultRes.data;
        }
      }
      setStatuses(statusMap);
      setResults(resultMap);
    } catch {
      toast.error('Error fetching exam statuses/results');
    }
  };

  const handleRequest = async (examCode) => {
    try {
      setLoadingMap(prev => ({ ...prev, [examCode]: true }));
      await API.post('Question/exams/request', { examCode, studentId });
      toast.success('Request sent to admin.');
      fetchRequests();
    } catch {
      toast.error('Failed to send request.');
    } finally {
      setLoadingMap(prev => ({ ...prev, [examCode]: false }));
    }
  };

  const handleStartExam = async (exam) => {
    if (exam.examEndTime && new Date() > new Date(exam.examEndTime)) {
      toast.warning('Exam time has expired!');
      return;
    }

    try {
      const res = await API.get(`Question/exams/${exam.examCode}/questions`);
      const { questions } = res.data;
      router(`/student/exam/${exam.examCode}`, {
        state: { questions, examEndTime: exam.examEndTime },
      });
    } catch {
      toast.error('Failed to start the exam.');
    }
  };

  const handleViewResult = (examCode) => {
    const result = results[examCode];
    if (result) {
      setSelectedResult({ examCode, ...result });
      setShowModal(true);
    } else {
      toast.warn('Result not available yet.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Available Exams</h2>
      {exams.length === 0 ? (
        <p>No exams available.</p>
      ) : (
        <ul className="space-y-4">
          {exams.map((exam) => {
            const reqStatus = requests[exam.examCode];
            const examStatus = statuses[exam.examCode];
            const isCompleted = examStatus === 'completed';

            return (
              <li key={exam._id} className="border p-4 rounded shadow-sm">
                <h3 className="text-xl font-semibold">{exam.examName}</h3>
                <p className="text-gray-700">{exam.examDescription}</p>
                <p className="text-sm text-gray-500">Code: {exam.examCode}</p>
                <p className="text-sm text-gray-400">Created: {new Date(exam.createdAt).toLocaleString()}</p>
                {exam.examEndTime && (
                  <p className="text-sm text-red-500">
                    Ends: {new Date(exam.examEndTime).toLocaleString()}
                  </p>
                )}

                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => window.open(exam.questionURL, '_blank')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Question
                  </button>
                  <button
                    onClick={() => window.open(exam.answerURL, '_blank')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    View Answer
                  </button>
                </div>

                {/* Status Section */}
                {isCompleted ? (
                  <>
                    <p className="mt-3 text-green-700 font-semibold">✅ Exam Completed</p>
                    <button
                      className="mt-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      onClick={() => handleViewResult(exam.examCode)}
                    >
                      View Result
                    </button>
                  </>
                ) : reqStatus === 'approved' ? (
                  <>
                    <p className="mt-3 text-green-600 font-medium">✅ Access Approved</p>
                    <button
                      className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                      onClick={() => handleStartExam(exam)}
                    >
                      Start Exam
                    </button>
                  </>
                ) : reqStatus === 'pending' ? (
                  <button
                    disabled
                    className="mt-3 bg-yellow-400 text-white px-4 py-2 rounded cursor-not-allowed"
                  >
                    Requested
                  </button>
                ) : reqStatus === 'declined' ? (
                  <p className="mt-3 text-red-500 font-medium">❌ Access Request Declined</p>
                ) : (
                  <button
                    onClick={() => handleRequest(exam.examCode)}
                    disabled={loadingMap[exam.examCode]}
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {loadingMap[exam.examCode] ? 'Requesting...' : 'Request Access'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal for Exam Result */}
      {showModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <h3 className="text-xl font-semibold mb-2">Result - {selectedResult.examCode}</h3>
            <p><strong>Marks:</strong> {selectedResult.marks}</p>
            <p><strong>Total Questions:</strong> {selectedResult.totalQuestions}</p>
            <p><strong>Correct:</strong> {selectedResult.correct}</p>
            <p><strong>Wrong:</strong> {selectedResult.wrong}</p>

            <button
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
