import React, { useState } from "react";
import { FaTimes, FaUserMinus, FaSearch, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import { groupAPI, userAPI } from "../services/api";
import { openProfilePopup } from "../hooks/useProfilePopup";

const GroupInfoDrawer = ({ group, onClose, onUpdate, onLeave }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
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
  const isAdmin = group?.creator._id === getCurrentUserId();

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    try {
      const res = await userAPI.searchUsers(searchQuery);
      setSearchResults(res.data.users);
    } catch (error) {
      toast.error("Search failed");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      // Call backend to remove member
      toast.success("Member removed");
      // Refresh group data
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-cyan-50 p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Group Info</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg">
          <FaTimes />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Group details */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {group?.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3">{group?.goal}</p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
              {group?.type === "study" ? "📚 Study" : "💻 Hackathon"}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold capitalize">
              {group?.privacy}
            </span>
          </div>
        </div>

        {/* Creator info */}
        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
            Created by
          </p>
          <div className="flex items-center gap-3">
            <img
              src={group?.creator.avatar}
              alt={group?.creator.name}
              className="w-10 h-10 rounded-full"
            />
            <button
              onClick={(e) =>
                openProfilePopup(group?.creator._id, e.currentTarget, {
                  context: "group",
                })
              }
              className="text-gray-900 font-medium transition-all duration-200 hover:text-indigo-600 hover:drop-shadow-sm cursor-pointer"
            >
              {group?.creator.name}
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Members ({group?.members.length})
          </p>
          <div className="space-y-2">
            {group?.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <button
                    onClick={(e) =>
                      openProfilePopup(member._id, e.currentTarget, {
                        context: "group",
                      })
                    }
                    className="text-gray-900 font-medium transition-all duration-200 hover:text-indigo-600 hover:drop-shadow-sm cursor-pointer"
                  >
                    {member.name}
                  </button>
                </div>
                {isAdmin && member._id !== group.creator._id && (
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaUserMinus />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leave group */}
        <button
          onClick={onLeave}
          className="w-full px-4 py-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-all"
        >
          Leave Group
        </button>
      </div>
    </div>
  );
};

export default GroupInfoDrawer;
