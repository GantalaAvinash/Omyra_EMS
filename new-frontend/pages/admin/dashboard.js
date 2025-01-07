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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch employee and admin data
      const { data: interns } = await fetchInterns();
      if (Array.isArray(interns)) {
        setEmployeeCount(interns.length);
      }

      const { data: adminList } = await fetchAdmins();
      setAdminCount(adminList.length);
      setAdmins(adminList);

      // Fetch Timesheet data
      const { data: attendance } = await fetchAttendance();
      if (Array.isArray(attendance)) {
        prepareChartData(attendance);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const prepareChartData = (attendance) => {
    // Filter weekdays only and exclude weekends
    const filteredAttendance = attendance.filter((record) => {
      const day = new Date(record.date).getDay();
      return day !== 0 && day !== 6; // Exclude Sundays (0) and Saturdays (6)
    });

    // Group Timesheet by day of the month
    const daysInMonth = {};
    filteredAttendance.forEach((record) => {
      const day = new Date(record.date).getDate();
      daysInMonth[day] = (daysInMonth[day] || 0) + (record.hours || 0);
    });

    // Prepare Bar Chart Data
    const barData = {
      labels: Object.keys(daysInMonth).map((day) => `Day ${day}`),
      datasets: [
        {
          label: "Monthly Timesheet (Hours)",
          data: Object.values(daysInMonth),
          backgroundColor: [
            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
            "#FF9F40", "#E83E8C", "#5A9BD5", "#70AD47", "#F39C12",
          ],
        },
      ],
    };

    // Group Timesheet by hours (including 0 hours)
    const attendanceByHours = filteredAttendance.reduce((acc, record) => {
      const hours = record.hours || 0;
      acc[hours] = (acc[hours] || 0) + 1;
      return acc;
    }, {});

    const totalRecords = filteredAttendance.length;

    // Prepare Pie Chart Data
    const pieData = {
      labels: Object.keys(attendanceByHours).map((hours) => `${hours} hours`),
      datasets: [
        {
          data: Object.values(attendanceByHours).map(
            (count) => ((count / totalRecords) * 100).toFixed(2)
          ),
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)", "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)", "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)", "rgba(255, 159, 64, 0.7)",
          ],
          hoverBackgroundColor: [
            "rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)", "rgba(255, 159, 64, 1)",
          ],
        },
      ],
    };

    setChartData({ bar: barData, pie: pieData });
  };

  return (
    <Layout>
      <div className="p-6 bg-[#13192F] min-h-screen">
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
            <h2 className="text-lg font-bold ">{new Date().toLocaleDateString("en-US", { month: "long" })} TimeSheet</h2>
            {chartData.bar && <Bar data={chartData.bar} options={{ responsive: true }} />}
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md h-[400px]">
            <h2 className="text-lg font-bold">TimeSheet Breakdown</h2>
            {chartData.pie && <Pie data={chartData.pie} options={{ responsive: true }} />}
          </div>
        </div>

        {/* Admin List Modal */}
        {showAdminsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
            <div className="bg-white p-6 rounded-lg w-full md:w-3/4 lg:w-1/2 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-center">Admin List</h2>
              <div className="overflow-x-auto">
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
      </div>
    </Layout>
  );
};

export default Dashboard;
