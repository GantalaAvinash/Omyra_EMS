import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { fetchInternAttendace, fetchInternTasks } from "../../lib/api";
import Layout from "@/components/Layout";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "chart.js/auto";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const [intern, setIntern] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [weeklyHours, setWeeklyHours] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [averageHours, setAverageHours] = useState(0);
  const [topDay, setTopDay] = useState(null);
  const [zeroHoursDays, setZeroHoursDays] = useState(0);
  const [tasks, setTasks] = useState([]);

  // Fetch Intern Details
  useEffect(() => {
    
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userRole = localStorage.getItem("role");

    if (userRole === "intern" && storedUser?.intern) {
      setIntern(storedUser.intern); 
    } else {
      console.error("No valid intern found in local storage.");
    }
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!intern) return;
      // Fetch Tasks for Intern from API and then segregate them based on due date
      try {
        const { data } = await fetchInternTasks(intern.internId);
        if (!Array.isArray(data) || data.length === 0) {
          console.warn("No tasks found for internId:", intern.internId);
        }
        console.log("Tasks", data);
        setTasks(data);
      } catch (error) {
        console.error("Error fetching Tasks data:", error);
      }
    };

    const dueTasks = tasks.filter((task) => new Date(task.date) <= new Date());
    if (dueTasks.length > 0) {
      dueTasks.forEach((task) => {
        toast.warn(`Task "${task.title}" is overdue!`);
      });
    }
    console.log("DueTasks", dueTasks);
      
  
    fetchTasks();
  }, [intern, tasks]);
  
  


  // Fetch Attendance Data
  useEffect(() => {
    const loadAttendanceData = async () => {
      if (!intern?.internId) {
        console.warn("No internId available for fetching attendance.");
      }

      try {
        const { data } = await fetchInternAttendace(intern?.internId);
        if (!Array.isArray(data) || data.length === 0) {
          console.warn("No attendance data found for internId:", intern.internId);
        }

        setAttendanceData(data);

        // Total Working Hours
        const total = data.reduce((sum, record) => sum + (record.hours || 0), 0);
        setTotalHours(total);

        // Calculate Weekly and Daily Stats
        const groupedByWeek = {};
        let dailyMax = { date: "", hours: 0 };
        let zeroDaysCount = 0;

        data.forEach((record) => {
          if (!record.date) return;
          const day = new Date(record.date).toLocaleDateString("en-US", { weekday: "long" });
          groupedByWeek[day] = (groupedByWeek[day] || 0) + (record.hours || 0);

          if (record.hours > dailyMax.hours) {
            dailyMax = { date: record.date, hours: record.hours };
          }

          if (record.hours === 0) zeroDaysCount++;
        });

        setWeeklyHours(Object.entries(groupedByWeek).map(([day, hours]) => ({ day, hours })));
        setTopDay(dailyMax);
        setZeroHoursDays(zeroDaysCount);

        // Average Hours
        const average = total / (data.length || 1);
        setAverageHours(average.toFixed(2));

        // Date Range
        const dates = data.map((record) => new Date(record.date));
        setDateRange({
          from: new Date(Math.min(...dates)),
          to: new Date(Math.max(...dates)),
        });
      } catch (error) {
        console.error("Error fetching Timesheet data:", error);
      }
    };

    if (intern) {
      loadAttendanceData();
    }
  }, [intern]);

  // Task Notifications based on Due Date and Time and on login
  useEffect(() => {
    if (tasks.length === 0) return;
  
    const now = new Date();
  
    tasks.forEach((task) => {
      const taskDueDate = new Date(task.date);
  
      if (taskDueDate.toDateString() === now.toDateString()) {
        toast.warn(`Task "${task.title}" is due today!`);
      } else if (taskDueDate < now) {
        toast.error(`Task "${task.title}" is overdue!`);
      } else if (taskDueDate - now < 24 * 60 * 60 * 1000) {
        toast.warn(`Task "${task.title}" is due within 24 hours!`);
      }
    });
  }, [tasks]);
  
  

  // Download Timesheet as CSV
  const handleDownloadCSV = () => {
    if (!attendanceData.length) {
      alert("No Timesheet data to download.");
    }

    const csvData = attendanceData.map((record) => ({
      Date: new Date(record.date).toLocaleDateString("en-US"),
      Hours: record.hours || 0,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Timesheet_Report_${intern?.firstName || "User"}.csv`);
  };

  // Download Timesheet as PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Timesheet Report", 14, 10);

    const tableData = attendanceData.map((record) => [
      new Date(record.date).toLocaleDateString("en-US"),
      record.hours || 0,
    ]);

    doc.autoTable({
      head: [["Date", "Working Hours"]],
      body: tableData,
    });

    doc.save(`Timesheet_Report_${intern?.firstName || "User"}.pdf`);
  };


  // Chart Data
  const barChartData = {
    labels: weeklyHours.map((item) => item.day),
    datasets: [
      {
        label: "Daily Working Hours",
        data: weeklyHours.map((item) => item.hours),
        backgroundColor: [
          "rgba(255, 99, 133, 0.62)",
          "rgba(54, 163, 235, 0.65)",
          "rgba(255, 207, 86, 0.62)",
          "rgba(75, 192, 192, 0.64)",
          "rgba(153, 102, 255, 0.59)",
          "rgba(255, 160, 64, 0.58)",
          "rgba(233, 30, 98, 0.57)",
        ],
        borderRadius: 8,
        hoverBackgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
          "rgba(233, 30, 99, 0.8)",
        ],
      },
    ],
  };
  
  // Filter out weekends and include records with 0 hours
const filteredAttendance = attendanceData.filter((record) => {
  const day = new Date(record.date).getDay();
  return day !== 0 && day !== 6; // Exclude Sundays (0) and Saturdays (6)
});

// Group Timesheet by hours (including 0 hours)
const attendanceByHours = filteredAttendance.reduce((acc, record) => {
  const hours = record.hours || 0; // Ensure 0 hours are included
  acc[hours] = (acc[hours] || 0) + 1;
  return acc;
}, {});

// Calculate total filtered records for percentages
const totalRecords = filteredAttendance.length;

// Prepare data for pie chart
const pieLabels = Object.keys(attendanceByHours).map((hours) => `${hours} hours`);
const pieData = Object.values(attendanceByHours).map(
  (count) => ((count / totalRecords) * 100).toFixed(2) // Convert to percentage
);

const pieChartData = {
  labels: pieLabels,
  datasets: [
    {
      data: pieData,
      backgroundColor: [
        "rgba(255, 99, 132, 0.7)", // Red
        "rgba(54, 162, 235, 0.7)", // Blue
        "rgba(255, 206, 86, 0.7)", // Yellow
        "rgba(75, 192, 192, 0.7)", // Green
        "rgba(153, 102, 255, 0.7)", // Purple
        "rgba(255, 159, 64, 0.7)", // Orange
      ],
      hoverBackgroundColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
    },
  ],
};


  const userName = `${intern?.firstName || "Guest"} ${intern?.lastName || ""}`.trim();

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold ">Welcome, {userName.toUpperCase()}!</h1>
          <div>
            <button
              onClick={handleDownloadCSV}
              className="bg-blue-500 text-white py-2 px-4 rounded mr-2 hover:bg-blue-600 transition"
            >
              Download CSV
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
            >
              Download PDF
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-300 rounded-lg shadow-md p-6 mb-6">
        {/* Enhanced Heading */}
        <h2 className="text-2xl font-bold mb-4 flex items-center text-yellow-700 animate-pulse">
          <span className="mr-2">📋 Today&apos;s Tasks</span> 
          {tasks.length > 0 && (
            <span className="ml-2 bg-yellow-500 text-white text-sm px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          )}
        </h2>

        {/* Task List */}
        {tasks.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <li
                key={task._id}
                className="py-4 flex justify-between bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{task.title}</h3>
                  <p className="text-md font-medium text-gray-800">{task.description}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Due: {new Date(task.date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No tasks assigned for today.</p>
        )}
      </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="p-6 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-xl font-bold mb-2">Total Working Hours</h2>
            <p className="text-3xl font-semibold text-blue-500">{totalHours} hrs</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-xl font-bold mb-2">Average Daily Hours</h2>
            <p className="text-3xl font-semibold text-green-500">{averageHours} hrs</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-xl font-bold mb-2">Top Performing Day</h2>
            <p className="text-md font-medium text-gray-700">
              {topDay?.date ? new Date(topDay.date).toLocaleDateString() : "N/A"}
            </p>
            <p className="text-2xl font-semibold text-purple-500">{topDay?.hours} hrs</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-xl font-bold mb-2">Idle Days</h2>
            <p className="text-3xl font-semibold text-red-500">{zeroHoursDays} Days</p>
          </div>
        </div>

        {/* Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-8 bg-white rounded-lg shadow-lg h-[420px]">
            <h2 className="text-xl my-2 font-bold">Daily Working Hours</h2>
            <div className="h-[300px]">
              <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="p-8 bg-white rounded-lg shadow-lg h-[420px]">
            <h2 className="text-xl my-2 font-bold">Timesheet Breakdown</h2>
            <div className="h-[300px]">
              <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
