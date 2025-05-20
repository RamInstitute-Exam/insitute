import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
import API from "../../config/API";
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    totalCompletedExams: 0,
    totalPendingExams: 0,
    studentAttendance: [],
    passFailData: { pass: 0, fail: 0 },
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await API.get("Admin/admin/statistics");
        const data = await response.data;
        setStats(data);
        console.log("data",data);
        
      } catch (err) {
        console.error("Error fetching statistics:", err);
      }
    };

    fetchStatistics();
  }, []);

  const lineChartData = {
    labels: stats.studentAttendance.map((item) => item.date),
    datasets: [
      {
        label: "Student Attendance",
        data: stats.studentAttendance.map((item) => item.attended),
        fill: false,
        borderColor: "#4CAF50",
        tension: 0.1,
      },
    ],
  };

  const pieChartData = {
    labels: ["Pass", "Fail"],
    datasets: [
      {
        data: [stats.passFailData.pass, stats.passFailData.fail],
        backgroundColor: ["#4CAF50", "#F44336"],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 px-4 md:px-6">
        <h1 className="text-lg md:text-xl font-bold">Admin Dashboard</h1>
      </header>

      <div className="flex-grow p-4 md:p-6 space-y-6">
        {/* Stats Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: stats.totalStudents },
            { label: "Total Exams", value: stats.totalExams },
            { label: "Exams Completed", value: stats.totalCompletedExams },
            { label: "Exams Pending", value: stats.totalPendingExams },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white shadow rounded-lg p-4 flex flex-col items-center text-center"
            >
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <h3 className="text-2xl md:text-3xl font-bold">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Line Chart */}
        <div className="bg-white shadow rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Student Attendance Trends
          </h2>
          <div className="overflow-x-auto">
            <Line data={lineChartData} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white shadow rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Pass vs Fail</h2>
          <div className="max-w-xs mx-auto">
            <Pie data={pieChartData} />
          </div>
        </div>

        {/* Exam Activities Table */}
        <div className="bg-white shadow rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Recent Exam Activities
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Exam Code</th>
                  <th className="py-2 px-4 border-b text-left">Student</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">EXAM123</td>
                  <td className="py-2 px-4 border-b">John Doe</td>
                  <td className="py-2 px-4 border-b text-green-600">Completed</td>
                  <td className="py-2 px-4 border-b">2025-05-14</td>
                </tr>
                {/* Add dynamic rows here */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
