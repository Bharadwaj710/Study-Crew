import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaFilter, FaComments } from "react-icons/fa";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import TaskEditModal from "../components/TaskEditModal";
import TaskProgressModal from "../components/TaskProgressModal";
import GroupInfoDrawer from "../components/GroupInfoDrawer";
import ChatPanel from "../components/ChatPanel";
import { groupAPI, taskAPI } from "../services/api";

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [socket, setSocket] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [progressTask, setProgressTask] = useState(null);
  const getCurrentUserId = () => {
    const id = localStorage.getItem("userId");
    if (id) return id;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?._id || user?.id || null;
    } catch (e) {
      return null;
    }
  };
  const currentUserId = getCurrentUserId();

  // Initialize socket and fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupRes = await groupAPI.getGroupById(id);
        setGroup(groupRes.data.group);

        const tasksRes = await taskAPI.getTasks(id);
        const fetched = tasksRes.data.tasks || [];
        // sort by deadline (nearest first). Tasks without deadline go last.
        const sorted = fetched.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        });
        setTasks(sorted);

        setLoading(false);
      } catch (error) {
        toast.error("Failed to load group");
        navigate("/dashboard");
      }
    };

    fetchData();

    // Initialize socket
    const newSocket = io(
      import.meta.env.VITE_API_URL || "http://localhost:5000",
      {
        auth: { token: localStorage.getItem("token") },
      }
    );

    newSocket.emit("joinGroup", id);

    // Function to sort tasks by deadline
    const sortTasks = (tasks) => {
      return [...tasks].sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    };

    // Listen for real-time updates
    const handleTaskUpdate = (updater) => {
      setTasks((prev) => {
        const updated = updater(prev);
        return sortTasks(updated);
      });
    };

    const eventHandlers = {
      "task:created": (task) => {
        // Only add if it doesn't exist
        handleTaskUpdate((prev) => {
          return prev.some((t) => t._id === task._id) ? prev : [task, ...prev];
        });
      },
      "task:progress": (data) => {
        handleTaskUpdate((prev) =>
          prev.map((t) => (t._id === data.taskId ? data.task : t))
        );
      },
      "task:updated": (task) => {
        handleTaskUpdate((prev) =>
          prev.map((t) => (t._id === task._id ? task : t))
        );
      },
      "task:deleted": ({ taskId }) => {
        handleTaskUpdate((prev) => prev.filter((t) => t._id !== taskId));
      },
      "task:completed": (task) => {
        handleTaskUpdate((prev) =>
          prev.map((t) => (t._id === task._id ? task : t))
        );
      },
    };

    // Register socket event handlers
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      newSocket.on(event, handler);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leaveGroup", id);
      newSocket.disconnect();
    };
  }, [id]);

  // Filter tasks
  const getFilteredTasks = () => {
    switch (filter) {
      case "completed":
        return tasks.filter((t) => t.status === "completed");
      case "myTasks":
        return tasks.filter(
          (t) =>
            t.status !== "completed" &&
            t.assigned.some((a) => a.user._id === currentUserId)
        );
      default:
        return tasks.filter((t) => t.status !== "completed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading group...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      <div
        className={`flex transition-all duration-300 ${
          isChatOpen ? "gap-0" : ""
        }`}
      >
        {/* Main content */}
        <div
          className={`transition-all duration-300 ${
            isChatOpen ? "w-1/2" : "w-full"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <FaArrowLeft className="text-gray-600" />
                </button>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {group?.name}
                </h1>
              </div>
              <button
                onClick={() => setIsGroupInfoOpen(true)}
                className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 font-semibold transition-colors"
              >
                Group Info
              </button>
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-4 mb-8 bg-white rounded-xl p-4 shadow-md">
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
              >
                <FaPlus /> Create Task
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <FaFilter className="text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Tasks</option>
                  <option value="myTasks">My Tasks</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Tasks grid */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">
                  {filter === "all"
                    ? "No tasks yet. Create one to get started!"
                    : "No tasks match your filter."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    groupId={id}
                    socket={socket}
                    onUpdateProgress={async (t) => {
                      try {
                        const res = await taskAPI.getTask(id, t._id);
                        const fresh = res.data.task;
                        setProgressTask(fresh);
                      } catch (err) {
                        console.error(
                          "Failed to fetch task for progress modal",
                          err
                        );
                        setProgressTask(t); // fallback to provided task
                        toast.error("Failed to load latest task data");
                      }
                    }}
                    onEdit={(t) => setEditingTask(t)}
                    onComplete={async (t) => {
                      try {
                        const res = await taskAPI.completeTask(id, t._id);
                        const updated = res.data.task;
                        setTasks((prev) =>
                          prev.map((p) => (p._id === updated._id ? updated : p))
                        );
                        toast.success("Task marked completed");
                      } catch (err) {
                        console.error(err);
                        toast.error("Failed to mark completed");
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat panel */}
        {isChatOpen && (
          <div className="w-1/2 border-l border-gray-200 bg-white shadow-lg">
            <ChatPanel
              groupId={id}
              socket={socket}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Floating chat button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 left-8 w-14 h-14 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:scale-110"
        title="Toggle chat"
      >
        <FaComments className="text-xl" />
      </button>

      {/* Modals */}
      {isTaskModalOpen && (
        <TaskModal
          groupId={id}
          group={group}
          onClose={() => setIsTaskModalOpen(false)}
          socket={socket}
          onTaskCreated={(task) => setTasks((prev) => [task, ...prev])}
        />
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          group={group}
          groupId={id}
          onClose={() => setEditingTask(null)}
          onTaskUpdated={(updated) => {
            setTasks((prev) =>
              prev.map((t) => (t._id === updated._id ? updated : t))
            );
            setEditingTask(null);
          }}
          onTaskDeleted={(taskId) => {
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
            setEditingTask(null);
          }}
        />
      )}

      {isGroupInfoOpen && (
        <GroupInfoDrawer
          group={group}
          onClose={() => setIsGroupInfoOpen(false)}
          onUpdate={(updated) => setGroup(updated)}
          onLeave={() => navigate("/dashboard")}
        />
      )}

      {progressTask && (
        <TaskProgressModal
          task={progressTask}
          groupId={id}
          onClose={() => setProgressTask(null)}
          onProgressUpdated={(updated) => {
            setTasks((prev) =>
              prev.map((t) => (t._id === updated._id ? updated : t))
            );
            setProgressTask(null);
          }}
        />
      )}
    </div>
  );
};

export default GroupDetail;
