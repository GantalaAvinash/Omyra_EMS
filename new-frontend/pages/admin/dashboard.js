import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SummaryCard from "@/components/Admin/SummaryCard";
import { Bar, Pie } from "react-chartjs-2";
import { FaUsers, FaUserShield } from "react-icons/fa";
import { fetchInterns, fetchAttendance, fetchAdmins } from "../../lib/api";

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [admins, setAdmins] = useState([]);
  const [showAdminsModal, setShowAdminsModal] = useState(false);
  const [chartData, setChartData] = useState({ bar: null, pie: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const { data: interns } = await fetchInterns();
      setEmployeeCount(Array.isArray(interns) ? interns.length : 0);

      const { data: adminList } = await fetchAdmins();
      setAdminCount(Array.isArray(adminList) ? adminList.length : 0);
      setAdmins(adminList || []);

      const { data: attendance } = await fetchAttendance();
      if (Array.isArray(attendance)) {
        prepareChartData(attendance);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChartData = (attendance) => {
    const filteredAttendance = attendance.filter((record) => {
      const day = new Date(record.date).getDay();
      return day !== 0 && day !== 6; // Exclude weekends
    });

    const daysInMonth = {};
    filteredAttendance.forEach((record) => {
      const day = new Date(record.date).getDate();
      daysInMonth[day] = (daysInMonth[day] || 0) + (record.hours || 0);
    });

    const barData = {
      labels: Object.keys(daysInMonth).map((day) => `Day ${day}`),
      datasets: [
        {
          label: "Monthly Timesheet (Hours)",
          data: Object.values(daysInMonth),
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        },
      ],
    };

    const attendanceByHours = filteredAttendance.reduce((acc, record) => {
      const hours = record.hours || 0;
      acc[hours] = (acc[hours] || 0) + 1;
      return acc;
    }, {});

    const totalRecords = filteredAttendance.length;
    const pieData = {
      labels: Object.keys(attendanceByHours).map((hours) => `${hours} hours`),
      datasets: [
        {
          data: Object.values(attendanceByHours).map(
            (count) => ((count / totalRecords) * 100).toFixed(2)
          ),
          backgroundColor: ["rgba(255, 99, 132, 0.7)", "rgba(54, 162, 235, 0.7)"],
        },
      ],
    };

    setChartData({ bar: barData, pie: pieData });
  };

  return (
    <Layout>
      <div className="p-6 min-h-screen">
        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="loader">Loading...</div>
          </div>
        ) : (
          <>
            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <SummaryCard icon={<FaUsers />} title="Total Interns" value={employeeCount} />
              <div onClick={() => setShowAdminsModal(true)} className="cursor-pointer">
                <SummaryCard icon={<FaUserShield />} title="Total Admins" value={adminCount} />
              </div>
            </div>

            {/* Graph Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-lg shadow-md h-[400px]">
                <h2 className="text-lg font-bold">Timesheet Overview</h2>
                {chartData.bar ? (
                  <Bar data={chartData.bar} options={{ responsive: true }} />
                ) : (
                  <p className="text-gray-500 text-center mt-10">No data available</p>
                )}
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md h-[400px]">
                <h2 className="text-lg font-bold">Timesheet Breakdown</h2>
                {chartData.pie ? (
                  <Pie data={chartData.pie} options={{ responsive: true }} />
                ) : (
                  <p className="text-gray-500 text-center mt-10">No data available</p>
                )}
              </div>
            </div>

            {/* Admin List Modal */}
            {showAdminsModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
                <div className="bg-white p-6 rounded-lg w-full md:w-3/4 lg:w-1/2 shadow-lg">
                  <h2 className="text-2xl font-bold mb-4 text-center">Admin List</h2>
                  <div className="overflow-y-auto max-h-[400px]">
                    <table className="w-full table-auto border-collapse border">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border p-2 text-left">First Name</th>
                          <th className="border p-2 text-left">Last Name</th>
                          <th className="border p-2 text-left">Email</th>
                          <th className="border p-2 text-left">Phone No.</th>
                          <th className="border p-2 text-left">Designation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map((admin) => (
                          <tr key={admin._id} className="hover:bg-gray-100">
                            <td className="border p-2">{admin.firstName}</td>
                            <td className="border p-2">{admin.lastName}</td>
                            <td className="border p-2">{admin.email}</td>
                            <td className="border p-2">{admin.phone}</td>
                            <td className="border p-2">{admin.designation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setShowAdminsModal(false)}
                      className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
