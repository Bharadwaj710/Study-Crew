import React, { useState } from "react";
import { taskAPI } from "../services/api";
import { toast } from "react-toastify";

const TaskProgressEditor = ({ task, assign, groupId }) => {
  const [loading, setLoading] = useState(false);

  const handleProgressUpdate = async (value) => {
    setLoading(true);
    try {
      if (task.type === "binary") {
        await taskAPI.updateProgress(groupId, task._id, { completed: value });
      } else {
        await taskAPI.updateProgress(groupId, task._id, {
          progressValue: value,
        });
      }
    } catch (error) {
      toast.error("Failed to update progress");
    } finally {
      setLoading(false);
    }
  };

  if (task.type === "binary") {
    return (
      <button
        onClick={() => handleProgressUpdate(!assign.completed)}
        disabled={loading}
        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
          assign.completed
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {assign.completed ? "✓ Done" : "Not done"}
      </button>
    );
  }

  return (
    <input
      type="number"
      value={assign.progressValue}
      onChange={(e) => handleProgressUpdate(parseInt(e.target.value))}
      max={task.targetValue}
      min="0"
      disabled={loading}
      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:border-indigo-500"
    />
  );
};

export default TaskProgressEditor;
