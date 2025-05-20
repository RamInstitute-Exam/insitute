'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
export default function AdminUpload() {
  const [examCode, setExamCode] = useState('');
  const [examName, setExamName] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [questionPdf, setQuestionPdf] = useState(null);
  const [answerPdf, setAnswerPdf] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!examCode || !examName || !examDescription || !category || !year || !month || !questionPdf || !answerPdf) {
      return alert('Please fill all fields and select both PDFs.');
    }

    try {
      setLoading(true);

      const questionForm = new FormData();
      questionForm.append('examCode', examCode);
      questionForm.append('examName', examName);
      questionForm.append('examDescription', examDescription);
      questionForm.append('category', category);
      questionForm.append('year', year);
      questionForm.append('month', month);
      questionForm.append('pdf', questionPdf);

      await axios.post('http://localhost:5000/Question/upload-questions', questionForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const answerForm = new FormData();
      answerForm.append('examCode', examCode);
      answerForm.append('pdf', answerPdf);

      await axios.post('http://localhost:5000/Question/upload-answer-key', answerForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
toast
      toast.success('Upload successful!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white shadow-2xl rounded-2xl">
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">📤 Admin Exam Upload</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 font-semibold text-gray-700">Exam Code</label>
          <input
            type="text"
            value={examCode}
            onChange={(e) => setExamCode(e.target.value)}
            placeholder="e.g., MATH101"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700">Exam Name</label>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="e.g., Midterm Exam"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-2 font-semibold text-gray-700">Exam Description</label>
          <input
            type="text"
            value={examDescription}
            onChange={(e) => setExamDescription(e.target.value)}
            placeholder="e.g., Algebra and Geometry"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Category</option>
            <option value="GK">GK</option>
            <option value="Coding">Coding</option>
            {/* <option value="React">React</option>
            <option value="Next.js">Next.js</option>
            <option value="Node.js">Node.js</option> */}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Year</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Month</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <FileText size={16} /> Upload Questions PDF
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setQuestionPdf(e.target.files[0])}
            className="w-full text-sm file:bg-blue-600 file:text-white file:rounded file:px-4 file:py-2 file:cursor-pointer"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
            <FileText size={16} /> Upload Answer Key PDF
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setAnswerPdf(e.target.files[0])}
            className="w-full text-sm file:bg-green-600 file:text-white file:rounded file:px-4 file:py-2 file:cursor-pointer"
          />
        </div>
      </div>

      <div className="text-center mt-10">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition duration-200 flex items-center justify-center gap-2 mx-auto"
        >
          <UploadCloud size={18} />
          {loading ? 'Uploading...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}


// 'use client';
// import React, { useState } from 'react';
// import axios from 'axios';
// import { UploadCloud, FileText } from 'lucide-react';

// export default function AdminUpload() {
//   const [examCode, setExamCode] = useState('');
//   const [examName, setExamName] = useState('');
//   const [examDescription, setExamDescription] = useState('');
//   const [questionPdf, setQuestionPdf] = useState(null);
//   const [answerPdf, setAnswerPdf] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     if (!examCode || !examName || !examDescription || !questionPdf || !answerPdf) {
//       return alert('Please fill all fields and select both PDFs.');
//     }

//     try {
//       setLoading(true);

//       const questionForm = new FormData();
//       questionForm.append('examCode', examCode);
//       questionForm.append('examName', examName);
//       questionForm.append('examDescription', examDescription);
//       questionForm.append('pdf', questionPdf);

//       await axios.post('http://localhost:5000/Question/upload-questions', questionForm, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       const answerForm = new FormData();
//       answerForm.append('examCode', examCode);
//       answerForm.append('pdf', answerPdf);

//       await axios.post('http://localhost:5000/Question/upload-answer-key', answerForm, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       alert('Upload successful!');
//       window.location.reload();
//     } catch (err) {
//       console.error(err);
//       alert('Upload failed.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto mt-10 p-8 bg-white shadow-2xl rounded-2xl">
//       <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">📤 Admin Exam Upload</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <label className="block mb-2 font-semibold text-gray-700">Exam Code</label>
//           <input
//             type="text"
//             value={examCode}
//             onChange={(e) => setExamCode(e.target.value)}
//             placeholder="e.g., MATH101"
//             className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         <div>
//           <label className="block mb-2 font-semibold text-gray-700">Exam Name</label>
//           <input
//             type="text"
//             value={examName}
//             onChange={(e) => setExamName(e.target.value)}
//             placeholder="e.g., Midterm Exam"
//             className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         <div className="md:col-span-2">
//           <label className="block mb-2 font-semibold text-gray-700">Exam Description</label>
//           <input
//             type="text"
//             value={examDescription}
//             onChange={(e) => setExamDescription(e.target.value)}
//             placeholder="e.g., Algebra and Geometry"
//             className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         <div>
//           <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
//             <FileText size={16} /> Upload Questions PDF
//           </label>
//           <input
//             type="file"
//             accept="application/pdf"
//             onChange={(e) => setQuestionPdf(e.target.files[0])}
//             className="w-full text-sm file:bg-blue-600 file:text-white file:rounded file:px-4 file:py-2 file:cursor-pointer"
//           />
//         </div>

//         <div>
//           <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
//             <FileText size={16} /> Upload Answer Key PDF
//           </label>
//           <input
//             type="file"
//             accept="application/pdf"
//             onChange={(e) => setAnswerPdf(e.target.files[0])}
//             className="w-full text-sm file:bg-green-600 file:text-white file:rounded file:px-4 file:py-2 file:cursor-pointer"
//           />
//         </div>
//       </div>

//       <div className="text-center mt-10">
//         <button
//           onClick={handleSubmit}
//           disabled={loading}
//           className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition duration-200 flex items-center justify-center gap-2 mx-auto"
//         >
//           <UploadCloud size={18} />
//           {loading ? 'Uploading...' : 'Submit'}
//         </button>
//       </div>
//     </div>
//   );
// }
