import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaEnvelope, FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { invitationAPI, userAPI } from "../services/api";

const Notifications = () => {
  const [user, setUser] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processedIds, setProcessedIds] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userResponse, invitationsResponse] = await Promise.all([
        userAPI.getProfile(),
        invitationAPI.getInvitations(),
      ]);

      setUser(userResponse.data.user);
      setInvitations(invitationsResponse.data.invitations);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load notifications");
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId) => {
    setProcessedIds((prev) => new Set([...prev, invitationId]));
    try {
      await invitationAPI.acceptInvitation(invitationId);
      toast.success("🎉 Invitation accepted! You are now a member.");
      fetchData();
    } catch (error) {
      toast.error("Failed to accept invitation");
      setProcessedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(invitationId);
        return newSet;
      });
    }
  };

  const handleDecline = async (invitationId) => {
    setProcessedIds((prev) => new Set([...prev, invitationId]));
    try {
      await invitationAPI.declineInvitation(invitationId);
      toast.info("Invitation declined");
      fetchData();
    } catch (error) {
      toast.error("Failed to decline invitation");
      setProcessedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(invitationId);
        return newSet;
      });
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
              Loading notifications...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar user={user} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-2xl blur-2xl"></div>
          <div className="relative bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl border border-indigo-200/50 p-8 md:p-10">
            <h1 className="text-4xl font-bold flex items-center gap-3 text-gray-900">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-600">
                <FaEnvelope className="text-white text-xl" />
              </div>
              Notifications
            </h1>
            <p className="text-gray-600 mt-2">
              {invitations.length}{" "}
              {invitations.length === 1 ? "invitation" : "invitations"} pending
            </p>
          </div>
        </div>

        {/* Notifications Container */}
        {invitations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-6">
              <FaEnvelope className="text-indigo-600 text-4xl" />
            </div>
            <p className="text-gray-900 text-xl font-semibold mb-2">
              No pending invitations
            </p>
            <p className="text-gray-600">
              You're all caught up! Check back later for new group invitations.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation, index) => (
              <div
                key={invitation._id}
                className="relative overflow-hidden rounded-2xl border border-gray-200/50 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{
                  animation: `slideIn 0.5s ease-out ${index * 0.1}s forwards`,
                  opacity: 0,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-cyan-500/5"></div>

                <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white">
                  {/* Invitation Info */}
                  <div className="flex items-start md:items-center gap-4 flex-1">
                    <img
                      src={invitation.sender?.avatar}
                      alt={invitation.sender?.name}
                      className="w-16 h-16 rounded-full border-2 border-indigo-300 shadow-md flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Group Invitation
                      </p>
                      <p className="text-gray-900 font-semibold mb-2">
                        <span className="text-indigo-600">
                          {invitation.sender?.name}
                        </span>{" "}
                        invited you to join{" "}
                        <span className="text-indigo-600">
                          {invitation.group?.name}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-3 mt-3 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                          {invitation.group?.type === "study"
                            ? "📚 Study Group"
                            : "💻 Hackathon"}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium capitalize">
                          {invitation.group?.privacy}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-3 italic border-l-2 border-indigo-300 pl-3">
                        "{invitation.group?.goal}"
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleAccept(invitation._id)}
                      disabled={processedIds.has(invitation._id)}
                      className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md hover:shadow-lg"
                    >
                      <FaCheck className="mr-2" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(invitation._id)}
                      disabled={processedIds.has(invitation._id)}
                      className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md hover:shadow-lg"
                    >
                      <FaTimes className="mr-2" />
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Keyframe Animation */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
