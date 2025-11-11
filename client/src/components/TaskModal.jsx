import React, { useState } from "react";
import { FaTimes, FaPlus, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import { taskAPI } from "../services/api";

const COLORS = [
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#06B6D4", // cyan/teal
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#D946EF", // magenta
  "#6B7280", // gray
  "#111827", // black
];

const TaskModal = ({ groupId, group, onClose, onTaskCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("binary");
  const [unit, setUnit] = useState("");
  const [targetValue, setTargetValue] = useState(1);
  const [assigned, setAssigned] = useState([]);
  const [deadline, setDeadline] = useState("");
  const [tempDeadline, setTempDeadline] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[5]); // default blue
  const [loading, setLoading] = useState(false);

  const handleToggleMember = (memberId) => {
    setAssigned((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || assigned.length === 0) {
      toast.warning("Title and assigned members required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        type,
        unit,
        targetValue: parseInt(targetValue),
        assigned,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        color: selectedColor,
      };

      const res = await taskAPI.createTask(groupId, payload);
      const newTask = res?.data?.task;
      if (res?.data?.success && newTask) {
        toast.success("Task created successfully");
        // Immediately update local UI if callback provided
        if (onTaskCreated) onTaskCreated(newTask);
        onClose();
      } else {
        throw new Error(res?.data?.message || "Failed to create task");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create task"
      );
    } finally {
      setLoading(false);
    }
  };

  const applyTempDeadline = () => {
    setDeadline(tempDeadline);
    setTempDeadline("");
  };

  const cancelTempDeadline = () => {
    setTempDeadline("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-cyan-50 p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            required
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 resize-none"
            rows="3"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="binary">Binary (Yes/No)</option>
            <option value="measurable">Measurable (Number)</option>
          </select>

          {type === "measurable" && (
            <>
              <input
                type="text"
                placeholder="Unit (e.g., pages, hours)"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <input
                type="number"
                placeholder="Target value"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Deadline
            </label>
            <input
              type="datetime-local"
              value={tempDeadline}
              onChange={(e) => setTempDeadline(e.target.value)}
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            {tempDeadline && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={applyTempDeadline}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={cancelTempDeadline}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
            {deadline && (
              <p className="text-gray-600 text-sm mt-2">
                Deadline: {new Date(deadline).toLocaleString()}
              </p>
            )}
          </div>

          {/* Task Color Picker */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Task Color
            </p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    selectedColor === col
                      ? "ring-2 ring-offset-1 ring-indigo-400"
                      : ""
                  }`}
                  style={{ backgroundColor: col }}
                  title={col}
                >
                  {selectedColor === col && (
                    <FaCheck className="text-white text-xs" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected color preview:
            </p>
            <div
              className="w-12 h-6 rounded mt-1"
              style={{ backgroundColor: selectedColor }}
            />
          </div>

          {/* Members */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Assign members
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {group?.members.map((member) => (
                <label
                  key={member._id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={assigned.includes(member._id)}
                    onChange={() => handleToggleMember(member._id)}
                    className="w-4 h-4"
                  />
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-gray-700">{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-cyan-700 transition-all disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
