import React from "react";

const WorkingHoursForm = ({ month, year, onMonthChange, onYearChange, onOverride }) => {
  return (
    <div className="bg-white m-2 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold my-6">Monthly Working Hours</h2>
      <div className="flex items-center space-x-4">
        <select
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="p-2 border rounded"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          placeholder="Year"
          className="w-[100px] p-2 border rounded"
        />
        <button
          onClick={onOverride}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Override Hours
        </button>
      </div>
    </div>
  );
};

export default WorkingHoursForm;
