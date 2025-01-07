import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import API from "@/lib/api";
import Layout from "@/components/Layout";
import { toast } from "react-toastify";

const Roadmap = () => {
  const [tasks, setTasks] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);

  // Get today's date
  const today = new Date().toDateString();

  // Fetch tasks and task statuses from API
  useEffect(() => {
    const fetchTasksAndStatuses = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const internId = user?.intern?._id;
      const designation = user?.intern?.designation;

      try {
        const [tasksResponse, statusesResponse] = await Promise.all([
          API.get(`/admin/tasks/designation/${designation}`),
          API.get(`/admin/intern/task-status/${internId}`)
        ]);

        const sortedTasks = tasksResponse.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setTasks(sortedTasks);
        setTaskStatuses(statusesResponse.data);
      } catch (error) {
        console.error("Error fetching tasks or statuses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksAndStatuses();
  }, []);

  // Draw lines between dots
  useEffect(() => {
    const drawLines = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas dimensions
      const container = canvas.parentElement;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw lines between dots
      ctx.strokeStyle = "#00FF00"; // Line color
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]); // Dashed line

      for (let i = 0; i < dotsRef.current.length - 1; i++) {
        const dot1 = dotsRef.current[i];
        const dot2 = dotsRef.current[i + 1];

        if (dot1 && dot2) {
          const rect1 = dot1.getBoundingClientRect();
          const rect2 = dot2.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          const x1 = rect1.left + rect1.width / 2 - containerRect.left;
          const y1 = rect1.top + rect1.height / 2 - containerRect.top;
          const x2 = rect2.left + rect2.width / 2 - containerRect.left;
          const y2 = rect2.top + rect2.height / 2 - containerRect.top;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    };

    drawLines();

    // Redraw lines on resize
    const handleResize = () => drawLines();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [tasks]);

  const handleMarkAsComplete = async (taskId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const internId = user?.intern?._id;

    try {
      const response = await API.post('/admin/intern/task-status', {
        internId,
        taskId,
        status: 'completed',
        date: new Date().toISOString()
      });

      setTaskStatuses((prevStatuses) => [...prevStatuses, response.data.taskStatus]);
      toast.success("Task marked as complete!");
    } catch (error) {
      toast.error('Error marking task as complete');
    }
  };

  const getTaskStatus = (taskId) => {
    const status = taskStatuses.find(status => status.taskId === taskId);
    return status ? status.status : 'pending';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-200 py-10">
        <div className="container mx-auto px-20 relative">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-blue-400"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Roadmap
          </motion.h1>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <motion.div
                className="w-12 h-12 border-4 border-t-transparent border-blue-400 rounded-full animate-spin"
                aria-label="Loading"
              ></motion.div>
            </div>
          ) : (
            <div className="relative mx-16">
              {/* Canvas for connecting lines */}
              <canvas
                ref={canvasRef}
                className="absolute top-[-55px] sm:top-[0px] md:top-[-45px] left-0 w-full h-full z-0"
                />


              {/* Roadmap Content */}
              <motion.div
                className="relative flex flex-col items-center z-10"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.3 },
                  },
                }}
              >
                {tasks.map((task, index) => {
                    const isToday = new Date(task.date).toDateString() === today;
                   return (
                  <motion.div
                    key={task._id}
                    className={`roadmap-item flex flex-col ${
                      index % 2 === 0 ? "items-start self-start" : "items-end self-end"
                    } w-full md:w-2/3`}
                    variants={{
                      hidden: { opacity: 0, y: 50 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    }}
                  >
                    <div
                        ref={(el) => (dotsRef.current[index] = el)}
                        className={`roadmap-dot w-6 h-6 rounded-full ${
                          isToday ? "bg-yellow-500" : "bg-green-500"
                        } shadow-lg ${index % 2 === 0 ? "ml-0" : "ml-auto"}`}
                      ></div>
                      <div
                        className={`roadmap-content rounded-lg shadow-md p-6 ml-4 max-w-md ${
                          isToday ? "bg-red-500" : "bg-gray-800"
                        }`}
                      >
                      <h3 className={`text-lg font-bold ${isToday ? "text-white" : "text-blue-400"}`}>{task.title}</h3>
                      <h3 className={`text-sm font-bold ${isToday ? "text-white" : "text-slate-400"}`}>{task.description}</h3>
                      <span className={`text-sm ${isToday ? "text-grey-300" : "text-gray-500"}`}>Date:</span>
                      <p className={` ${isToday ? "text-grey-200" : "text-gray-400"}`}>{new Date(task.date).toLocaleDateString()}</p>
                      
                      {/* If show the status of a task and display either "Completed" or a "Mark as Complete" button based on the task's status, */}
                      {getTaskStatus(task._id) === 'completed' ? (
                        <p className="text-green-500">Completed</p>
                      ) : (
                        <button
                          onClick={() => handleMarkAsComplete(task._id)}
                          className="bg-green-500 text-[10px] text-white py-1 px-3 rounded hover:bg-green-600 transition"
                        >
                          Mark as Complete
                        </button>
                      )}
                    </div>
                  </motion.div>
                )})}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Roadmap;
