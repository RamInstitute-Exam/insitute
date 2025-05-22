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
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Available Exams</h2>

      {exams.length === 0 ? (
        <p className="text-center text-gray-600">No exams available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const reqStatus = requests[exam.examCode];
            const examStatus = statuses[exam.examCode];
            const isCompleted = examStatus === 'completed';

            return (
              <div
                key={exam._id}
                className="bg-white border rounded-2xl shadow hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-purple-700">{exam.examName}</h3>
                  <p className="text-gray-600 mt-1">{exam.examDescription}</p>
                  <p className="text-sm text-gray-400 mt-2">Code: {exam.examCode}</p>
                  <p className="text-sm text-gray-400">Created: {new Date(exam.createdAt).toLocaleString()}</p>
                  {exam.examEndTime && (
                    <p className="text-sm text-red-600 font-semibold mt-1">
                      Ends: {new Date(exam.examEndTime).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {/* <div className="flex gap-3">
                    <button
                      onClick={() => window.open(exam.questionURL, '_blank')}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
                    >
                      View Question
                    </button>
                    <button
                      onClick={() => window.open(exam.answerURL, '_blank')}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm"
                    >
                      View Answer
                    </button>
                  </div> */}

                  {isCompleted ? (
                    <>
                      <p className="text-green-700 font-medium">✅ Exam Completed</p>
                      <button
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded-md hover:bg-gray-800 text-sm"
                        onClick={() => handleViewResult(exam.examCode)}
                      >
                        View Result
                      </button>
                    </>
                  ) : reqStatus === 'approved' ? (
                    <>
                      <p className="text-green-600 font-medium">✅ Access Approved</p>
                      <button
                        className="w-full bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 text-sm"
                        onClick={() => handleStartExam(exam)}
                      >
                        Start Exam
                      </button>
                    </>
                  ) : reqStatus === 'pending' ? (
                    <button
                      disabled
                      className="w-full bg-yellow-400 text-white px-3 py-2 rounded-md text-sm cursor-not-allowed"
                    >
                      Requested
                    </button>
                  ) : reqStatus === 'declined' ? (
                    <p className="text-red-500 font-medium">❌ Access Declined</p>
                  ) : (
                    <button
                      onClick={() => handleRequest(exam.examCode)}
                      disabled={loadingMap[exam.examCode]}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      {loadingMap[exam.examCode] ? 'Requesting...' : 'Request Access'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      
    </div>
  );
}
