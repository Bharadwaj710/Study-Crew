import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaEnvelope, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { invitationAPI, userAPI, notificationAPI } from "../services/api";

const Notifications = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processedIds, setProcessedIds] = useState(new Set());
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all notifications
  const fetchData = async () => {
    try {
      const [userResponse, invitationResponse, notificationResponse] =
        await Promise.all([
          userAPI.getProfile(),
          invitationAPI.getInvitations(),
          notificationAPI.getNotifications(),
        ]);

      setUser(userResponse.data.user);

      // Merge invitations and notifications
      const allNotifications = [
        ...invitationResponse.data.invitations.map((i) => ({
          ...i,
          type: "invitation",
          isJoinRequest: false,
        })),
        ...notificationResponse.data.notifications.map((n) => ({
          ...n,
          isJoinRequest: n.type === "join_request",
        })),
      ];

      allNotifications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setNotifications(allNotifications);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Failed to load notifications");
      setLoading(false);
    }
  };

  const handleAccept = async (notif) => {
    const id = notif._id;
    setProcessedIds((prev) => new Set([...prev, id]));
    try {
      if (notif.isJoinRequest) {
        await notificationAPI.respondNotification(id, "accept");
        toast.success("✅ Join request accepted!");
      } else {
        await invitationAPI.acceptInvitation(id);
        toast.success("🎉 Invitation accepted!");
      }
      fetchData();
    } catch (error) {
      toast.error("Failed to accept request");
      setProcessedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDecline = async (notif) => {
    const id = notif._id;
    setProcessedIds((prev) => new Set([...prev, id]));
    try {
      if (notif.isJoinRequest) {
        await notificationAPI.respondNotification(id, "decline");
        toast.info("❌ Join request declined");
      } else {
        await invitationAPI.declineInvitation(id);
        toast.info("Invitation declined");
      }
      fetchData();
    } catch (error) {
      toast.error("Failed to decline request");
      setProcessedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // 🗑️ Handle remove
  const handleRemove = async (notifId) => {
    try {
      setRemovingId(notifId);
      await notificationAPI.deleteNotification(notifId);
      toast.success("🗑️ Notification removed");
      setNotifications((prev) =>
        prev.filter((n) => n._id !== notifId)
      );
    } catch (error) {
      toast.error("Failed to remove notification");
      console.error(error);
    } finally {
      setRemovingId(null);
    }
  };

  // Helpers
const getNotificationTitle = (notif) => {
  switch (notif.type) {
    case "join_request":
      return "Join Request";
    case "join_response":
      return "Group Update";
    case "removed_member":
      return "Removed from Group";
    case "group_activity":
      return "Group Activity";
    case "invitation":
      return "Group Invitation";
    default:
      return "Notification";
  }
};

const getNotificationMessage = (notif) => {
  switch (notif.type) {
    case "join_request":
      return `${notif.from?.name || "Someone"} requested to join "${
        notif.group?.name
      }"`;
    case "join_response":
    case "removed_member":
    case "group_activity":
      return notif.message;
    case "invitation":
      return `${
        notif.sender?.name || notif.from?.name
      } invited you to join "${notif.group?.name}"`;
    default:
      return notif.message || "You have a new notification.";
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
              {notifications.length}{" "}
              {notifications.length === 1 ? "notification" : "notifications"}{" "}
              total
            </p>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-6">
              <FaEnvelope className="text-indigo-600 text-4xl" />
            </div>
            <p className="text-gray-900 text-xl font-semibold mb-2">
              No notifications
            </p>
            <p className="text-gray-600">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif, index) => (
              <div
                key={notif._id}
                className="relative overflow-hidden rounded-2xl border border-gray-200/50 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{
                  animation: `slideIn 0.5s ease-out ${index * 0.1}s forwards`,
                  opacity: 0,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-cyan-500/5"></div>

                <div className="relative p-6 md:p-8 bg-white flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Notification Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={notif.sender?.avatar || notif.from?.avatar}
                        alt={notif.sender?.name || notif.from?.name}
                        className="w-16 h-16 rounded-full border-2 border-indigo-300 shadow-md flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          {getNotificationTitle(notif)}
                        </p>
                        <p
  className={`font-semibold mb-2 ${
    notif.type === "join_response"
      ? notif.message.includes("accepted")
        ? "text-green-700"
        : "text-red-600"
      : notif.type === "removed_member"
      ? "text-red-600"
      : notif.type === "group_activity"
      ? "text-indigo-700"
      : "text-gray-900"
  }`}
>
  {getNotificationMessage(notif)}
</p>

                        {notif.group?.goal && (
                          <p className="text-gray-600 text-sm mt-3 italic border-l-2 border-indigo-300 pl-3">
                            "{notif.group?.goal}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 items-center">
                      {!["join_response", "removed_member", "group_activity"].includes(notif.type) && (
                        <>
                          <button
                            onClick={() => handleAccept(notif)}
                            disabled={processedIds.has(notif._id)}
                            className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                          >
                            <FaCheck className="inline mr-2" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleDecline(notif)}
                            disabled={processedIds.has(notif._id)}
                            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                          >
                            <FaTimes className="inline mr-2" />
                            Decline
                          </button>
                        </>
                      )}

                      {/* 🗑️ Remove Button */}
                      <button
                        onClick={() => handleRemove(notif._id)}
                        disabled={removingId === notif._id}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                      >
                        <FaTrash className="inline mr-1 text-red-600" />
                        {removingId === notif._id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
