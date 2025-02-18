import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import API from "@/lib/api";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import "chart.js/auto";

const Roadmap = () => {
  const [tasks, setTasks] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchTasksAndStatuses = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const internId = user?.intern?._id;
        const designation = user?.intern?.designation;

        const [tasksResponse, statusesResponse] = await Promise.all([
          API.get(`/admin/tasks/intern/${internId}`),
          API.get(`/admin/intern/task-status/${internId}`),
        ]);

        setTasks(tasksResponse.data);
        setTaskStatuses(statusesResponse.data);
        updateGraphData(tasksResponse.data, statusesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchTasksAndStatuses();
  }, []);

  const updateGraphData = (tasks, statuses) => {
    const completedTasks = tasks.filter(task => statuses.some(status => status.taskId === task._id && status.status === "completed"));
    const progressCounts = {
      completed: completedTasks.length,
      pending: tasks.length - completedTasks.length,
    };
    
    setProgressData({
      labels: ["Completed", "Pending"],
      datasets: [
        {
          label: "Task Progress",
          data: [progressCounts.completed, progressCounts.pending],
          borderColor: "#2563eb",
          backgroundColor: ["rgba(37, 99, 235, 0.2)", "rgba(235, 99, 37, 0.2)"],
        },
      ],
    });
  };

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Timeline */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Project Timeline</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200"></div>

                  <div className="space-y-8">
                    {tasks.map((task, index) => {
                      const taskStatus = taskStatuses.find(status => status.taskId === task._id)?.status || "Upcoming";

                      // Determine status styles
                      let statusColor = "bg-gray-300";
                      let textColor = "text-gray-400";
                      let fontWeight = "";

                      if (taskStatus === "completed") {
                        statusColor = "bg-green-500";
                        textColor = "text-gray-500";
                      } else if (taskStatus === "in progress") {
                        statusColor = "bg-red-500";
                        textColor = "text-red-500";
                        fontWeight = "font-bold";
                      }

                      return (
                        <div key={index} className="flex items-center">
                          {/* Left Side (Task Name & Status) */}
                          <div className={`flex-1 text-right pr-6 ${textColor} ${fontWeight}`}>
                            <h3 className="font-semibold">{task.title}</h3>
                            <p className="text-sm">
                              {taskStatus.charAt(0).toUpperCase() + taskStatus.slice(1)}
                            </p>
                          </div>

                          {/* Status Dot */}
                          <div
                            className={`w-4 h-4 rounded-full ${statusColor} border-4 border-white shadow`}
                          ></div>

                          {/* Right Side (Date) */}
                          <div className="flex-1 pl-6 text-gray-500">
                            <p className="text-sm">{new Date(task.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-bold mb-4">Progress Overview</h2>
              <Line data={progressData} />
            </CardContent>
          </Card>
        </div>
        {/* Current Tasks */}
        <div className="mt-6">
          <Card>
            <CardContent>
              <h2 className="text-xl font-bold mb-4">Current Tasks</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-4 bg-white shadow rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-bold">{task.title}</h3>
                        <p className="text-gray-500">{task.description}</p>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${
                            task.status === "completed"
                              ? "bg-green-200 text-green-800"
                              : "bg-yellow-200 text-yellow-800"
                          }`}
                        >
                          {task.status === "completed" ? "Completed" : "In Progress"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Roadmap;
