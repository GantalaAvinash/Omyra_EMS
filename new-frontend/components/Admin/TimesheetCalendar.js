import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import moment from "moment";

const TimesheetCalendar = ({ onDateClick, holidays }) => {
  // Add tile content for holidays
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = holidays.find((h) =>
        moment(h.date).isSame(date, "day")
      );
      return holiday ? (
        <div className="holiday-marker">
          <span className="text-red-500 text-xs font-bold">
            {holiday.name}
          </span>
        </div>
      ) : null;
    }
    return null;
  };

  return (
    <div className="calendar-container">
      <Calendar
        onClickDay={onDateClick}
        tileContent={tileContent}
        className="custom-calendar"
      />
    </div>
  );
};

export default TimesheetCalendar;
