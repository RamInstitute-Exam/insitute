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
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
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
                  const subStatus = submissionStatus[exam._id];
                  console.log(subStatus, "submission");
                  
                  const isExpired = exam.examEndTime ? new Date() > new Date(exam.examEndTime) : false;
                  const completed = subStatus?.status === 'completed';

                  return (
                    <motion.li
                      key={exam.examCode}
                      variants={itemVariants}
                      className="p-4 border rounded bg-white shadow flex flex-col justify-between"
                    >
                      <div>
                        <h2 className="font-semibold text-lg mb-2">{exam.examName}</h2>
                        <p className="text-sm text-gray-500 mb-2">Code: {exam.examCode}</p>
                        <p className="text-sm text-gray-500 mb-2">Time: {exam.examStartTime} to {exam.examEndTime || 'Not finish'}</p>
                      </div>
                      <div>
                       {completed ? (
          <button
            onClick={() => {
              setSelectedResult(results[exam.examCode]);
              setShowModal(true);
            }}
            className="w-full py-2 mt-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            View Result
          </button>
        ) : subStatus === 'approved' ? (
          <button
            onClick={() => handleStartExam(exam)}
            disabled={isExpired}
            className={`w-full py-2 mt-2 text-white rounded ${
              isExpired
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isExpired ? 'Expired' : 'Start Exam'}
          </button>
        ) : subStatus === 'pending' ? (
          <button disabled className="w-full py-2 mt-2 bg-yellow-400 text-white rounded cursor-not-allowed">
            Request Pending
          </button>
        ) : (
          <button
            onClick={() => requestAccess(exam.examCode)}
            disabled={loadingMap[exam.examCode]}
            className="w-full py-2 mt-2 bg-gray-600 text-white rounded hover:bg-gray-700"
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
