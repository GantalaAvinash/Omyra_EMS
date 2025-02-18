import React from "react";

const SummaryCard = ({ icon, title, value }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex items-center space-x-4">
      <div className="text-3xl text-[#F94949]">{icon}</div>
      <div>
        <h3 className="text-[#091A29] text-sm font-semibold">{title}</h3>
        <p className="text-2xl text-gray-600 font-bold">{value}</p>
      </div>
    </div>
  );
};

export default SummaryCard;
