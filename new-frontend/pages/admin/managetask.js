import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import API from "@/lib/api";

const ManageTasks = () => {
  const [designations, setDesignations] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [tasks, setTasks] = useState([]);
  const [date, setDate] = useState("");
  const [error, setError] = useState(""); // Error state

  useEffect(() => {
    // Mock fetching unique designations
    setDesignations([
      "Frontend",
      "Backend",
      "MERN",
      "MEAN",
      "Salesforce",
      "Cloud",
      "Design",
      "Sale",
      "Marketing",
    ]);
  }, []);

  const fetchTasks = async () => {
    try {
      setError(""); // Reset error state before API call
      let endpoint = "/admin/tasks";

      if (selectedDesignation && date) {
        endpoint = `/admin/tasks/${selectedDesignation}/${date}`;
      } else if (selectedDesignation) {
        endpoint = `/admin/tasks/${selectedDesignation}`;
      }

      const { data } = await API.get(endpoint);

      // Validate and set tasks
      if (Array.isArray(data)) {
        setTasks(data); // Directly set the array if the response is an array
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError(
        error.response?.data?.message || "An error occurred while fetching tasks."
      );
      setTasks([]); // Clear tasks on error
    }
  };

  // Fetch tasks whenever filters are updated
  useEffect(() => {
    fetchTasks();
  }, [selectedDesignation, date]);

  return (
    <Layout>
      <div className="p-6 bg-[#13192F]">
        <h1 className="text-3xl font-bold mb-6 text-white">View Daily Tasks</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-white">Filter by Designation</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
            >
              <option value="">-- All Designations --</option>
              {designations.map((designation, index) => (
                <option key={index} value={designation}>
                  {designation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white">Filter by Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <button
          className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 mb-4"
          onClick={fetchTasks}
        >
          Apply Filters
        </button>

        <h2 className="text-2xl font-bold mb-4 text-white">Tasks</h2>

        {error ? (
          <div className="text-red-500 bg-red-100 p-4 rounded mb-4">
            {error}
          </div>
        ) : tasks.length > 0 ? (
          <table className="table-auto w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Designation</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Task</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{task.designation}</td>
                  <td className="px-4 py-2">
                    {new Date(task.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{task.task}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-700">No tasks found.</p>
        )}
      </div>
    </Layout>
  );
};

export default ManageTasks;
