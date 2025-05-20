import React, { useEffect, useState } from 'react';
import API from '../../config/API';

export default function StudentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentId = localStorage.getItem("userId");

  console.log(studentId,"id");
  
  const fetchRequests = async () => {
    try {
      const res = await API.get(`Question/student/${studentId}/requests`);
        console.log(res.data,'reponse');

      if (Array.isArray(res.data.requests)) {
        setRequests(res.data.requests);
        
      } else {
        console.error('Unexpected response format:', res.data);
      }
    } catch (error) {
      console.error('Error fetching student requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6">My Exam Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req, index) => (
            <li key={index} className="border p-4 rounded shadow-sm">
              <p><strong>Exam Code:</strong> {req.examCode}</p>
              <p><strong>Status:</strong>{' '}
                {req.status === 'approved' ? (
                  <span className="text-green-600">✅ Approved</span>
                ) : req.status === 'pending' ? (
                  <span className="text-yellow-600">⏳ Pending</span>
                ) : (
                  <span className="text-red-600">❌ Declined</span>
                )}
              </p>
              <p className="text-gray-500 text-sm">Requested on: {new Date(req.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
