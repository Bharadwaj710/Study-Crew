import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaSignOutAlt, FaCog, FaChevronDown } from "react-icons/fa";
import { authAPI, invitationAPI } from "../services/api";
import { toast } from "react-toastify";

const Navbar = ({ user }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotificationCount();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await invitationAPI.getInvitations();
      setNotificationCount(response.data.count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 backdrop-blur-md border-b border-white/10 shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center group">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-300">
              <span className="text-lg font-bold text-white">SC</span>
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-cyan-300 transition-all">
              StudyCrew
            </span>
          </Link>

          {/* Right side - Notifications & Profile */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Notification Bell */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2.5 text-gray-300 hover:text-cyan-400 hover:bg-white/10 rounded-lg transition-all duration-300 group"
            >
              <FaBell
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10 hidden sm:block"></div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 group"
              >
                <img
                  src={
                    user?.avatar ||
                    "https://ui-avatars.com/api/?name=" + user?.name
                  }
                  alt={user?.name}
                  className="h-8 w-8 rounded-full border-2 border-cyan-500/50 group-hover:border-cyan-500 transition-all group-hover:shadow-lg group-hover:shadow-cyan-500/30"
                />
                <span className="text-gray-200 font-medium hidden md:block group-hover:text-white transition-colors">
                  {user?.name}
                </span>
                <FaChevronDown
                  size={12}
                  className={`text-gray-400 hidden md:block transition-transform duration-300 ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-2xl border border-white/10 backdrop-blur-md overflow-hidden animate-fadeIn">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-gray-400 text-xs uppercase tracking-wider">
                      Account
                    </p>
                    <p className="text-white font-semibold mt-1">
                      {user?.name}
                    </p>
                    <p className="text-gray-400 text-xs">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-white/5 transition-all duration-200 group"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaCog className="mr-3 group-hover:rotate-90 transition-transform" />
                    <span>Profile Settings</span>
                  </Link>

                  {/* Divider */}
                  <div className="border-t border-white/10"></div>

                  {/* Sign Out */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
                  >
                    <FaSignOutAlt className="mr-3 group-hover:translate-x-1 transition-transform" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
