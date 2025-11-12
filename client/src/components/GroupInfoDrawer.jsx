import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaUserMinus,
  FaSearch,
  FaArrowLeft,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { groupAPI, userAPI } from "../services/api";
import { openProfilePopup } from "../hooks/useProfilePopup";

const GroupInfoDrawer = ({ group, onClose, onUpdate, onLeave }) => {
const groupId = group?._id;

 const [members, setMembers] = useState(group?.members || []);
const [leaving, setLeaving] = useState(false);
const navigate = useNavigate();
useEffect(() => {
  if (group) setMembers(group.members || []);
}, [group]);

  // Retrieve and memoize current userId once
  const getCurrentUserId = () => {
    const id = localStorage.getItem("userId");
    if (id) return id;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?._id || user?.id || null;
    } catch {
      return null;
    }
  };
  const currentUserId = getCurrentUserId();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const isAdmin = group?.creator?._id === currentUserId;

  // Fetch join requests only if current user is admin (creator)
  useEffect(() => {
    if (isAdmin) {
      setLoadingRequests(true);
      groupAPI
        .getJoinRequests(group._id)
        .then((res) => setJoinRequests(res.data.joinRequests))
        .catch(() => toast.error("Failed to load join requests"))
        .finally(() => setLoadingRequests(false));
    } else {
      setJoinRequests([]);
    }
  }, [group._id, isAdmin]);

const handleRequest = async (userId, action) => {
  try {
    const res = await groupAPI.handleJoinRequest(group._id, userId, action);
    const updatedGroup = res.data.group;
    setJoinRequests(updatedGroup.joinRequests.filter((j) => j.status === "pending"));
    setMembers(updatedGroup.members);
    toast.success(`Request ${action}ed successfully`);
  } catch (error) {
    toast.error(`Failed to ${action} request`);
  }
};

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);


  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    try {
      const res = await userAPI.searchUsers(searchQuery);
      setSearchResults(res.data.users);
    } catch {
      toast.error("Search failed");
    }
  };

const handleRemoveMember = async (userId) => {
  if (userId === group.creator._id) {
    toast.error("Creator cannot remove themselves");
    return;
  }
  if (!window.confirm("Remove this member from the group?")) return;
  try {
    const res = await groupAPI.removeMember(group._id, userId);
    setMembers(res.data.group.members);
    toast.success("Member removed successfully");
  } catch (error) {
    toast.error("Failed to remove member");
    console.error(error);
  }
};


const handleLeaveGroup = async () => {
    setLeaving(true);
    try {
      const res = await groupAPI.leaveGroup(group._id);
      if (res.status === 200) {
        toast.success("You left the group successfully!");
        navigate("/dashboard");
        return;
      }
      toast.info("Leaving group... Please wait.");
    } catch (error) {
      if (error.response?.status === 403) {
        toast.success("You left the group successfully!");
        navigate("/explore");
      } else {
        toast.error(error.response?.data?.message || "Failed to leave group");
      }
    } finally {
      setLeaving(false);
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
          <h3 className="text-lg font-bold text-gray-900 mb-2">{group?.name}</h3>
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
          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Created by</p>
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
            Members ({group?.members.length || 0})
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
                    title="Remove member"
                  >
                    <FaUserMinus />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Join Requests */}
        {isAdmin && (
          <div className="border-t pt-4">
            <h4 className="font-bold mt-5 mb-2">Join Requests</h4>
            {loadingRequests ? (
              <p className="text-gray-500">Loading join requests...</p>
            ) : (
              <>
                {joinRequests.length === 0 ? (
                  <p className="text-gray-500">No pending requests</p>
                ) : (
                  joinRequests.map((req) => (
                    <div key={req.user._id} className="flex items-center gap-3 mb-2">
                      <img
                        src={req.user.avatar}
                        alt={req.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{req.user.name}</span>
                      <button
                        onClick={() => handleRequest(req.user._id, "accept")}
                        className="ml-auto bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequest(req.user._id, "decline")}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Decline
                      </button>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        )}

        {/* Leave group */}
      <button
  onClick={handleLeaveGroup}
  disabled={leaving}
  className="w-full px-4 py-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 disabled:opacity-50"
>
  {leaving ? "Leaving..." : "Leave Group"}
</button>
      </div>
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setShowConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-50 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Confirm deletion
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this group? This will permanently
              remove the group and all related tasks and invitations.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleting) return;
                  setDeleting(true);
                  try {
                    await groupAPI.deleteGroup(group._id);
                    toast.success("Group deleted successfully");
                    setShowConfirm(false);
                    onClose && onClose();
                    // navigate to dashboard
                    navigate("/dashboard");
                  } catch (err) {
                    console.error(err);
                    const msg =
                      err?.response?.data?.message || "Failed to delete group";
                    toast.error(msg);
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInfoDrawer;
