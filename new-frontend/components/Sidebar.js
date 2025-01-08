import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  MdDashboard,
  MdPerson,
  MdAccessTime,
  MdMenu,
  MdGroup,
  MdAssignment,
  MdTimeline,
  MdReport,
  MdSettings,
  MdCalendarMonth,
} from "react-icons/md";
import fullLogo from "../public/omyra-w.png";
import smallLogo from "../public/white-red.png";

const SidebarComponent = ({ isOpen, toggleSidebar }) => {
  const router = useRouter(); // Detect current route
  const [role, setRole] = useState(null);

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

  return (
    <div
      className={`bg-[#1E2742] text-white fixed md:relative z-50 min-h-screen ${
        isOpen ? "w-64" : "w-16"
      } transition-all duration-300 ease-in-out flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center px-2">
        {
          isOpen ? (
            <img src={fullLogo.src} alt="Omyra Tech" className="w-[130px]" />
          ) : (
            <img src={smallLogo.src} alt="Omyra Tech" className="my-4 h-12 w-16" />
          )
        }
        {/* {isOpen && (
          <h1 className="ml-2 text-lg text-white font-bold whitespace-nowrap">
            Omyra Tech
          </h1>
        )} */}
        <button
          className="ml-auto text-white focus:outline-none"
          onClick={toggleSidebar}
        >
          <MdMenu size={24} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="mt-6 ml-4 space-y-2 flex-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
          <div
            className={`flex items-center p-3 rounded cursor-pointer transition-all ${
              router.pathname === link.href
                ? "bg-white text-black"
                : "hover:bg-[#1E3A8A]"
            }`}
          >
            <span className="text-2xl">{link.icon}</span>
            {isOpen && (
              <span className="ml-4 text-lg font-medium">{link.label}</span>
            )}
          </div>
        </Link>
        ))}
      </nav>
    </div>
  );
};


const Sidebar = React.memo(SidebarComponent);
export default Sidebar;