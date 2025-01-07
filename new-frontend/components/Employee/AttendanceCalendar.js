import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const TimesheetOverview = ({ onDateClick, markedDates }) => {
  // Add custom class names for marked and today's dates
  const tileClassName = ({ date, view }) => {
    const formattedDate = date.toDateString();
    if (view === "month" && markedDates.includes(formattedDate)) {
      return "marked-date"; // Custom class for marked timesheet
    }
    if (view === "month" && formattedDate === new Date().toDateString()) {
      return "today-date"; // Custom class for today's date
    }
    return "";
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-container">
        <Calendar
          onClickDay={onDateClick}
          tileClassName={tileClassName}
          className="custom-calendar"
          aria-label="Timesheet calendar showing marked dates"
        />
      </div>
    </div>
  );
};
export default TimesheetOverview;
