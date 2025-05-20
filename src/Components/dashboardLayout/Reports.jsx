'use client';
import React, { useEffect, useState } from 'react';
import API from '../../config/API';

export default function AdminExamReport() {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('none');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage, setReportsPerPage] = useState(10);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await API.get(`Student/Reports`);
      setReports(res.data);
      console.log(res.data,"data");
      
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    setCurrentPage(1);
  }, []);

  const handleDownloadCSV = () => {
    const headers = [
      // 'Student Name',
      // 'Email',
      'Exam Code',
      'Start Time',
      'End Time',
      'Correct Answers',
      'Wrong Answers',
      'Score',
      'Status',
    ];

    const rows = filteredAndSortedReports.map((r) => [
      // r.studentName,
      // r.email,
      r.examCode,
      r.startTime ? new Date(r.startTime).toLocaleString() : '',
      r.endTime ? new Date(r.endTime).toLocaleString() : '',
      r.correctAnswers,
      r.wrongAnswers,
      r.score,
      r.status,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'exam_reports.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSortedReports = reports
    .filter((r) =>
      r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'all' || r.status === statusFilter)
    )
    .sort((a, b) => {
      if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'date') return new Date(b.startTime) - new Date(a.startTime);
      return 0;
    });

  const totalPages = Math.ceil(filteredAndSortedReports.length / reportsPerPage);
  const currentReports = filteredAndSortedReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );
  console.log(currentReports,"current");
  

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">📊 Student Exam Reports</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <select
            className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <select
            className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="none">Sort By</option>
            <option value="score">Score</option>
            <option value="date">Start Time</option>
          </select>

          <select
            className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm"
            value={reportsPerPage}
            onChange={(e) => {
              setReportsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="🔍 Search by student name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm w-full md:w-64"
          />
          <button
            onClick={handleDownloadCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ⬇ Download CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-500">Loading reports...</p>
      ) : currentReports.length === 0 ? (
        <p className="text-center text-gray-500">No reports found.</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg ring-1 ring-gray-200">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-blue-50 text-blue-800 uppercase text-xs sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Exam Code</th>
                  <th className="px-4 py-3">Start Time</th>
                  <th className="px-4 py-3">End Time</th>
                  <th className="px-4 py-3 text-green-600">Correct</th>
                  <th className="px-4 py-3 text-red-600">Wrong</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentReports.map((report, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{report.studentName}</td>
                    <td className="px-4 py-2">{report.email}</td>
                    <td className="px-4 py-2">{report.examCode}</td>
                    <td className="px-4 py-2">{new Date(report.startTime).toLocaleString()}</td>
                    <td className="px-4 py-2">{new Date(report.endTime).toLocaleString()}</td>
                    <td className="px-4 py-2 font-semibold text-green-600">{report.correctAnswers}</td>
                    <td className="px-4 py-2 text-red-600">{report.wrongAnswers}</td>
                    <td className="px-4 py-2 font-bold">{report.score}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        report.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 flex-wrap gap-3">
            <p className="text-sm text-gray-600">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
              >
                ← Prev
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
