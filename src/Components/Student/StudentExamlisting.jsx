'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API from '../../config/API';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

// Icons
const FolderIcon = () => (
  <svg className="w-6 h-6 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a4 4 0 00-4-4h-8l-2-2z" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const MonthIcon = () => (
  <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
  </svg>
);

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { staggerChildren: 0.1, when: 'beforeChildren' },
  },
  exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ExamBrowser() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Levels: category, year, month, details
  const [level, setLevel] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [results, setResults] = useState({});

  const [requestHistory, setRequestHistory] = useState([]); // raw requests from API
  const [requests, setRequests] = useState({}); // map examCode -> status
  const [submissionStatus, setSubmissionStatus] = useState({}); // map examId -> submission details
  const [loadingMap, setLoadingMap] = useState({}); // per-exam loading for request button
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  
  const navigate = useNavigate();
  const studentId = localStorage.getItem('userId');


   

  // Fetch exams, requests, and submission statuses
// 1) Fetch exams, requests, submissionStatus on studentId change
useEffect(() => {
  async function fetchAllData() {
    setLoading(true);
    try {
      const examsRes = await API.get('Question/all-exams');
      const examsList = examsRes.data.exams || examsRes.data || [];
      setExams(examsList);

      const reqRes = await API.get(`Question/student/${studentId}/requests`);
      const reqMap = {};
      (reqRes.data.requests || []).forEach(req => {
        reqMap[req.examCode] = req.status;
      });
      setRequests(reqMap);
      setRequestHistory(reqRes.data.requests || []);

      // Fetch submission statuses in parallel
      const statusPromises = examsList.map(async exam => {
        try {
          const statusRes = await API.get(`Student/student/${studentId}/exam/${exam.examCode}/status`);
          return [exam._id, statusRes.data || {}];
        } catch {
          return [exam._id, {}];
        }
      });
      const statusEntries = await Promise.all(statusPromises);
      const statusMap = Object.fromEntries(statusEntries);
      setSubmissionStatus(statusMap);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  if (studentId) {
    fetchAllData();
  } else {
    toast.error('User not logged in.');
    setLoading(false);
  }
}, [studentId]);

// 2) Fetch detailed statuses + results once exams have been set
useEffect(() => {
  if (!studentId || exams.length === 0) return;

  async function fetchStatusesAndResults() {
    try {
      const statusMap = {};
      const resultMap = {};

      await Promise.all(
        exams.map(async (exam) => {
          const statusRes = await API.get(`Student/student/${studentId}/exam/${exam.examCode}/status`);
          const status = statusRes.data.status;
          statusMap[exam.examCode] = status;

          if (status === 'completed') {
            const resultRes = await API.get(`Student/student/${studentId}/exam/${exam.examCode}/result`);
            resultMap[exam.examCode] = resultRes.data;
            console.log(resultMap,"mao");
            
              setSelectedResult([exam.examCode ]);
              setShowModal(true);
          }
        })
      );

      setStatuses(statusMap);
      setResults(resultMap);
    } catch (error) {
      console.error(error);
      toast.error('Error fetching exam statuses/results');
    }
  }

  fetchStatusesAndResults();
}, [studentId, exams]);


  // Change navigation level with transition effect
  const changeLevel = (newLevel, category, year, month) => {
    setLevel(null);
    setTimeout(() => {
      setLevel(newLevel);
      setSelectedCategory(category ?? null);
      setSelectedYear(year ?? null);
      setSelectedMonth(month ?? null);
    }, 200);
  };

  const goBack = () => {
    if (level === 'details') changeLevel('month', selectedCategory, selectedYear);
    else if (level === 'month') changeLevel('year', selectedCategory);
    else if (level === 'year') changeLevel('category');
  };

  // Request exam access
  const requestAccess = async (examId) => {
    try {
      setLoadingMap(prev => ({ ...prev, [examId]: true }));
      await API.post('Question/exams/request', { examCode: examId, studentId });
      toast.success('Access request sent to admin');
      // Refresh requests after successful request
      const reqRes = await API.get(`Question/student/${studentId}/requests`);
      const reqMap = {};
      (reqRes.data.requests || []).forEach(req => {
        reqMap[req.examCode] = req.status;
      });
      setRequests(reqMap);
      setRequestHistory(reqRes.data.requests || []);
    } catch (error) {
      toast.error('Failed to send request');
    } finally {
      setLoadingMap(prev => ({ ...prev, [examId]: false }));
    }
  };

  // Start exam navigation
  const handleStartExam = async (exam) => {
    if (exam.examEndTime && new Date() > new Date(exam.examEndTime)) {
      toast.warning('Exam time has expired!');
      return;
    }
    try {
      const res = await API.get(`Question/exams/${exam.examCode}/questions`);
      const { questions } = res.data;
      navigate(`/student/exam/${exam.examCode}`, {
        state: { questions, examEndTime: exam.examEndTime },
      });
    } catch {
      toast.error('Failed to start the exam.');
    }
  };

  const handleRequest = async (examCode) => {
    try {
      setLoadingMap(prev => ({ ...prev, [examCode]: true }));
      await API.post('Question/exams/request', { examCode, studentId });
      toast.success('Request sent to admin.');
      setRequests();
    } catch {
      toast.error('Failed to send request.');
    } finally {
      setLoadingMap(prev => ({ ...prev, [examCode]: false }));
    }
  };


  // Derived data for category, year, month and exam details
  const categories = [...new Set(exams.map(e => e.category))];
  const years = selectedCategory
    ? [...new Set(exams.filter(e => e.category === selectedCategory).map(e => e.year))]
    : [];
  const months = selectedCategory && selectedYear
    ? [...new Set(exams.filter(e => e.category === selectedCategory && e.year === selectedYear).map(e => e.month))]
    : [];
  const examDetails = selectedCategory && selectedYear && selectedMonth
    ? exams.filter(e =>
        e.category === selectedCategory &&
        e.year === selectedYear &&
        e.month === selectedMonth
      )
    : [];

  if (loading) {
   return (
  <div className="p-4 max-w-3xl mx-auto min-h-screen bg-gray-50">
    <AnimatePresence mode="wait">
      <motion.div
        key={level}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-4"
      >
        {level !== 'category' && (
          <button
            onClick={goBack}
            className="text-blue-600 underline flex items-center space-x-1"
          >
            ← Back
          </button>
        )}

        {level === 'category' && categories.map((cat) => (
          <motion.div
            key={cat}
            variants={itemVariants}
            onClick={() => changeLevel('year', cat)}
            className="cursor-pointer bg-white p-4 shadow rounded flex items-center hover:bg-blue-50"
          >
            <FolderIcon />
            <span className="text-lg font-semibold">{cat}</span>
          </motion.div>
        ))}

        {level === 'year' && years.map((yr) => (
          <motion.div
            key={yr}
            variants={itemVariants}
            onClick={() => changeLevel('month', selectedCategory, yr)}
            className="cursor-pointer bg-white p-4 shadow rounded flex items-center hover:bg-green-50"
          >
            <CalendarIcon />
            <span className="text-lg font-semibold">{yr}</span>
          </motion.div>
        ))}

        {level === 'month' && months.map((mon) => (
          <motion.div
            key={mon}
            variants={itemVariants}
            onClick={() => changeLevel('details', selectedCategory, selectedYear, mon)}
            className="cursor-pointer bg-white p-4 shadow rounded flex items-center hover:bg-yellow-50"
          >
            <MonthIcon />
            <span className="text-lg font-semibold">{mon}</span>
          </motion.div>
        ))}

        {level === 'details' && examDetails.map((exam) => {
          const status = statuses[exam.examCode];
          const result = results[exam.examCode];
          const requestStatus = requests[exam.examCode];
          const isLoading = loadingMap[exam.examCode];

          return (
            <motion.div
              key={exam._id}
              variants={itemVariants}
              className="bg-white p-4 shadow rounded"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{exam.examName}</h3>
                  <p className="text-sm text-gray-600">
                    Code: {exam.examCode} | Time: {exam.examDuration} mins
                  </p>
                  {status === 'completed' && result && (
                    <p className="mt-1 text-green-600 text-sm">
                      ✅ Completed - Score: {result.totalCorrect} / {result.totalQuestions}
                    </p>
                  )}
                  {status === 'not started' && (
                    <p className="mt-1 text-yellow-600 text-sm">🕒 Not started</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {status === 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedResult(result);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      View Result
                    </button>
                  )}
                  {status === 'not started' && requestStatus === 'approved' && (
                    <button
                      onClick={() => handleStartExam(exam)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                    >
                      <LogIn className="w-4 h-4 mr-1" /> Start
                    </button>
                  )}
                  {status === 'not started' && requestStatus !== 'approved' && (
                    <button
                      disabled={isLoading}
                      onClick={() => requestAccess(exam.examCode)}
                      className={`px-3 py-1 rounded ${isLoading ? 'bg-gray-300' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
                    >
                      {isLoading ? 'Requesting...' : 'Request Access'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>

    {/* Modal for Result */}
    {showModal && selectedResult && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
        <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg relative">
          <button
            className="absolute top-2 right-3 text-gray-600 hover:text-black"
            onClick={() => setShowModal(false)}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold mb-4">Exam Result</h2>
          <p><strong>Exam Code:</strong> {selectedResult.examCode}</p>
          <p><strong>Total Questions:</strong> {selectedResult.totalQuestions}</p>
          <p><strong>Correct:</strong> {selectedResult.totalCorrect}</p>
          <p><strong>Wrong:</strong> {selectedResult.totalWrong}</p>
          <p><strong>Score:</strong> {selectedResult.totalCorrect} / {selectedResult.totalQuestions}</p>
        </div>
      </div>
    )}
  </div>
);

  }

  return (
    <div className="p-4 max-w-xl mx-auto min-h-screen bg-gray-50">
      {/* Back Button */}
      <AnimatePresence>
        {level !== 'category' && (
          <motion.button
            key="back-button"
            onClick={goBack}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="mb-6 inline-flex items-center bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
          >
            &larr; Back
          </motion.button>
        )}
      </AnimatePresence>

      {/* Category View */}
      <AnimatePresence mode="wait">
        {level === 'category' && (
          <motion.div
            key="category"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            <h1 className="col-span-full text-3xl font-bold mb-6 text-center">Select Category</h1>
            {categories.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">No exams available.</p>
            ) : (
              categories.map(category => (
                <motion.button
                  key={category}
                  variants={itemVariants}
                  onClick={() => changeLevel('year', category)}
                  className="flex items-center justify-center p-6 bg-yellow-200 rounded shadow hover:bg-yellow-300"
                >
                  <FolderIcon /> {category}
                </motion.button>
              ))
            )}
          </motion.div>
        )}

        {/* Year View */}
        {level === 'year' && (
          <motion.div
            key="year"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-3 sm:grid-cols-4 gap-4"
          >
            <h1 className="col-span-full text-3xl font-bold mb-6 text-center">Select Year for {selectedCategory}</h1>
            {years.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">No years found.</p>
            ) : (
              years.map(year => (
                <motion.button
                  key={year}
                  variants={itemVariants}
                  onClick={() => changeLevel('month', selectedCategory, year)}
                  className="flex items-center justify-center p-4 bg-blue-200 rounded shadow hover:bg-blue-300"
                >
                  <CalendarIcon /> {year}
                </motion.button>
              ))
            )}
          </motion.div>
        )}

        {/* Month View */}
        {level === 'month' && (
          <motion.div
            key="month"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            <h1 className="col-span-full text-3xl font-bold mb-6 text-center">
              {selectedCategory} - {selectedYear} - Select Month
            </h1>
            {months.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">No months found.</p>
            ) : (
              months.map(month => (
                <motion.button
                  key={month}
                  variants={itemVariants}
                  onClick={() => changeLevel('details', selectedCategory, selectedYear, month)}
                  className="flex items-center justify-center p-4 bg-green-200 rounded shadow hover:bg-green-300"
                >
                  <MonthIcon /> {month}
                </motion.button>
              ))
            )}
          </motion.div>
        )}

        {/* Exam Details View */}
        {level === 'details' && (
          <motion.div
            key="details"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h1 className="text-3xl font-bold mb-6 text-center">
              {selectedCategory} - {selectedYear} - {selectedMonth} Exams
            </h1>
            {examDetails.length === 0 ? (
              <p className="text-center text-gray-500">No exams found for this selection.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {examDetails.map(exam => {
                  const reqStatus = requests[exam.examCode]; // e.g. 'approved', 'pending', undefined
                  const subStatus = submissionStatus[exam.examCode];
                  console.log(subStatus, "submission");
                  
                  const isExpired = exam.examEndTime ? new Date() > new Date(exam.examEndTime) : false;
                  const isCompleted = subStatus?.status === 'completed';
                  console.log(isCompleted,"complete");
                  const pending =subStatus?.status === 'pending'
                  
                  console.log(pending,"pending");


                  return (
                    <motion.li
                      key={exam.examCode}
                      variants={itemVariants}
                      className="p-4 border rounded bg-white shadow flex flex-col justify-between"
                    >
                      <div>
                        <h2 className="font-semibold text-lg mb-2">{exam.examName}</h2>
                        <p className="text-sm text-gray-500 mb-2">Code: {exam.examCode}</p>
                        {/* <p className="text-sm text-gray-500 mb-2">Time: {exam.startTime} to {exam.endTime || 'Not finish'}</p> */}
                      </div>
                      <div>
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
    </motion.li>
  );
})}
              </ul>
            )}
          </motion.div>
        )}
           
      </AnimatePresence>
   
    </div>
    
  );
}
