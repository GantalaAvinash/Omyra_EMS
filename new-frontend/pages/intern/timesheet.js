// Updated frontend TimeSheet component
"use client";
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { markAttendance, fetchInternAttendance } from "../../lib/api";
import Layout from "@/components/Layout";
import { toast } from "react-toastify";

const localizer = momentLocalizer(moment);

const TimeSheet = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workingHours, setWorkingHours] = useState("");
  const [dayTask, setDayTask] = useState("");
  const [events, setEvents] = useState([]);
  const [intern, setIntern] = useState(null);
  const [message, setMessage] = useState("");
  const [isMarked, setIsMarked] = useState(false);
  const [holiday, setHolidays] = useState([]);

  useEffect(() => {
    const loadInternAndData = async () => {
      if (typeof window !== "undefined") {
        const storedIntern = JSON.parse(localStorage.getItem("user"))?.intern || {};
        setIntern(storedIntern);

        try {
          const { data } = await fetchInternAttendance(storedIntern.internId);
          const calendarEvents = data.map((record) => ({
            id: record._id,
            title: `${record.hours} hrs: ${record.dayTask}`,
            start: new Date(record.date),
            end: new Date(record.date),
          }));
          
          setEvents(calendarEvents);
        } catch (error) {
          console.error("Error fetching attendance data:", error);
        }
      }
    };

    loadInternAndData();
  }, []);

  const handleDateClick = (slotInfo) => {
    const selected = slotInfo.start;
    const formattedDate = moment(selected).format("YYYY-MM-DD");
    const existingEvent = events.find(
      (event) => moment(event.start).format("YYYY-MM-DD") === formattedDate
    );

    setSelectedDate(selected);
    setIsMarked(!!existingEvent);
    setWorkingHours(existingEvent ? existingEvent.title.split(" ")[0] : "");
    setDayTask(existingEvent ? existingEvent.title.split(": ")[1] : "");
    setMessage("");
  };

  const handleSubmit = async () => {
    if (!workingHours || !dayTask || isMarked) return;

    const formattedDate = moment(selectedDate).format("YYYY-MM-DD");

    const userConfirmed = window.confirm(
      `You are about to mark Timesheet for:\n\nDate: ${formattedDate}\nHours: ${workingHours} hrs\nTask: ${dayTask}\n\nDo you confirm?`
    );

    if (!userConfirmed) return;

    try {
      await markAttendance({
        date: formattedDate,
        hours: workingHours,
        dayTask,
        internId: intern?.internId,
      });

      setEvents([
        ...events,
        {
          title: `${workingHours} hrs: ${dayTask}`,
          start: new Date(formattedDate),
          end: new Date(formattedDate),
        },
      ]);
      setMessage(`Timesheet marked successfully for ${formattedDate}`);
      toast.success(`Timesheet marked successfully for ${formattedDate}`);
      setWorkingHours("");
      setDayTask("");
      setIsMarked(true);
    } catch (error) {
      toast.error("Failed to mark Timesheet");
      alert("Failed to mark Timesheet");
    }
  };

  return (
    <Layout>
      <div className="">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">TimeSheet Calendar</h2>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              selectable
              onSelectSlot={handleDateClick}
              views={["month"]}
              defaultView="month"
              popup
              className="text-gray-800"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Mark Timesheet</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Selected Date</label>
              <input
                type="text"
                value={moment(selectedDate).format("YYYY-MM-DD")}
                disabled
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Working Hours</label>
              <input
                type="number"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                disabled={isMarked}
                placeholder="Enter working hours"
                className="w-full p-2 border rounded focus:outline-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Day Task</label>
              <input
                type="text"
                value={dayTask}
                onChange={(e) => setDayTask(e.target.value)}
                disabled={isMarked}
                placeholder="Enter day task"
                className="w-full p-2 border rounded focus:outline-blue-500"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isMarked}
              className={`w-full text-white py-2 rounded ${
                isMarked
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 transition duration-300"
              }`}
            >
              {isMarked ? "Already Marked" : "Submit Timesheet"}
            </button>

            {message && (
              <p className="mt-4 text-green-600 text-center font-medium">{message}</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TimeSheet;
