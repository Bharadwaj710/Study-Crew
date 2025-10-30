import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaUsers,
  FaArrowRight,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { userAPI, groupAPI } from "../services/api";
import { HiOutlineSparkles } from "react-icons/hi2";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserAndGroups();
  }, []);

  const fetchUserAndGroups = async () => {
    try {
      const userResponse = await userAPI.getProfile();
      setUser(userResponse.data.user);

      if (!userResponse.data.isProfileComplete) {
        toast.warning(
          "Complete your profile for personalized recommendations!",
          {
            autoClose: 5000,
          }
        );
      }

      const groupsResponse = await groupAPI.getGroups();
      setGroups(groupsResponse.data.groups);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            <p className="text-gray-600 font-medium">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="relative mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-2xl blur-2xl"></div>
          <div className="relative bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl border border-indigo-200/50 backdrop-blur-sm p-8 md:p-12 shadow-lg">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <HiOutlineSparkles className="text-indigo-600 text-2xl" />
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  Welcome back, {user?.name}! 👋
                </h1>
              </div>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Create a study group or join an existing one to start
                collaborating with your peers and achieve your learning goals
                together.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/create-group")}
                  className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md group"
                >
                  <FaPlus className="mr-2 group-hover:rotate-90 transition-transform" />
                  Create Group
                </button>
                <button
                  onClick={() => navigate("/join-group")}
                  className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md group"
                >
                  <FaSearch className="mr-2 group-hover:scale-110 transition-transform" />
                  Explore Groups
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* My Groups Section */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-2xl blur-2xl"></div>
          <div className="relative bg-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 md:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center text-gray-900">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-600 mr-3">
                  <FaUsers className="text-white text-lg" />
                </div>
                My Groups
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 md:px-8 py-8">
              {groups.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-4">
                    <FaUsers className="text-indigo-600 text-4xl" />
                  </div>
                  <p className="text-gray-900 text-xl font-semibold mb-2">
                    No groups yet
                  </p>
                  <p className="text-gray-600 mb-6">
                    Create or join a group to start your collaborative learning
                    journey!
                  </p>
                  <button
                    onClick={() => navigate("/create-group")}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg"
                  >
                    Create Your First Group
                    <FaArrowRight className="ml-2" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {groups.map((group) => (
                    <div
                      key={group._id}
                      onClick={() => navigate(`/group/${group._id}`)}
                      className="group cursor-pointer p-6 border border-gray-200 rounded-xl hover:border-indigo-300 bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-cyan-50 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                    >
                      {/* Type Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {group.name}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${
                            group.type === "study"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {group.type === "study" ? "📚 Study" : "💻 Hackathon"}
                        </span>
                      </div>

                      {/* Goal */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {group.goal}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">
                            {group.members?.length || 0}
                          </span>
                          <span>members</span>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                          {group.privacy}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
