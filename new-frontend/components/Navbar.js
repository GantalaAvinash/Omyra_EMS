import React, { useState, useEffect } from "react";
import ProfileModel from "./ProfileModel";
import { fetchAllDailyTask } from "@/lib/api";
import { useRouter } from "next/router";

const Navbar = React.memo(function Navbar() {
  const [openModal, setOpenModal] = useState(false);
  const [user, setUser] = useState(null);

  const Router = useRouter();

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

  const titles = [
    "Dashboard",
    "Interns Management",
    "TimeSheet Management",
    "Task Management",
    "Reports Management",
    "Holidays & Working Hours Management",
    "Settings Management",
    "Peoples Management",
    "Profile",   
  ]

  return (
    <div className="bg-[#F9FAFB] h-20 p-4 flex justify-between items-center  shadow-md">
      {/* Navbar Title */}
      <h1 className="ml-8 text-lg font-bold ">
        {
          Router.pathname === "/admin/dashboard" ? titles[0] : 
          Router.pathname === "/admin/interns" ? titles[1] :
          Router.pathname === "/admin/timesheet" ? titles[2] :
          Router.pathname === "/admin/createtask" ? titles[3] :
          Router.pathname === "/admin/reports" ? titles[4] :
          Router.pathname === "/admin/working-hours" ? titles[5] :
          Router.pathname === "/admin/settings" ? titles[6] :
          Router.pathname === "/intern/people" ? titles[7] :
          Router.pathname === "/intern/dashboard" ? titles[0] :
          Router.pathname === "/intern/profile" ? titles[8] :
          Router.pathname === "/intern/timesheet" ? titles[2] :
          Router.pathname === "/intern/roadmap" ? titles[3] :
          titles[8]
        }
      </h1>

      {/* Profile Section */}
      <div className="relative">
        <div
          className="w-10 h-10 bg-[#E16349] text-white rounded-full cursor-pointer flex justify-center items-center  font-bold uppercase"
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
