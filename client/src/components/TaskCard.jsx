import React from "react";
import { FaCheckCircle, FaClock, FaEdit } from "react-icons/fa";

const hexToRgba = (hex, alpha = 0.08) => {
  if (!hex) return `rgba(59,130,246,${alpha})`;
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const formatDeadline = (d) => {
  if (!d) return "No deadline";
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day} ${month} ${year}, ${time}`;
};

const TaskCard = ({ task, groupId, onComplete, onUpdateProgress, onEdit }) => {
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
  // Robust check for assigned: handle populated user object or raw id
  const isAssigned = (task.assigned || []).some((a) => {
    const uid = a?.user?._id || a?.user;
    return uid && uid.toString() === currentUserId;
  });

  const isOverdue =
    task.deadline &&
    new Date() > new Date(task.deadline) &&
    task.status !== "completed";

  return (
    <div
      className={`rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all flex flex-col justify-between`}
      style={{ backgroundColor: hexToRgba(task?.color || "#3B82F6", 0.06) }}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3
              className={`text-lg font-bold mb-1 ${
                isOverdue ? "text-red-600" : "text-gray-900"
              }`}
            >
              {task.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {task.description}
            </p>
            {task.deadline && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  isOverdue ? "text-red-600" : "text-gray-500"
                }`}
              >
                <FaClock /> {formatDeadline(task.deadline)}{" "}
                {isOverdue && <span className="ml-2">⚠️ Overdue</span>}
              </div>
            )}
          </div>

          {onEdit && (
            <button
              onClick={() => onEdit?.(task)}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
            >
              <FaEdit className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Member progress vertical stack */}
        <div className="space-y-3 overflow-y-auto max-h-48 pr-2">
          {task.assigned.map((a) => (
            <div key={a.user._id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{a.user.name}</div>
                <div className="text-xs text-gray-600">
                  {task.type === "binary"
                    ? a.completed
                      ? "Completed"
                      : "Pending"
                    : `${a.progressValue || 0} / ${task.targetValue} ${
                        task.unit || ""
                      }`}
                </div>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  style={{
                    width: `${
                      a.completed
                        ? 100
                        : Math.round(
                            ((a.progressValue || 0) / (task.targetValue || 1)) *
                              100
                          )
                    }%`,
                    background: task.color || "#3B82F6",
                  }}
                  className="h-2 rounded-full transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed bottom buttons */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        {task.status === "completed" ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Task Completed</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              <FaCheckCircle className="mr-1" /> Completed
            </span>
          </div>
        ) : (
          <>
            <div>
              <button
                onClick={() => onUpdateProgress?.(task)}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Update Progress
              </button>
            </div>

            <div>
              <button
                onClick={() => onComplete?.(task)}
                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                Complete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
