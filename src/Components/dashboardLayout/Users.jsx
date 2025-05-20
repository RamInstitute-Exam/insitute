'use client';
import React, { useEffect, useState } from 'react';
import API from '../../config/API';
import { User, Search, Eye, X, Pencil, Trash } from 'lucide-react';

export default function StudentListAdmin() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleted,setdeleted] = useState(null)
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;



  const DeleteUser = async(id)=>{
    try{
      setLoading(true);
if (window.confirm('Are you sure you want to delete this student?')) {
  await API.delete(`/Student/delete/${id}`);
  fetchStudents();
}
    }
    catch(error){
      console.error(error);
    }
     finally {
    setLoading(false);
  }
  }
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/Student/list');
      setStudents(res.data.students);
      setFilteredStudents(res.data.students);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (search) {
      setFilteredStudents(
        students.filter((student) =>
          student.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredStudents(students);
    }
  }, [search, students]);

  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await API.put(`/Student/update/${selectedStudent._id}`, selectedStudent);
      fetchStudents();
      setIsEdit(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold text-center mb-8 text-indigo-700 flex justify-center items-center gap-2">
        <User className="w-8 h-8" /> Student List
      </h2>

      {/* Search Box */}
      <div className="mb-6 flex justify-end">
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading students...</p>
      ) : currentStudents.length === 0 ? (
        <p className="text-center text-gray-500">No students found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-indigo-50 text-indigo-800 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Batch</th>
                  <th className="px-6 py-3 text-left">Degree</th>
                  <th className="px-6 py-3 text-left">Exams</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student) => (
                  <tr key={student._id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <img
                        src={student.profilePhoto || '/default-profile.png'}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {student.name}
                    </td>
                    <td className="px-6 py-4">{student.email}</td>
                    <td className="px-6 py-4">{student.Batch}</td>
                    <td className="px-6 py-4">{student.Degree}</td>
                    <td className="px-6 py-4">
                      <ul className="list-disc ml-4">
                        {student.exams.map((exam, i) => (
                          <li key={i} className="text-sm">
                            {exam.examCode} - {exam.status}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsEdit(false);
                        }}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>
                     <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          DeleteUser(student._id)
                        }}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <Trash size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md text-sm border ${
                  currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Modal */}
          {selectedStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-lg">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
                >
                  <X />
                </button>

                <div className="flex flex-col items-center mb-4">
                  <img
                    src={selectedStudent.profilePhoto || '/default-profile.png'}
                    alt={selectedStudent.name}
                    className="w-24 h-24 rounded-full object-cover mb-2"
                  />
                  <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                </div>

                {isEdit ? (
                  <>
                    <input
                      name="name"
                      value={selectedStudent.name}
                      onChange={handleEditChange}
                      className="mb-2 w-full px-3 py-2 border rounded"
                    />
                    <input
                      name="email"
                      value={selectedStudent.email}
                      onChange={handleEditChange}
                      className="mb-2 w-full px-3 py-2 border rounded"
                    />
                    <input
                      name="Batch"
                      value={selectedStudent.Batch}
                      onChange={handleEditChange}
                      className="mb-2 w-full px-3 py-2 border rounded"
                    />
                    <input
                      name="Degree"
                      value={selectedStudent.Degree}
                      onChange={handleEditChange}
                      className="mb-4 w-full px-3 py-2 border rounded"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEdit(false)}
                        className="px-4 py-2 bg-gray-200 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-indigo-600 text-white rounded"
                      >
                        Save
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600">Email: {selectedStudent.email}</p>
                    <p className="text-gray-600">Batch: {selectedStudent.Batch}</p>
                    <p className="text-gray-600 mb-4">Degree: {selectedStudent.Degree}</p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setIsEdit(true)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <Pencil size={16} /> Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
