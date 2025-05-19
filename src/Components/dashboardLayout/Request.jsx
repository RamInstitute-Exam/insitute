import React, { useEffect, useState } from 'react';
import API from '../../config/API';
import { FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';

export default function AdminExamRequests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, status: '' });

  const pageSize = 5;

  const fetchRequests = async () => {
    try {
      const res = await API.get('Question/GetALLRequests');
      setRequests(res.data.requests);
      console.log(res.data,"response");
      
    } catch (err) {
      console.error('Failed to load requests:', err);
    }
  };

  const updateStatus = async (requestId, status) => {
    try {
      setLoadingRequestId(requestId);
      await API.put('Question/UpdateRequestStatus', { requestId, status });
      toast.success(`Request ${status} successfully!`);
      fetchRequests();
    } catch (err) {
      toast.error('Error updating request.');
    } finally {
      setLoadingRequestId(null);
      setConfirmModal({ open: false, id: null, status: '' });
    }
  };

  useEffect(() => {
    let data = [...requests];
    const lowerSearch = searchTerm.toLowerCase();

    data = data.filter((req) => {
      const name = req.studentId?.name?.toLowerCase() || '';
      const email = req.studentId?.email?.toLowerCase() || '';
      return name.includes(lowerSearch) || email.includes(lowerSearch);
    });

    if (statusFilter !== 'all') {
      data = data.filter((req) => req.status === statusFilter);
    }

    if (sortBy === 'status') {
      data.sort((a, b) => a.status.localeCompare(b.status));
    } else {
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredRequests(data);
    setCurrentPage(1);
  }, [requests, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 sm:p-6 bg-white shadow-xl rounded-lg relative">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">All Student Exam Access Requests</h2>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border px-4 py-2 rounded w-full sm:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border px-4 py-2 rounded w-full sm:w-1/4"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </select>
        <select
          className="border px-4 py-2 rounded w-full sm:w-1/4"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Sort by Newest</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      {/* Table */}
      {paginatedRequests.length === 0 ? (
        <p className="text-center text-gray-600">No matching requests found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border text-left">Student</th>
                  <th className="p-3 border text-left">Email</th>
                  <th className="p-3 border text-left">Exam Code</th>
                  <th className="p-3 border text-left">Status</th>
                  <th className="p-3 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((req) => (
                  <tr key={req._id}>
                    <td className="p-2 border">{req.studentId?.name || 'N/A'}</td>
                    <td className="p-2 border">{req.studentId?.email || 'N/A'}</td>
                    <td className="p-2 border">{req.examCode}</td>
                    <td className="p-2 border capitalize">{req.status}</td>
                    <td className="p-2 border">
                      <div className="flex justify-center gap-2">
                        <button
                          aria-label="Approve request"
                          onClick={() => setConfirmModal({ open: true, id: req._id, status: 'approved' })}
                          disabled={loadingRequestId === req._id || req.status === 'approved'}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {loadingRequestId === req._id && confirmModal.status === 'approved' ? (
                            <FiLoader className="animate-spin" />
                          ) : (
                            <FiCheck />
                          )}
                          Approve
                        </button>
                        <button
                          aria-label="Decline request"
                          onClick={() => setConfirmModal({ open: true, id: req._id, status: 'declined' })}
                          disabled={loadingRequestId === req._id || req.status === 'declined'}
                          className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {loadingRequestId === req._id && confirmModal.status === 'declined' ? (
                            <FiLoader className="animate-spin" />
                          ) : (
                            <FiX />
                          )}
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 border rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 border rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* ✅ Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
            <p className="mb-6">Are you sure you want to <strong>{confirmModal.status}</strong> this request?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal({ open: false, id: null, status: '' })}
                className="px-4 py-2 border rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus(confirmModal.id, confirmModal.status)}
                className={`px-4 py-2 rounded text-white ${confirmModal.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
