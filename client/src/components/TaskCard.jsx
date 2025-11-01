import React from "react";
import { FaCheckCircle, FaClock } from "react-icons/fa";
import TaskProgressEditor from "./TaskProgressEditor";

const hexToRgba = (hex, alpha = 0.08) => {
  if (!hex) return `rgba(59,130,246,${alpha})`;
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const TaskCard = ({ task, groupId, socket }) => {
  const getOverallProgress = () => {
    if (task.type === "binary") {
      const completed = task.assigned.filter((a) => a.completed).length;
      return Math.round((completed / task.assigned.length) * 100);
    } else {
      const total = task.assigned.reduce((sum, a) => sum + a.progressValue, 0);
      return Math.round(
        (total / (task.assigned.length * task.targetValue)) * 100
      );
    }
  };

  return (
    <div
      className="rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
      style={{ backgroundColor: hexToRgba(task?.color || "#3B82F6", 0.06) }}
    >
      <h3 className="text-lg font-bold text-gray-900 mb-2">{task.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {task.description}
      </p>

      {/* Deadline */}
      {task.deadline && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <FaClock /> {new Date(task.deadline).toLocaleDateString()}
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${getOverallProgress()}%`,
            background: task?.color || "#3B82F6",
          }}
        />
      </div>

      {/* Member progress */}
      <div className="space-y-2 mb-4">
        {task.assigned.map((assign) => (
          <div
            key={assign.user._id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-700 font-medium">
              {assign.user.name}
            </span>
            <TaskProgressEditor
              task={task}
              assign={assign}
              groupId={groupId}
              socket={socket}
            />
          </div>
        ))}
      </div>

      {/* Status badge */}
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          task.status === "completed"
            ? "bg-green-100 text-green-700"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        {task.status === "completed" ? "✓ Completed" : "Open"}
      </span>
    </div>
  );
};

export default TaskCard;
