import React, { useState, useEffect } from "react";
import { groupAPI } from "../services/api";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const ExploreGroups = () => {
  const [groups, setGroups] = useState([]);
  const [sending, setSending] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch groups optionally filtered by search term
  const fetchGroups = async (search = "") => {
    setLoading(true);
    try {
      const res = await groupAPI.exploreGroups(search);
      setGroups(res.data.groups || []);
    } catch (err) {
      toast.error("Failed to load groups.");
    }
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    fetchGroups();
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchGroups(searchQuery.trim());
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Send join request
  const requestJoin = async (groupId) => {
    setSending(groupId);
    try {
      await groupAPI.requestJoinGroup(groupId);
      toast.success("Join request sent!");
      setGroups(groups.map((g) => (g._id === groupId ? { ...g, requested: true } : g)));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Request failed.");
    }
    setSending("");
  };

  // Cancel join request
  const cancelJoinRequest = async (groupId) => {
    setSending(groupId);
    try {
      await groupAPI.cancelJoinRequest(groupId);
      toast.info("Join request cancelled");
      setGroups(groups.map((g) => (g._id === groupId ? { ...g, requested: false } : g)));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel join request.");
    }
    setSending("");
  };

  // Fetch full group details and open modal
  const fetchGroupDetails = async (groupId) => {
    setModalLoading(true);
    try {
      const res = await groupAPI.getGroupById(groupId);
      setSelectedGroup(res.data.group);
      setModalOpen(true);
    } catch (err) {
      toast.error("Failed to load group details");
    }
    setModalLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto pt-10 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-6">Explore Groups</h2>

        {/* Search Input */}
        <input
          type="search"
          placeholder="Search groups by name, creator, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-6 w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {loading ? (
          <div className="text-center text-gray-500">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="text-lg text-gray-600">No groups to explore.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <div
                key={group._id}
                className="rounded-2xl shadow bg-white p-6 flex flex-col gap-2 border hover:shadow-lg duration-200 cursor-pointer"
                // Open modal on card click; prevent click on button bubbling by stopPropagation below
                onClick={() => fetchGroupDetails(group._id)}
              >
                <div className="flex justify-between">
                  <h3 className="text-xl font-semibold">{group.name}</h3>
                  <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">{group.type}</span>
                </div>
                <div className="text-gray-500 line-clamp-2">{group.goal}</div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <span className="text-gray-600 capitalize">{group.privacy}</span>
                  <span>•</span>
                  <span>
                    Creator: <b>{group.creator?.name}</b>
                  </span>
                </div>
                <button
                  disabled={sending === group._id}
                  onClick={(e) => {
                    // Prevent card click event (modal)
                    e.stopPropagation();
                    if (group.requested) cancelJoinRequest(group._id);
                    else requestJoin(group._id);
                  }}
                  className={`mt-3 px-4 py-2 font-bold rounded-lg shadow duration-150 ${
                    group.requested
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:scale-105"
                  }`}
                >
                  {group.requested ? "Cancel Request" : "Request to Join"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal Popup for group details */}
        {modalOpen && selectedGroup && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative"
              onClick={(e) => e.stopPropagation()} // Prevent modal close on inner click
            >
              {modalLoading ? (
                <div className="text-center text-gray-600">Loading details...</div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4">{selectedGroup.name}</h2>
                  <p className="mb-2 text-gray-700">{selectedGroup.description || selectedGroup.goal}</p>
                  <p className="mb-4 text-sm text-gray-500">
                    Privacy: <span className="capitalize">{selectedGroup.privacy}</span> | Type:{" "}
                    {selectedGroup.type === "study" ? "📚 Study" : "💻 Hackathon"}
                  </p>
                  <h3 className="font-semibold mb-2">Members ({selectedGroup.members?.length || 0})</h3>
                  <ul className="max-h-40 overflow-y-auto mb-4">
                    {selectedGroup.members &&
                      selectedGroup.members.map((member) => (
                        <li key={member._id} className="flex items-center gap-2 mb-2">
                          <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                          <span>{member.name}</span>
                        </li>
                      ))}
                  </ul>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreGroups;
