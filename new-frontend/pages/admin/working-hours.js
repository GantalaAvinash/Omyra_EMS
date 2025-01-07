import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import TimesheetCalendar from "@/components/Admin/TimesheetCalendar";
import API from "@/lib/api";
import moment from "moment";

const WorkingHoursPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newHoliday, setNewHoliday] = useState({ id: null, name: "", date: "" });
  const [workingHours, setWorkingHours] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Fetch holidays and working hours
  useEffect(() => {
    fetchHolidays();
    fetchWorkingHours();
  }, [month, year]);

  const fetchHolidays = async () => {
    try {
      const { data } = await API.get("/admin/holidays");
      setHolidays(
        data.map((holiday) => ({
          id: holiday._id,
          name: holiday.name,
          date: moment(holiday.date).format("YYYY-MM-DD"),
        }))
      );
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  const fetchWorkingHours = async () => {
    try {
      const { data } = await API.get(`/admin/working-hours?month=${month}&year=${year}`);
      setWorkingHours(data.hours);
    } catch (error) {
      console.error("Error fetching working hours:", error);
    }
  };

  const handleAddOrUpdateHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) {
      alert("Please provide both holiday name and date.");
      return;
    }

    try {
      if (newHoliday.id) {
        // Update an existing holiday
        await API.patch(`/admin/holidays/${newHoliday.id}`, {
          name: newHoliday.name,
          date: newHoliday.date,
        });
        alert("Holiday updated successfully!");
      } else {
        // Add a new holiday
        await API.post("/admin/holidays", { name: newHoliday.name, date: newHoliday.date });
        alert("Holiday added successfully!");
      }
      fetchHolidays();
      setNewHoliday({ id: null, name: "", date: "" });
      setSelectedDate(null);
    } catch (error) {
      console.error("Error saving holiday:", error);
      alert("Failed to save holiday.");
    }
  };

  const handleDeleteHoliday = async () => {
    if (!newHoliday.id) return;

    const confirmDelete = confirm("Are you sure you want to delete this holiday?");
    if (confirmDelete) {
      try {
        await API.delete(`/admin/holidays/${newHoliday.id}`);
        alert("Holiday deleted successfully!");
        fetchHolidays();
        setNewHoliday({ id: null, name: "", date: "" });
        setSelectedDate(null);
      } catch (error) {
        console.error("Error deleting holiday:", error);
        alert("Failed to delete holiday.");
      }
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(moment(date).format("YYYY-MM-DD"));

    // Check if a holiday exists on this date
    const holiday = holidays.find((h) => h.date === moment(date).format("YYYY-MM-DD"));
    if (holiday) {
      setNewHoliday({ id: holiday.id, name: holiday.name, date: holiday.date });
    } else {
      setNewHoliday({ id: null, name: "", date: moment(date).format("YYYY-MM-DD") });
    }
  };

  const handleOverrideWorkingHours = async () => {
    const hours = prompt("Enter the new total working hours:");
    if (hours) {
      try {
        await API.put("/admin/working-hours", { month, year, hours });
        fetchWorkingHours();
        alert("Working hours updated successfully!");
      } catch (error) {
        console.error("Error overriding working hours:", error);
        alert("Failed to update working hours.");
      }
    }
  };

  return (
    <Layout>
      <div className="p-6 bg-[#13192F] min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-white">Manage Holidays and Working Hours</h1>

        {/* Calendar Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Holiday Calendar</h2>
          <TimesheetCalendar
            holidays={holidays}
            onDateClick={handleDateClick}
          />

          {selectedDate && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                {newHoliday.id ? "Update Holiday" : "Add Holiday"}
              </h3>
              <input
                type="text"
                placeholder="Holiday Name"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                className="p-2 border rounded mr-2"
              />
              <input
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                className="p-2 border rounded mr-2"
              />
              <button
                onClick={handleAddOrUpdateHoliday}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
              >
                {newHoliday.id ? "Update Holiday" : "Add Holiday"}
              </button>
              {newHoliday.id && (
                <button
                  onClick={handleDeleteHoliday}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete Holiday
                </button>
              )}
            </div>
          )}
        </div>

        {/* Working Hours Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Monthly Working Hours</h2>
          <div className="flex items-center space-x-4">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="p-2 border rounded"
            >
              {moment.months().map((m, idx) => (
                <option key={idx} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              placeholder="Year"
              className="p-2 border rounded"
            />
            <button
              onClick={handleOverrideWorkingHours}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Override Hours
            </button>
          </div>
          <p className="mt-4 text-lg">
            Total Working Hours for {moment().month(month - 1).format("MMMM")} {year}:{" "}
            <span className="font-bold">{workingHours} hours</span>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default WorkingHoursPage;
