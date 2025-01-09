import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { updateAdminPassword, createAdmin, fetchInterns } from "../../lib/api";
import { FaSave, FaUserPlus } from "react-icons/fa";
import { useRouter } from "next/router";

const Settings = () => {
  const router = useRouter();
  // Password Update State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [interns, setInterns] = useState([]);
  const [AdminId, setAdminId] = useState([]);


  useEffect(() => {
    const adminId = JSON.parse(localStorage.getItem('user'))?.admin
    setAdminId(adminId?._id)
  })
  // Create Admin State
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [adminMessage, setAdminMessage] = useState("");

  // Existing Intern for Validation

  useEffect(() => {
    const loadInterns = async () => {
      try {
        const { data } = await fetchInterns();
        setInterns(data);
      } catch (error) {
        console.error("Error loading inters:", error);
      }
    };

    loadInterns();
  }, []);

  // Handle Password Update
  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      await updateAdminPassword({ currentPassword, newPassword, _id:AdminId });
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage("Failed to update password. Please try again.");
    }
  };

  // Handle Create Admin
  const handleCreateAdmin = async () => {
    if (newAdmin.password !== newAdmin.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Check if the email belongs to an existing employee
    const emailExists = interns.some((emp) => emp.email === newAdmin.email);
    if (emailExists) {
      alert("This email already exists as an employee. Cannot create admin.");
      return;
    }

    try {
      await createAdmin(newAdmin);
      setAdminMessage("Admin created successfully!");
      alert(
        `New Admin Created:\nName: ${newAdmin.firstName} ${newAdmin.lastName}\nEmail: ${newAdmin.email}\nPassword: ${newAdmin.password}`
      );
      setNewAdmin({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        designation: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      setAdminMessage("Failed to create admin. Please try again.");
    }
  };

  return (
    <Layout key={router.asPath}>
      <div className="p-6 bg-[#13192F] min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-white">Admin Settings</h1>

        {/* Password Change Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
          <button
            onClick={handlePasswordUpdate}
            className="bg-blue-500 text-white py-2 px-6 rounded mt-4 hover:bg-blue-600 transition"
          >
            Update Password
          </button>
        </div>

        {/* Success/Error Message */}
        {message && (
          <p className="mt-4 text-center text-green-600 font-semibold">{message}</p>
        )}

        {/* Create Admin Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Create New Admin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={newAdmin.firstName}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, firstName: e.target.value })
              }
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newAdmin.lastName}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, lastName: e.target.value })
              }
              className="p-2 border rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newAdmin.email}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, email: e.target.value })
              }
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={newAdmin.phone}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, phone: e.target.value })
              }
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Designation"
              value={newAdmin.designation}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, designation: e.target.value })
              }
              className="p-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newAdmin.password}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, password: e.target.value })
              }
              className="p-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={newAdmin.confirmPassword}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })
              }
              className="p-2 border rounded"
              required
            />
          </div>
          <button
            onClick={handleCreateAdmin}
            className="bg-green-500 text-white py-2 px-6 rounded mt-4 hover:bg-green-600 transition flex items-center"
          >
            <FaUserPlus className="mr-2" /> Create Admin
          </button>
        </div>

        {/* Success/Error Message */}
        {adminMessage && (
          <p className="mt-4 text-center text-green-600 font-semibold">
            {adminMessage}
          </p>
        )}
      </div>
    </Layout>
  );
};

export default Settings;
