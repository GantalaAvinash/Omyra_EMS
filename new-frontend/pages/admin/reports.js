import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { fetchAttendance, fetchInterns } from "../../lib/api";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";
import API from "@/lib/api"; // To fetch monthly working hours

const Reports = () => {
  const [interns, setInterns] = useState([]);
  const [TimeSheet, SetTimeSheet] = useState([]);
  const [selectedInternId, setSelectedInternId] = useState("");
  const [id, setId] = useState("");
  const [SelectedTimesheet, SetSelectedTimesheet] = useState([]);
  const [designations, setDesignations] = useState("");
  const [tasks, setTasks] = useState([]);
  const [monthlyHours, setMonthlyHours] = useState(0);
  const [pricePerHour, setPricePerHour] = useState(0);
  const [calculatedSalary, setCalculatedSalary] = useState(0);
  const [stats, setStats] = useState({
    monthlyInternHours: {},
    avgHours: 0,
    fromDate: "",
    toDate: "",
  });

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: internData } = await fetchInterns();
        const { data: TimeSheetData } = await fetchAttendance();
        const sortedInterns = internData.sort((a, b) => a.internId.localeCompare(b.internId));
        setInterns(sortedInterns);
        SetTimeSheet(TimeSheetData);

        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const { data: workingHoursData } = await API.get(
          `admin/working-hours?month=${month}&year=${year}`
        );
        setMonthlyHours(workingHoursData.hours);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedInternId && designations) {
      fetchTasks();
    }
  }, [selectedInternId, designations]);

  const fetchTasks = async () => {
    try {
      const response = await API.get(`/admin/tasks/designation/${designations}`);
      const allTasks = response.data;
      console.log("All tasks:", allTasks);
      const completedResponse = await API.get(`/admin/intern/task-status/${id}`);
      const completedTaskIds = completedResponse.data.map(task => task.internId);
      console.log("Completed tasks:", completedTaskIds);
      const pendingTasks = allTasks
        .filter(task => !completedTaskIds.includes(task._id))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setTasks(pendingTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("Failed to fetch tasks. Please try again.");
    }
  };

  useEffect(() => {
    if (selectedInternId) {
      let employeeAttendance = TimeSheet.filter(
        (record) => record.internId === selectedInternId
      );

      if (interns) {
        const selectedIntern = interns.find((emp) => emp.internId === selectedInternId);
        if (selectedIntern) {
          setDesignations(selectedIntern.designation);
          setId(selectedIntern._id);
        }
      }

      employeeAttendance = employeeAttendance.sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      const updatedAttendance = employeeAttendance.map((record) => {
        const recordDate = new Date(record.date);
        const day = recordDate.toLocaleDateString("en-US", { weekday: "long" });
        return {
          ...record,
          dateWithDay: `${recordDate.toLocaleDateString()}, ${day}`,
          hours: record.hours || "Weekend",
        };
      });

      const monthlyEmployeeHours = updatedAttendance.reduce((acc, record) => {
        const month = new Date(record.date).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + (Number(record.hours) || 0);
        return acc;
      }, {});

      const avgHours = Object.values(monthlyEmployeeHours).reduce(
        (sum, hours) => sum + hours,
        0
      ) / updatedAttendance.length;

      const dates = updatedAttendance.map((record) => new Date(record.date));
      const fromDate = new Date(Math.min(...dates)).toLocaleDateString();
      const toDate = new Date(Math.max(...dates)).toLocaleDateString();

      setStats({
        monthlyInternHours: monthlyEmployeeHours,
        avgHours: avgHours.toFixed(2),
        fromDate,
        toDate,
      });

      SetSelectedTimesheet(updatedAttendance);

      if (pricePerHour > 0) {
        setCalculatedSalary((monthlyEmployeeHours[currentMonthKey] || 0) * pricePerHour);
      }
    }
  }, [selectedInternId, TimeSheet, pricePerHour]);

  const handlePriceChange = (e) => {
    const value = parseFloat(e.target.value);
    setPricePerHour(value || 0);
    if (stats.monthlyInternHours[currentMonthKey]) {
      setCalculatedSalary(stats.monthlyInternHours[currentMonthKey] * value);
    }
  };

  const exportCSV = () => {
    const csvData = SelectedTimesheet.map((record) => ({
      Date: record.dateWithDay,
      "Working Hours": record.hours,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Employee_${selectedInternId}_TimeSheet.csv`);
  };

  const exportPDF = () => {
    if (!SelectedTimesheet.length) {
      alert("No data available to download.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`TimeSheet Report for Intern: ${selectedInternId}`, 14, 10);
    doc.setFontSize(12);
    const selectedIntern = interns.find(
      (emp) => emp.internId === selectedInternId
    );
    if (selectedIntern) {
      doc.text(`Name: ${selectedIntern.firstName} ${selectedIntern.lastName}`, 14, 20);
    }

    if (pricePerHour > 0) {
      doc.text(`Calculated Salary: ₹${calculatedSalary.toFixed(2)}`, 14, 30);
    }

    const tableHead = [["Date", "Working Hours"]];
    const tableBody = SelectedTimesheet.map((record) => [
      record.dateWithDay,
      record.hours,
    ]);

    doc.autoTable({
      head: tableHead,
      body: tableBody,
      startY: 40,
      margin: { top: 10 },
    });

    doc.save(`TimeSheet_Report_${selectedInternId}.pdf`);
  };

  const employeeCurrentMonthHours = stats.monthlyInternHours[currentMonthKey] || 0;

  return (
    <Layout>
      <div className="p-6 bg-[#13192F]">
        <h1 className="text-3xl font-bold mb-6 text-white">Intern {new Date().toLocaleDateString("en-US", { month: "long" })} Month Report</h1>

        <div className="mb-6">
          <label className="block text-lg font-medium mb-2 text-white">Select Intern</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedInternId}
            onChange={(e) => setSelectedInternId(e.target.value)}
          >
            <option value="">-- Select Intern --</option>
            {interns.map((emp) => (
              <option key={emp._id} value={emp.internId}>
                {emp.internId} - {emp.firstName}
              </option>
            ))}
          </select>
        </div>

        {selectedInternId && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-4 rounded shadow-md text-center">
                <h2 className="text-xl font-bold">{new Date().toLocaleDateString("en-US", { month: "long" })} Hours</h2>
                <p className="text-2xl text-blue-500">{monthlyHours} hrs</p>
              </div>
              <div className="bg-white p-4 rounded shadow-md text-center">
                <h2 className="text-xl font-bold">Intern Monthly Hours</h2>
                <p className="text-2xl text-green-500">{employeeCurrentMonthHours} hrs</p>
              </div>
              <div className="bg-white p-4 rounded shadow-md text-center">
                <h2 className="text-xl font-bold">Date Range</h2>
                <p className="text-lg text-gray-700">{stats.fromDate} - {stats.toDate}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-lg text-white font-medium mb-2">Price Per Hour</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border rounded"
                value={pricePerHour}
                onChange={handlePriceChange}
                placeholder="Enter price per hour"
              />
            </div>

            {pricePerHour > 0 && (
              <div className="bg-white p-4 rounded shadow-md text-center mb-6">
                <h2 className="text-xl font-bold">Calculated Salary</h2>
                <p className="text-2xl text-purple-500">₹{calculatedSalary.toFixed(2)}</p>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="w-full md:w-1/2 p-3">
              <div className="bg-white p-4 rounded-lg shadow-lg md:h-[400px] h-auto overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Detailed Timesheet</h2>
                  <div className="flex space-x-4">
                    <button
                      className="bg-green-500 text-white text-sm py-2 px-2 rounded hover:bg-green-600"
                      onClick={exportCSV}
                    >
                      Download CSV
                    </button>
                    <button
                      className="bg-red-500 text-white text-sm py-2 px-6 rounded hover:bg-red-600"
                      onClick={exportPDF}
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
                <table className="w-full table-auto border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2 text-md text-left">Date</th>
                      <th className="border p-2 text-md text-left">Working Hours</th>
                      <th className="border p-2 text-md text-left">Daily Task</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SelectedTimesheet.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border text-sm p-2">{record.dateWithDay}</td>
                        <td className="border text-sm p-2">{record.hours}</td>
                        <td className="border text-sm p-2">{record.dayTask}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              <div className="w-full md:w-1/2 p-4">
              <div className="bg-white p-4 rounded-lg shadow-lg md:h-[400px] h-auto overflow-y-auto">
                  <h2 className="text-xl text-center font-semibold">Pending Tasks</h2>
                <table className="w-full table-auto border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-200 ">
                      <th className="border p-2 text-md text-left">Date</th>
                      <th className="border p-2 text-md text-left">Task Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border text-sm p-2">{new Date(record.date).toLocaleDateString('en-UK')}</td>
                        <td className="border text-sm p-2">{record.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
