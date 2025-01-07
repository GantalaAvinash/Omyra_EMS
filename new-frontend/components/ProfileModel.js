import React from "react";

const ProfileModel = ({ user, setOpenModal }) => {
  const handleLogout = () => {
    localStorage.clear();
    alert("You have been logged out.");
    window.location.href = "/";
  };

  return (
    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-48 z-50">
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">
          {user?.firstName?.toUpperCase() || "User"}
        </h3>
        <p className="text-sm text-gray-500 mb-4 capitalize">{localStorage.getItem("role")}</p>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
};


export default ProfileModel;
