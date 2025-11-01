import React, { useState } from "react";
import { FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import { toast } from "react-toastify";
import { taskAPI } from "../services/api";

const TaskModal = ({ groupId, group, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("binary");
  const [unit, setUnit] = useState("");
  const [targetValue, setTargetValue] = useState(1);
  const [assigned, setAssigned] = useState([]);
  const [deadline, setDeadline] = useState("");
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
      await taskAPI.createTask(groupId, {
        title,
        description,
        type,
        unit,
        targetValue: parseInt(targetValue),
        assigned,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      });
      toast.success("Task created!");
      onClose();
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
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

          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          />

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
