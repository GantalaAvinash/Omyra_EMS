import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  MdDashboard,
  MdPerson,
  MdAccessTime,
  MdMenu,
  MdGroup,
  MdAssignment,
  MdReport,
  MdSettings,
  MdCalendarMonth,
  MdTimeline,
} from "react-icons/md";
import logo from "../public/logo.png";
import logo_full from "../public/logo-full.png";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();
  const [role, setRole] = useState("employee");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole || "Intern"); // Default to "employee" if no role found
  }, []);

  const adminLinks = [
    { href: "/admin/dashboard", icon: <MdDashboard />, label: "Dashboard" },
    { href: "/admin/interns", icon: <MdGroup />, label: "Interns" },
    { href: "/admin/timesheet", icon: <MdTimeline />, label: "TimeSheet" },
    { href: "/admin/createtask", icon: <MdAssignment />, label: "Create Task" },
    { href: "/admin/reports", icon: <MdReport />, label: "Reports" },
    { href: "/admin/working-hours", icon: <MdCalendarMonth />, label: "Manage Holidays" },
    { href: "/admin/settings", icon: <MdSettings />, label: "Settings" },
  ];

  const employeeLinks = [
    { href: "/intern/dashboard", icon: <MdDashboard />, label: "Home" },
    { href: "/intern/timesheet", icon: <MdAccessTime />, label: "TimeSheet" },
    { href: "/intern/roadmap", icon: <MdAssignment />, label: "Roadmap" },
    { href: "/intern/people", icon: <MdGroup />, label: "People" },
    { href: "/intern/profile", icon: <MdPerson />, label: "Profile" },
  ];

  const links = role === "admin" ? adminLinks : employeeLinks;

  const getLinkClasses = (href) =>
    `flex items-center p-3 rounded-l-[20px] cursor-pointer 
 transition-all duration-500 ease-in-out 
 ${router.pathname.startsWith(href) 
    ? "bg-[#EE161F] shadow-xl text-white font-semibold scale-105" 
    : "hover:bg-[#F9FAFB] hover:text-black hover:scale-105"}`;

  return (
    <div
      className={`bg-[#F9FAFB] text-black fixed md:relative z-50 min-h-screen flex flex-col pl-4 transition-all duration-500 ease-in-out rounded-r-2xl shadow-lg ${isOpen ? "w-64" : "w-16"}`}
    >
      <div className="flex items-center p-3 border-r border-b border-[#e1e1e1]">
      <div className="flex items-center gap-3 transition-all duration-500 ease-in-out">
        {<><Image
          src={logo}
          alt="Logo"
          className={`transition-all duration-500 ${
            isOpen ? "h-14 w-14" : "h-14 w-10 mx-auto"
          }`}
        />
        <h1
          className={`text-lg text-black font-bold whitespace-nowrap transition-opacity duration-500 ${
            isOpen ? "opacity-100 block" : "opacity-0 hidden"
          }`}
        >
          Omyra Tech
        </h1></>}
      </div>
      {/* rounded outline  */}
        <button
          className="ml-auto text-[#E16349] focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          <MdMenu size={24} />
        </button>
      </div>

      <nav className="mt-6 space-y-2 flex-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href} shallow>
            <div className={getLinkClasses(link.href)}>
              <span className="text-2xl">{link.icon}</span>
              {isOpen && <span className="ml-4 text-lg font-medium">{link.label}</span>}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
