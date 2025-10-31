import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUserPlus,
  FaTimes,
  FaArrowLeft,
  FaRobot,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { groupAPI, userAPI } from "../services/api";

const CreateGroup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    goal: "",
    privacy: "public",
    invitedMembers: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  const handleTypeSelect = (type) => {
    setFormData({ ...formData, type });
    setStep(2);
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.goal) {
      toast.error("Please fill all required fields");
      return;
    }
    setStep(3);
    fetchRecommendations();
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      toast.warning("Enter at least 2 characters to search");
      return;
    }

    try {
      const response = await userAPI.searchUsers(searchQuery);
      setSearchResults(response.data.users);
      setShowSearchResults(true);
    } catch (error) {
      toast.error("Failed to search users");
    }
  };

  const fetchRecommendations = async () => {
    try {
      const profileResponse = await userAPI.getProfile();
      const user = profileResponse.data.user;

      const response = await userAPI.recommendMembers(
        user.skills || [],
        user.interests || []
      );
      setRecommendations(response.data.recommended);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    }
  };

  const toggleMember = (userId) => {
    setFormData((prev) => ({
      ...prev,
      invitedMembers: prev.invitedMembers.includes(userId)
        ? prev.invitedMembers.filter((id) => id !== userId)
        : [...prev.invitedMembers, userId],
    }));
  };

  const handleCreateGroup = async () => {
    setLoading(true);
    try {
      console.log("Sending group data:", formData);
      const response = await groupAPI.createGroup(formData);
      console.log("Group created:", response.data);
      toast.success("🎉 Group created successfully! Invitations sent.");
      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Group creation error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Failed to create group");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-10">
            <h1 className="text-4xl font-bold text-white mb-2">
              Create New Group
            </h1>
            <p className="text-indigo-100">
              Set up a study group or hackathon team in just a few steps
            </p>
          </div>

          {/* Progress Steps */}
          <div className="px-8 py-8 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/50">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all duration-300 ${
                      step >= s
                        ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg scale-110"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step > s ? <FaCheckCircle /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-16 h-1 mx-4 rounded transition-all duration-300 ${
                        step > s
                          ? "bg-gradient-to-r from-indigo-600 to-cyan-600"
                          : "bg-gray-300"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-6 text-sm font-medium text-gray-700 text-center">
              <span>Choose Type</span>
              <span>Details</span>
              <span>Members</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Step 1: Choose Type */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  What type of group do you want to create?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      type: "study",
                      icon: "📚",
                      title: "Study Group",
                      desc: "Collaborate with peers on coursework and exam prep",
                    },
                    {
                      type: "hackathon",
                      icon: "💻",
                      title: "Hackathon Team",
                      desc: "Form a team for competitions and projects",
                    },
                  ].map(({ type, icon, title, desc }) => (
                    <button
                      key={type}
                      onClick={() => handleTypeSelect(type)}
                      className="group p-8 border-2 border-gray-300 rounded-xl hover:border-indigo-600 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-cyan-50 transition-all duration-300 text-center transform hover:scale-105 hover:shadow-lg"
                    >
                      <div className="text-6xl mb-4">{icon}</div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Group Details */}
            {step === 2 && (
              <form onSubmit={handleDetailsSubmit}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Group Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="e.g., CS101 Study Group"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Goal *
                    </label>
                    <textarea
                      value={formData.goal}
                      onChange={(e) =>
                        setFormData({ ...formData, goal: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                      rows="4"
                      placeholder="What's the main goal of this group?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Privacy
                    </label>
                    <select
                      value={formData.privacy}
                      onChange={(e) =>
                        setFormData({ ...formData, privacy: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    >
                      <option value="public">Public - Anyone can join</option>
                      <option value="private">Private - Invite only</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    <FaArrowLeft className="mr-2" />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Add Members */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Invite Members
                </h2>

                {/* Search Section */}
                <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg border border-indigo-200/50">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Search Users
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="Search by name or email..."
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2"
                    >
                      <FaSearch /> Search
                    </button>
                  </div>

                  {/* Search Results */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="mt-4 max-h-80 overflow-y-auto">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Search Results ({searchResults.length})
                      </h3>
                      <div className="space-y-2">
                        {searchResults.map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full border border-gray-300"
                              />
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleMember(user._id)}
                              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                formData.invitedMembers.includes(user._id)
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {formData.invitedMembers.includes(user._id) ? (
                                <>
                                  <FaTimes className="inline mr-1" /> Remove
                                </>
                              ) : (
                                <>
                                  <FaUserPlus className="inline mr-1" /> Add
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Recommendations */}
                {recommendations.length > 0 && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200/50">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                      <FaRobot className="mr-2 text-purple-600" /> AI
                      Recommended Members
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Based on matching skills and interests
                    </p>
                    <div className="space-y-3">
                      {recommendations.slice(0, 5).map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full border border-gray-300"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 flex gap-2 flex-wrap">
                                {user.matchingSkills > 0 && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                    ✓ {user.matchingSkills} skills
                                  </span>
                                )}
                                {user.matchingInterests > 0 && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                    ✓ {user.matchingInterests} interests
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleMember(user._id)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                              formData.invitedMembers.includes(user._id)
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {formData.invitedMembers.includes(user._id) ? (
                              <>
                                <FaTimes className="inline mr-1" /> Remove
                              </>
                            ) : (
                              <>
                                <FaUserPlus className="inline mr-1" /> Add
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Members Count */}
                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-indigo-900 font-semibold">
                    ✓ Selected {formData.invitedMembers.length}{" "}
                    {formData.invitedMembers.length === 1
                      ? "member"
                      : "members"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    <FaArrowLeft className="mr-2" />
                    Back
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Group"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
