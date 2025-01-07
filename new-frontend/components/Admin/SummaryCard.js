import React from "react";

const SummaryCard = ({ icon, title, value }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
      <div className="text-3xl text-blue-500">{icon}</div>
      <div>
        <h3 className="text-gray-600 text-sm font-semibold">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default SummaryCard;
