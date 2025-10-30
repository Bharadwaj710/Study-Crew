import React, { useState, useEffect } from "react";
import {
  FaSave,
  FaPlus,
  FaTimes,
  FaGraduationCap,
  FaLightbulb,
  FaCode,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { userAPI } from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    about: "",
    education: {
      college: "",
      degree: "",
      year: "",
      major: "",
    },
    interests: [],
    skills: [],
  });
  const [newInterest, setNewInterest] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data.user);
      setFormData({
        name: response.data.user.name || "",
        email: response.data.user.email || "",
        about: response.data.user.about || "",
        education: response.data.user.education || {
          college: "",
          degree: "",
          year: "",
          major: "",
        },
        interests: response.data.user.interests || [],
        skills: response.data.user.skills || [],
      });
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load profile");
      setLoading(false);
    }
  };

  const handleAddInterest = () => {
    if (
      newInterest.trim() &&
      !formData.interests.includes(newInterest.trim())
    ) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()],
      });
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await userAPI.updateProfile(formData);
      toast.success("Profile updated successfully! 🎉");
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar user={user} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <div className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-2xl blur-2xl"></div>
          <div className="relative bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="flex items-center gap-6">
              <img
                src={
                  user?.avatar ||
                  "https://ui-avatars.com/api/?name=" + user?.name
                }
                alt={user?.name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div className="text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {user?.name}
                </h1>
                <p className="text-indigo-100">{user?.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {user?.skills?.slice(0, 3).map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-white/20 text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-6 bg-white rounded-lg p-1 shadow-md border border-gray-200/50 overflow-x-auto">
          {[
            { id: "basic", label: "Basic Info", icon: FaInfoCircle },
            { id: "education", label: "Education", icon: FaGraduationCap },
            { id: "interests", label: "Interests", icon: FaLightbulb },
            { id: "skills", label: "Skills", icon: FaCode },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === id
                  ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-600 to-cyan-600 rounded mr-3"></div>
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  About You
                </label>
                <textarea
                  value={formData.about}
                  onChange={(e) =>
                    setFormData({ ...formData, about: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                  rows="4"
                  placeholder="Tell us about yourself and your learning goals..."
                />
              </div>
            </div>
          )}

          {/* Education Tab */}
          {activeTab === "education" && (
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-600 to-cyan-600 rounded mr-3"></div>
                Education Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    College/University
                  </label>
                  <input
                    type="text"
                    value={formData.education.college}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        education: {
                          ...formData.education,
                          college: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    placeholder="e.g., MIT, Stanford"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={formData.education.degree}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        education: {
                          ...formData.education,
                          degree: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    placeholder="e.g., B.Tech, M.Sc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="text"
                    value={formData.education.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        education: {
                          ...formData.education,
                          year: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    placeholder="e.g., 2023-2027"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Major/Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.education.major}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        education: {
                          ...formData.education,
                          major: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Interests Tab */}
          {activeTab === "interests" && (
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-600 to-cyan-600 rounded mr-3"></div>
                Your Interests
              </h2>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddInterest())
                  }
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="Add an interest (e.g., AI, Web Dev)"
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center gap-2"
                >
                  <FaPlus /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {formData.interests.map((interest, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-cyan-100 text-indigo-800 rounded-full flex items-center gap-2 border border-indigo-200"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-1 hover:text-indigo-600 transition-colors"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === "skills" && (
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-600 to-cyan-600 rounded mr-3"></div>
                Your Skills
              </h2>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddSkill())
                  }
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="Add a skill (e.g., Python, React)"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center gap-2"
                >
                  <FaPlus /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full flex items-center gap-2 border border-green-200"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-green-600 transition-colors"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Joined Groups */}
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
              <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-600 to-cyan-600 rounded mr-3"></div>
              Joined Groups ({user?.joinedGroups?.length || 0})
            </h2>

            {user?.joinedGroups?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.joinedGroups.map((group) => (
                  <div
                    key={group._id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all bg-gradient-to-br from-gray-50 to-white"
                  >
                    <p className="font-semibold text-gray-900">{group.name}</p>
                    <p className="text-sm text-gray-600 mt-1 capitalize">
                      {group.type} • {group.privacy}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No groups joined yet
              </p>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
            >
              <FaSave className="mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
