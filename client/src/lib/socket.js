import { io } from "socket.io-client";

// Use the API server URL (same origin as backend) for socket connection
// If VITE_API_URL includes a trailing /api, strip it because socket server runs at root
const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOCKET_SERVER_URL = rawApiUrl.replace(/\/api\/?$/, "");

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_SERVER_URL, {
    auth: {
      token: `Bearer ${token}`,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initializeSocket first.");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Utility functions for socket events
export const joinRoom = (groupId) => {
  const sock = getSocket();
  sock.emit("joinRoom", { groupId });
};

export const leaveRoom = (groupId) => {
  const sock = getSocket();
  sock.emit("leaveRoom", { groupId });
};

export const sendMessage = (groupId, messageData) => {
  const sock = getSocket();
  return new Promise((resolve, reject) => {
    try {
      sock.emit("sendMessage", { groupId, ...messageData }, (err, saved) => {
        if (err) {
          return reject(err);
        }
        return resolve(saved);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const editMessage = (messageId, text, groupId) => {
  const sock = getSocket();
  sock.emit("editMessage", {
    messageId,
    text,
    groupId,
  });
};

export const deleteMessage = (messageId, groupId) => {
  const sock = getSocket();
  sock.emit("deleteMessage", {
    messageId,
    groupId,
  });
};

export const sendTypingIndicator = (groupId, isTyping) => {
  const sock = getSocket();
  sock.emit("typing", {
    groupId,
    isTyping,
  });
};

export const listenToMessages = (callback) => {
  const sock = getSocket();
  // Listen to canonical message event and legacy event (some servers may use either)
  sock.on("message", callback);
  sock.on("messageReceived", callback);
  return () => {
    sock.off("message", callback);
    sock.off("messageReceived", callback);
  };
};

export const listenToMessageUpdates = (callback) => {
  const sock = getSocket();
  sock.on("messageUpdated", callback);
  return () => sock.off("messageUpdated", callback);
};

export const listenToMessageDeletes = (callback) => {
  const sock = getSocket();
  sock.on("messageDeleted", callback);
  return () => sock.off("messageDeleted", callback);
};

export const listenToTyping = (callback) => {
  const sock = getSocket();
  sock.on("typing", callback);
  return () => sock.off("typing", callback);
};

export const listenToRoomMembers = (callback) => {
  const sock = getSocket();
  sock.on("roomMembersUpdated", callback);
  return () => sock.off("roomMembersUpdated", callback);
};

export const listenToRoomJoined = (callback) => {
  const sock = getSocket();
  sock.on("roomJoined", callback);
  return () => sock.off("roomJoined", callback);
};

export const listenToGroupDeleted = (callback) => {
  const sock = getSocket();
  sock.on("groupDeleted", callback);
  return () => sock.off("groupDeleted", callback);
};

export const listenToErrors = (callback) => {
  const sock = getSocket();
  sock.on("error", callback);
  return () => sock.off("error", callback);
};
