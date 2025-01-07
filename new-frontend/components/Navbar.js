import React, { useState, useEffect } from "react";
import ProfileModel from "./ProfileModel";
import { fetchAllDailyTask } from "@/lib/api";

const Navbar = React.memo(function Navbar() {
  const [openModal, setOpenModal] = useState(false);
  const [user, setUser] = useState(null);

  // Validate token and fetch tasks from API when resonse is 403 then redirect to login page
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetchAllDailyTask();
      } catch (error) {
        localStorage.clear();
        alert("Login Timeout. Please log in again.");
        window.location.href = "/";
      }
    };

    fetchTasks();
  }, []);


  // Validate token and fetch user details
  useEffect(() => {
    const validateAndFetchUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const userRole = localStorage.getItem("role");

        if (!storedUser || !userRole) {
          localStorage.clear();
          alert("Session expired. Please log in again.");
          window.location.href = "/";
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(userRole === "admin" ? parsedUser.admin : parsedUser.intern);
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.clear();
        alert("Failed to retrieve user details. Please log in again.");
        window.location.href = "/";
      }
    };

    validateAndFetchUser();
  }, []);

  return (
    <div className="bg-[#1E2742] h-20 p-4 flex justify-between items-center text-white shadow-md">
      {/* Navbar Title */}
      <h1 className="ml-8 text-lg font-bold text-white">
        Hello, {user?.firstName?.toUpperCase() || "Guest"} ({user?.role.toUpperCase()})
      </h1>

      {/* Profile Section */}
      <div className="relative">
        <div
          className="w-10 h-10 bg-[#808080] rounded-full cursor-pointer flex justify-center items-center text-white font-bold uppercase"
          onClick={() => setOpenModal(!openModal)}
        >
          {user?.firstName?.charAt(0).toUpperCase() || "?"}
        </div>

        {/* Profile Modal */}
        {openModal && (
          <ProfileModel user={user} setOpenModal={setOpenModal} />
        )}
      </div>
    </div>
  );
});

export default Navbar;
