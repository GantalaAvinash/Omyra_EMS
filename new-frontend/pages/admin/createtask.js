"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "@/components/Layout";
import API from "@/lib/api"; // Ensure the API wrapper is production-ready
import { useRouter } from "next/router";

const CreateTask = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    designation: "",
    date: "",
    title: "",
    description: "",
    internId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [filter, setFilter] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingInterns, setLoadingInterns] = useState(false);
  const [interns, setInterns] = useState([]);


  const designations = [
    "Frontend",
    "Backend",
    "MERN",
    "MEAN",
    "Salesforce",
    "Cloud",
    "Design",
    "Sale",
    "Marketing",
  ];

  const fetchTasks = useCallback(async () => {
    if (!taskName) return;
    setLoadingTasks(true);

    try {
      const response = await API.get(`/admin/tasks/designation/${taskName}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks. Please try again.");
    } finally {
      setLoadingTasks(false);
    }
  }, [taskName]);

  useEffect(() => {
    fetchTasks();
  }, [taskName, fetchTasks]);

  const handleChange = (e) => {
    console.log(e.target);
    const { name, value } = e.target;
    console.log({name, value});
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { designation, internId, date, title, description } = formData;
    if (!date || !title || !description ) {
      toast.error("All fields are required!");
      return false;
    }
    return true;
  };

    // Fetch interns for the dropdown
    useEffect(() => {
      const fetchInterns = async () => {
        setLoadingInterns(true);
        try {
          const response = await API.get("/admin/interns");
          setInterns(response.data);
        } catch (error) {
          console.error("Error fetching interns:", error);
          toast.error("Failed to fetch interns.");
        } finally {
          setLoadingInterns(false);
        }
      };
      fetchInterns();
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await API.put(`/admin/tasks/${editTaskId}`, formData);
        toast.success("Task updated successfully!");
      } else {
        await API.post("/admin/tasks", formData);
        toast.success("Task created successfully!");
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error(error.response?.data?.message || "Failed to create/update task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ designation: "", internId: "", date: "", title: "", description: "" });
    setIsEditing(false);
    setEditTaskId(null);
  };

  const handleEdit = (task) => {
    setFormData({
      designation: task.designation,
      date: task.date.split("T")[0], // Format date for input
      title: task.title,
      description: task.description,
      internId: task.internId,
    });
    setIsEditing(true);
    setEditTaskId(task._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await API.delete(`/admin/tasks/${id}`);
      toast.success("Task deleted successfully!");
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(filter.toLowerCase()) ||
    task.date.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row">
        {/* Task Form */}
        <div className="w-full md:w-1/2 p-4 mb-4 md:mb-0">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-l font-bold mb-4">
              {isEditing ? "Edit Task" : "Create Daily Task"}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <InternSelect
                  value={formData.internId}
                  onChange={handleChange}
                  interns={interns}
                />
                <DesignationSelect
                  value={formData.designation}
                  onChange={handleChange}
                  options={designations}
                />
              </div>
              <InputField
                label="Date"
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <InputField
                label="Task Title"
                type="text"
                id="title"
                name="title"
                value={formData.title}
                placeholder="Enter task title..."
                onChange={handleChange}
                required
              />
              <TextAreaField
                label="Task Description"
                id="description"
                name="description"
                value={formData.description}
                placeholder="Enter task details..."
                onChange={handleChange}
                rows="4"
                required
              />
              <button
                type="submit"
                className={`w-full py-2 rounded text-white ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#E82121] hover:bg-[#EE161F] transition duration-300"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : isEditing ? "Update Task" : "Create Task"}
              </button>
            </form>
          </div>
        </div>

        {/* Tasks List */}
        <div className="w-full md:w-1/2 p-4">
          <div className="bg-white p-6 rounded-lg shadow-md md:h-[570px] h-auto overflow-y-auto">
        <h1 className="text-l font-bold mb-4">Tasks List</h1>
            <div className="mb-4">
              <DesignationSelect
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                options={designations}
                className="w-full"
              />
              <InputField
                type="text"
                placeholder="Search tasks..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            {loadingTasks ? (
              <p className="text-center">Loading tasks...</p>
            ) : (
              <TaskTable
                tasks={filteredTasks}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Reusable Components
const DesignationSelect = ({ value, onChange, options }) => (
  <div className="w-full">
    <label htmlFor="designation" className="block text-gray-600 font-medium mb-2">
      Designation
    </label>
    <select
      id="designation"
      name="designation"
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
    >
      <option value="" disabled>
        Select designation
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const InternSelect = ({ value, onChange, interns }) => (
  <div className="w-full">
    <label htmlFor="internId" className="block text-gray-600 font-medium mb-2">
      Intern
    </label>
    <select
      id="internId"
      name="internId"
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 text-black bg-white"
    >
      <option value="" className="text-black bg-white">Select Intern (Optional)</option>
      {interns.map((intern) => (
        <option key={intern._id} value={intern._id} className="text-black bg-white">
          {intern.firstName} {intern.lastName}
        </option>
      ))}
    </select>
  </div>
);


const InputField = ({ label, ...props }) => (
  <div>
    <label htmlFor={props.id} className="block text-gray-700 font-medium mb-2">
      {label}
    </label>
    <input
      {...props}
      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
    />
  </div>
);

const TextAreaField = ({ label, ...props }) => (
  <div>
    <label htmlFor={props.id} className="block text-gray-700 font-medium mb-2">
      {label}
    </label>
    <textarea
      {...props}
      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
    ></textarea>
  </div>
);

const TaskTable = ({ tasks, onEdit, onDelete }) => (
  <table className="min-w-full bg-white">
    <thead>
      <tr>
        <th className="border-b border-[#F1F2F4] py-2">Date</th>
        <th className="border-b border-[#F1F2F4] py-2">Task</th>
        <th className="border-b border-[#F1F2F4] py-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {tasks.length === 0 ? (
        <tr>
          <td colSpan="3" className="text-center py-4">
            No tasks found.
          </td>
        </tr>
      ) : (
        tasks.map((task) => (
          <tr key={task._id}>
            <td className="border-b border-[#F1F2F4] px-4 py-2">{new Date(task.date).toLocaleDateString()}</td>
            <td className="border-b border-[#F1F2F4] px-4 py-2">{task.title}</td>
            <td className="border-b border-[#F1F2F4] px-4 py-2">
              <button
                onClick={() => onEdit(task)}
                className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

export default CreateTask;
