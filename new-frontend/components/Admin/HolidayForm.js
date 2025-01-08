import React from "react";

const HolidayForm = ({ newHoliday, onChange, onSubmit }) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">
        {newHoliday.id ? "Update Holiday" : "Add Holiday"}
      </h3>
      <input
        type="text"
        placeholder="Holiday Name"
        value={newHoliday.name}
        onChange={(e) => onChange("name", e.target.value)}
        className="p-2 border rounded mr-2"
      />
      <input
        type="date"
        value={newHoliday.date}
        onChange={(e) => onChange("date", e.target.value)}
        className="p-2 border rounded mr-2"
      />
      <button
        onClick={onSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
      >
        {newHoliday.id ? "Update Holiday" : "Add Holiday"}
      </button>
    </div>
  );
};

export default HolidayForm;
