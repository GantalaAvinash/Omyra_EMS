import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import TimesheetCalendar from "@/components/Admin/TimesheetCalendar";
import HolidayForm from "@/components/Admin/HolidayForm";
import WorkingHoursForm from "@/components/Admin/WorkingHoursForm";
import API from "@/lib/api";
import moment from "moment";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const WorkingHoursPage = () => {
  const router = useRouter();
  const [holidays, setHolidays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newHoliday, setNewHoliday] = useState({ id: null, name: "", date: "" });
  const [workingHours, setWorkingHours] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchHolidays(), fetchWorkingHours()]);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

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
      toast.error("Failed to fetch holidays.");
    }
  };

  const fetchWorkingHours = async () => {
    try {
      const { data } = await API.get(`/admin/working-hours?month=${month}&year=${year}`);
      setWorkingHours(data.hours);
    } catch (error) {
      toast.error("Failed to fetch working hours.");
    }
  };

  const handleAddOrUpdateHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) {
      toast.warning("Please provide both holiday name and date.");
      return;
    }

    const existingHoliday = holidays.find(
      (h) => h.date === newHoliday.date && h.id !== newHoliday.id
    );
    if (existingHoliday) {
      toast.error("A holiday already exists on this date.");
      return;
    }

    try {
      if (newHoliday.id) {
        await API.patch(`/admin/holidays/${newHoliday.id}`, {
          name: newHoliday.name,
          date: newHoliday.date,
        });
        toast.success("Holiday updated successfully!");
      } else {
        await API.post("/admin/holidays", { name: newHoliday.name, date: newHoliday.date });
        toast.success("Holiday added successfully!");
      }
      fetchHolidays();
      resetHolidayForm();
    } catch (error) {
      toast.error("Failed to save holiday.");
    }
  };

  const resetHolidayForm = () => {
    setNewHoliday({ id: null, name: "", date: "" });
    setSelectedDate(null);
  };

  const handleOverrideWorkingHours = async () => {
    const hours = prompt("Enter the new total working hours:");
    if (hours) {
      try {
        await API.put("/admin/working-hours", { month, year, hours });
        fetchWorkingHours();
        toast.success("Working hours updated successfully!");
      } catch (error) {
        toast.error("Failed to update working hours.");
      }
    }
  };

  return (
    <Layout key={router.asPath}>
      <div className="flex flex-col md:flex-row min-h-[400px]">
        {/* Calendar Section */}
        <div className="md:w-1/2 w-full m-2 bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Holiday Calendar</h2>
          <TimesheetCalendar
            holidays={holidays}
            onDateClick={(date) => {
              setSelectedDate(moment(date).format("YYYY-MM-DD"));
              const holiday = holidays.find(
                (h) => h.date === moment(date).format("YYYY-MM-DD")
              );
              if (holiday) {
                setNewHoliday({ id: holiday.id, name: holiday.name, date: holiday.date });
              } else {
                setNewHoliday({ id: null, name: "", date: moment(date).format("YYYY-MM-DD") });
              }
            }}
          />
          {selectedDate && (
            <HolidayForm
              newHoliday={newHoliday}
              onChange={(field, value) => setNewHoliday({ ...newHoliday, [field]: value })}
              onSubmit={handleAddOrUpdateHoliday}
            />
          )}
        </div>

        {/* Working Hours Section */}
        <div className="bg-white md:w-1/2 m-2 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Monthly Working Hours</h2>
          <WorkingHoursForm
            month={month}
            year={year}
            workingHours={workingHours}
            onChangeMonth={(m) => setMonth(m)}
            onChangeYear={(y) => setYear(y)}
            onOverride={handleOverrideWorkingHours}
          />
          <p className="text-center mt-12 text-xl">
            Total Working Hours for {moment().month(month - 1).format("MMMM")} {year}:{" "}
            <span className="font-bold text-2xl">{workingHours} hours</span>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default WorkingHoursPage;
