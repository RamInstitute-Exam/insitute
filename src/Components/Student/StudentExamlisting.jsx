import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [level, setLevel] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Mock request/submission data
  const [requestHistory, setRequestHistory] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState({});

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/Question/all-exams')
      .then(res => {
        setExams(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });

    // TODO: Replace these with real API calls
    setRequestHistory([
      { examId: '123', status: 'Approved' },
      { examId: '456', status: 'Pending' }
    ]);
    setSubmissionStatus({
      '123': { completed: true, marks: 18, total: 20 },
      '456': { completed: false }
    });
  }, []);

  const changeLevel = (newLevel, category, year, month) => {
    setLevel(null);
    setTimeout(() => {
      setLevel(newLevel);
      setSelectedCategory(category ?? null);
      setSelectedYear(year ?? null);
      setSelectedMonth(month ?? null);
    }, 300);
  };

  const goBack = () => {
    if (level === 'details') changeLevel('month', selectedCategory, selectedYear);
    else if (level === 'month') changeLevel('year', selectedCategory);
    else if (level === 'year') changeLevel('category');
  };

  const requestAccess = examId => {
    alert(`Access request sent for Exam ID: ${examId}`);
    setRequestHistory([...requestHistory, { examId, status: 'Pending' }]);
  };

  const categories = [...new Set(exams.map(e => e.category))];
  const years = selectedCategory ? [...new Set(exams.filter(e => e.category === selectedCategory).map(e => e.year))] : [];
  const months = selectedCategory && selectedYear
    ? [...new Set(exams.filter(e => e.category === selectedCategory && e.year === selectedYear).map(e => e.month))]
    : [];
  const examDetails = selectedCategory && selectedYear && selectedMonth
    ? exams.filter(e => e.category === selectedCategory && e.year === selectedYear && e.month === selectedMonth)
    : [];

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
  );

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
            className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-2"
          >
            ← Back
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence exitBeforeEnter>
        {level === 'category' && (
          <motion.div key="category" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <h1 className="text-3xl font-bold mb-6 text-center">Select Category</h1>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(cat => (
                <motion.li key={cat} variants={itemVariants}>
                  <button
                    onClick={() => changeLevel('year', cat)}
                    className="flex items-center w-full p-5 bg-yellow-100 border border-yellow-400 rounded-lg"
                  >
                    <FolderIcon /> {cat}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {level === 'year' && (
          <motion.div key="year" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <h1 className="text-3xl font-bold mb-6 text-center">{selectedCategory} - Select Year</h1>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {years.map(year => (
                <motion.li key={year} variants={itemVariants}>
                  <button
                    onClick={() => changeLevel('month', selectedCategory, year)}
                    className="flex items-center w-full p-4 border border-blue-300 rounded-lg"
                  >
                    <CalendarIcon /> {year}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {level === 'month' && (
          <motion.div key="month" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <h1 className="text-3xl font-bold mb-6 text-center">{selectedCategory} - {selectedYear} - Select Month</h1>
            <ul className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {months.map(month => (
                <motion.li key={month} variants={itemVariants}>
                  <button
                    onClick={() => changeLevel('details', selectedCategory, selectedYear, month)}
                    className="flex items-center w-full p-4 border border-green-300 rounded-lg"
                  >
                    <MonthIcon />
                    {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {level === 'details' && (
          <motion.div key="details" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <h1 className="text-3xl font-bold mb-6 text-center">
              Exams in {selectedCategory} - {selectedYear} - {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })}
            </h1>
            <div className="space-y-4">
              {examDetails.map(exam => {
                const request = requestHistory.find(r => r.examId === exam._id);
                const submission = submissionStatus[exam._id];
                const isApproved = request?.status === 'Approved';
                const isPending = request?.status === 'Pending';

                return (
                  <motion.div
                    key={exam._id}
                    variants={itemVariants}
                    className="border p-4 rounded shadow-sm bg-white"
                  >
                    <h2 className="text-xl font-bold text-gray-800">{exam.title}</h2>
                    <p className="text-gray-600">Subject: {exam.subject}</p>
                    <div className="mt-2">
                      {submission?.completed ? (
                        <p className="text-green-700 font-semibold">
                          Completed: {submission.marks}/{submission.total} Marks
                        </p>
                      ) : isApproved ? (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                          Start Exam
                        </button>
                      ) : isPending ? (
                        <p className="text-yellow-600 font-medium">Access Requested</p>
                      ) : (
                        <button
                          onClick={() => requestAccess(exam._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Request Access
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
