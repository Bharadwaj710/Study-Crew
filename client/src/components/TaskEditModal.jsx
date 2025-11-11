import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { taskAPI } from "../services/api";

const COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#D946EF",
  "#6B7280",
  "#111827",
];

const TaskEditModal = ({
  task,
  group,
  groupId,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[5]);
  const [assignedIds, setAssignedIds] = useState([]);
  const [saving, setSaving] = useState(false);
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
  const isCreator = task.creator && task.creator._id === currentUserId;
  const originalDeadlineRef = useRef(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setSelectedColor(task.color || COLORS[5]);

      // Format deadline in local time for the input and remember original ISO
      if (task.deadline) {
        originalDeadlineRef.current = task.deadline;
        const date = new Date(task.deadline);
        const pad = (n) => String(n).padStart(2, "0");
        const localInput = `${date.getFullYear()}-${pad(
          date.getMonth() + 1
        )}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
          date.getMinutes()
        )}`;
        setDeadline(localInput);
      } else {
        originalDeadlineRef.current = null;
        setDeadline("");
      }

      setAssignedIds(task.assigned ? task.assigned.map((a) => a.user._id) : []);
    }
  }, [task]);

  const toggleAssign = (userId) => {
    setAssignedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only allow creator to change core fields
      // Keep deadline in UTC format for API
      let deadlineUTC = null;
      if (deadline) {
        // Build local input representation of original deadline to detect unchanged state
        const pad = (n) => String(n).padStart(2, "0");
        const originalLocal = originalDeadlineRef.current
          ? (() => {
              const od = new Date(originalDeadlineRef.current);
              return `${od.getFullYear()}-${pad(od.getMonth() + 1)}-${pad(
                od.getDate()
              )}T${pad(od.getHours())}:${pad(od.getMinutes())}`;
            })()
          : null;

        if (originalDeadlineRef.current && deadline === originalLocal) {
          // Unchanged — reuse original ISO string exactly to avoid drift
          deadlineUTC = originalDeadlineRef.current;
        } else {
          // User changed (or original missing) — convert local datetime to UTC ISO
          // new Date(deadline) creates a Date in local timezone; toISOString() yields UTC
          deadlineUTC = new Date(deadline).toISOString();
        }
      }

      const payload = {
        title,
        description,
        deadline: deadlineUTC,
        assigned: assignedIds,
        color: selectedColor,
      };

      const res = await taskAPI.updateTask(groupId, task._id, payload);
      const updated = res.data.task;

      toast.success("Task updated");
      if (onTaskUpdated) onTaskUpdated(updated);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?\nThis action cannot be undone."
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      await taskAPI.deleteTask(groupId, task._id);
      toast.success("✅ Task deleted successfully");
      if (onTaskDeleted) onTaskDeleted(task._id);
      onClose();
    } catch (error) {
      console.error("Delete task error:", error);
      toast.error(error.response?.data?.message || "❌ Failed to delete task");
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
      <div className="bg-white rounded-xl p-6 z-10 w-full max-w-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Edit Task</h3>
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deadline
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Members
            </label>
            <div className="flex gap-3 overflow-x-auto py-2">
              {group?.members?.map((m) => (
                <label
                  key={m._id}
                  className={`flex items-center gap-2 px-3 py-1 border rounded-lg cursor-pointer ${
                    assignedIds.includes(m._id)
                      ? "bg-indigo-50 border-indigo-200"
                      : "bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={assignedIds.includes(m._id)}
                    onChange={() => toggleAssign(m._id)}
                  />
                  <span className="text-sm">{m.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === c
                      ? "ring-2 ring-offset-1 ring-indigo-400"
                      : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Member Progress section removed - handled by TaskProgressModal */}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              title={
                isCreator
                  ? "Delete task"
                  : "Delete task (only creator can perform deletion)"
              }
            >
              🗑️ Delete Task
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Processing..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;
