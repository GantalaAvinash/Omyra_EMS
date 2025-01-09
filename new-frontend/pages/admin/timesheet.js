import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { fetchAttendanceReport } from "../../lib/api";
import { FaFileCsv, FaFilePdf, FaSearch } from "react-icons/fa";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useRouter } from "next/router";

const TimeSheet = () => {
  const router = useRouter();
  const [attendanceData, setAttendanceData] = useState([]); // Original Timesheet data
  const [filteredData, setFilteredData] = useState([]); // Filtered for display
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch and aggregate Timesheet data
  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        const { data } = await fetchAttendanceReport();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        if (Array.isArray(data)) {
          // Aggregate Timesheet by employee
          const aggregatedData = data.map((employee) => {
            const totalHours = employee.attendance.reduce((sum, record) => {
              return sum + (record.hours || 0);
            }, 0);

            // Calculate current month's hours
            const currentMonthHours = employee.attendance
              .filter((record) => {
                const recordDate = new Date(record.date);
                return (
                  recordDate.getFullYear() === currentYear &&
                  recordDate.getMonth() === currentMonth
                );
              })
              .reduce((sum, record) => sum + (record.hours || 0), 0);

            return {
              firstName: employee.firstName,
              lastName: employee.lastName,
              designation: employee.designation,
              totalHours,
              currentMonthHours,
            };
          });

          setAttendanceData(aggregatedData);
          setFilteredData(aggregatedData);
        } else {
          console.error("Invalid timesheet report data:", data);
        }
      } catch (error) {
        console.error("Error fetching timesheet report:", error);
      }
    };

    loadAttendanceData();
  }, []);

  // Apply search filter
  useEffect(() => {
    const filtered = attendanceData.filter((record) =>
      Object.values(record).some((value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [searchTerm, attendanceData]);

  // Download CSV
  const handleDownloadCSV = () => {
    if (!filteredData.length) {
      alert("No data available to download.");
      return;
    }

    const csvData = filteredData.map((record) => ({
      "First Name": record.firstName,
      "Last Name": record.lastName,
      Designation: record.designation,
      "Total Hours": record.totalHours,
      "Current Month Hours": record.currentMonthHours,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "TimeSheet_Report.csv";
    link.click();
  };

  // Download PDF
  const handleDownloadPDF = () => {
    if (!filteredData.length) {
      alert("No data available to download.");
      return;
    }

    const doc = new jsPDF();
    doc.text("TimeSheet Report", 14, 10);

    // Prepare table data for PDF
    const tableHead = [
      "First Name",
      "Last Name",
      "Designation",
      "Total Hours",
      "Current Month Hours",
    ];
    const tableBody = filteredData.map((record) => [
      record.firstName,
      record.lastName,
      record.designation,
      `${record.totalHours} hrs`,
      `${record.currentMonthHours} hrs`,
    ]);

    doc.autoTable({
      head: [tableHead],
      body: tableBody,
    });
    doc.save("TimeSheet_Report.pdf");
  };

  return (
    <Layout key={router.asPath}>
      <div className="p-6 min-h-[50%]">
        <h1 className="text-3xl font-bold mb-6 text-white">TimeSheet Management</h1>

        {/* Filters */}
        <div className="flex justify-between mb-4">
          {/* Search Input */}
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search by name, designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 border rounded"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
          </div>

          {/* Download Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleDownloadCSV}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
            >
              <FaFileCsv className="mr-2" /> CSV
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
            >
              <FaFilePdf className="mr-2" /> PDF
            </button>
          </div>
        </div>

        {/* TimeSheet Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">First Name</th>
                <th className="p-2 text-left">Last Name</th>
                <th className="p-2 text-left">Designation</th>
                <th className="p-2 text-left">Total Hours</th>
                <th className="p-2 text-left">{new Date().toLocaleString('default', { month: 'long' })} Hours</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-2">{record.firstName}</td>
                    <td className="p-2">{record.lastName}</td>
                    <td className="p-2">{record.designation}</td>
                    <td className="p-2">{record.totalHours} hrs</td>
                    <td className="p-2">{record.currentMonthHours} hrs</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2 text-center" colSpan="5">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default TimeSheet;
