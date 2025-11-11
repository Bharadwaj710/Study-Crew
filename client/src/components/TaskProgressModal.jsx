import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { taskAPI } from "../services/api";

const TaskProgressModal = ({ task, groupId, onClose, onProgressUpdated }) => {
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
  // Find assigned entry for current user (support populated user object or raw id)
  const currentUserProgress = (task.assigned || []).find((a) => {
    const uid = a?.user?._id || a?.user;
    return uid && uid.toString() === currentUserId;
  });

  // Initialize with actual progress values from the task
  const [progressValue, setProgressValue] = useState(
    currentUserProgress ? currentUserProgress.progressValue || 0 : 0
  );
  const [completed, setCompleted] = useState(
    currentUserProgress ? currentUserProgress.completed || false : false
  );
  const [saving, setSaving] = useState(false);

  // Keep local state in sync when task prop changes (e.g., freshly fetched)
  useEffect(() => {
    const cur = (task.assigned || []).find((a) => {
      const uid = a?.user?._id || a?.user;
      return uid && uid.toString() === currentUserId;
    });

    setProgressValue(cur ? cur.progressValue || 0 : 0);
    setCompleted(cur ? !!cur.completed : false);
  }, [task, currentUserId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let value = task.type === "binary" ? (completed ? 1 : 0) : progressValue;
      const res = await taskAPI.updateProgress(groupId, task._id, {
        value,
        completed: task.type === "binary" ? completed : undefined,
      });

      toast.success("Progress updated successfully");
      if (onProgressUpdated) onProgressUpdated(res.data.task);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update progress");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-xl p-6 z-10 w-full max-w-md shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Update Progress</h3>
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Progress
            </label>
            {task.type === "binary" ? (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span>Mark as completed</span>
              </label>
            ) : (
              <div className="space-y-2">
                <input
                  type="number"
                  min="0"
                  max={task.targetValue}
                  value={progressValue}
                  onChange={(e) =>
                    setProgressValue(
                      Math.max(
                        0,
                        Math.min(
                          task.targetValue,
                          parseInt(e.target.value) || 0
                        )
                      )
                    )
                  }
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                  placeholder={`Enter value (0-${task.targetValue}${
                    task.unit ? ` ${task.unit}` : ""
                  })`}
                />
                <div className="text-sm text-gray-600">
                  Target: {task.targetValue} {task.unit}
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (progressValue / task.targetValue) * 100
                      )}%`,
                      background: task.color || "#3B82F6",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end mt-6 gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:opacity-95"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskProgressModal;
