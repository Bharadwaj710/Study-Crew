import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const MESSAGE_RATE_LIMIT = 5; // messages per minute
const TYPING_TIMEOUT = 3000; // 3 seconds

// Rate limiting map: userId -> { count, timestamp }
const messageRateLimit = new Map();
// Typing status map: userId -> { groupId, timeout }
const typingStatus = new Map();
// User to socket mapping: userId -> Set of socketIds
const userSockets = new Map();

// Verify JWT from socket connection
const verifyToken = (token) => {
  try {
    if (!token) return null;
    // Remove "Bearer " prefix if present
    const bearerToken = token.startsWith("Bearer ") ? token.slice(7) : token;
    return jwt.verify(bearerToken, JWT_SECRET);
  } catch (error) {
    console.error("Token verification error:", error.message);
    return null;
  }
};

// Check rate limit
const checkRateLimit = (userId) => {
  const now = Date.now();
  const limit = messageRateLimit.get(userId);

  if (!limit) {
    messageRateLimit.set(userId, { count: 1, timestamp: now });
    return true;
  }

  // Reset counter if minute has passed
  if (now - limit.timestamp > 60000) {
    messageRateLimit.set(userId, { count: 1, timestamp: now });
    return true;
  }

  // Check if limit exceeded
  if (limit.count >= MESSAGE_RATE_LIMIT) {
    return false;
  }

  limit.count++;
  return true;
};

// Sanitize message text
const sanitizeText = (text) => {
  if (!text) return "";
  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
};

// Get group member information
const getGroupMembers = async (groupId) => {
  try {
    const group = await Group.findById(groupId).populate(
      "members",
      "_id name avatar"
    );
    if (!group) return { members: [], admins: [] };

    return {
      members: group.members,
      admins: [group.creator.toString()],
    };
  } catch (error) {
    console.error("Get group members error:", error);
    return { members: [], admins: [] };
  }
};

// Check if user is group member
const isGroupMember = async (userId, groupId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) return false;
    return group.members.some((m) => m.toString() === userId);
  } catch (error) {
    console.error("Check group member error:", error);
    return false;
  }
};

// Emit room members updated event
const emitRoomMembersUpdated = async (io, groupId) => {
  const { members, admins } = await getGroupMembers(groupId);
  io.to(groupId).emit("roomMembersUpdated", {
    groupId,
    members: members.map((m) => ({
      _id: m._id,
      name: m.name,
      avatar: m.avatar,
    })),
    admins,
  });
};

export default function setupChatSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Authenticate user on connect
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log("Socket authentication failed:", socket.id);
      socket.emit("error", { message: "Authentication failed" });
      socket.disconnect();
      return;
    }

    const userId = decoded.userId || decoded.id;
    socket.userId = userId;
    socket.user = decoded;

    // Track socket to user mapping
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    console.log(`User ${userId} connected with socket ${socket.id}`);

    // ===== ROOM MANAGEMENT =====

    socket.on("joinRoom", async (data) => {
      try {
        const { groupId } = data;
        if (!groupId) {
          socket.emit("error", { message: "GroupId is required" });
          return;
        }

        // Verify user is group member
        const isMember = await isGroupMember(userId, groupId);
        if (!isMember) {
          socket.emit("error", {
            message: "You are not a member of this group",
          });
          return;
        }

        // Prevent repeated join logging if already in room
        if (!socket.rooms.has(groupId)) {
          socket.join(groupId);
          console.log(`User ${userId} joined room ${groupId}`);
        }

        // Emit room members updated
        await emitRoomMembersUpdated(io, groupId);

        // Send confirmation to user
        socket.emit("roomJoined", { groupId });
      } catch (error) {
        console.error("Join room error:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("leaveRoom", async (data) => {
      try {
        const { groupId } = data;
        if (!groupId) return;

        socket.leave(groupId);
        console.log(`User ${userId} left room ${groupId}`);

        // Clear typing status for this room
        if (typingStatus.has(userId)) {
          const status = typingStatus.get(userId);
          if (status.groupId === groupId) {
            typingStatus.delete(userId);
          }
        }

        socket.emit("roomLeft", { groupId });
      } catch (error) {
        console.error("Leave room error:", error);
      }
    });

    // ===== MESSAGE EVENTS =====

    // sendMessage now supports acknowledgements: socket.emit('sendMessage', data, (err, saved) => {})
    socket.on("sendMessage", async (data, callback) => {
      try {
        const {
          groupId,
          text,
          type,
          fileUrl,
          fileName,
          fileSize,
          fileMime,
          fileDownloadUrl,
          replyTo,
          clientTempId,
        } = data;

        if (!groupId) {
          socket.emit("error", { message: "GroupId is required" });
          return;
        }

        if (!text && !fileUrl) {
          socket.emit("error", {
            message: "Message text or file URL is required",
          });
          return;
        }

        // Check rate limit
        if (!checkRateLimit(userId)) {
          socket.emit("error", {
            message: "Too many messages. Please wait before sending another.",
          });
          return;
        }

        // Verify user is group member
        const isMember = await isGroupMember(userId, groupId);
        if (!isMember) {
          socket.emit("error", {
            message: "You are not a member of this group",
          });
          return;
        }

        // Prevent duplicate insertion if client provided clientTempId and message exists
        let message = null;
        if (clientTempId) {
          message = await Message.findOne({ clientTempId, sender: userId });
        }

        if (!message) {
          // Create message
          const messageData = {
            groupId,
            sender: userId,
            text: sanitizeText(text) || null,
            type: type || "text",
            fileUrl: fileUrl || null,
            fileDownloadUrl: fileDownloadUrl || null,
            fileName: fileName || null,
            fileSize: fileSize || null,
            fileMime: fileMime || null,
            replyTo: replyTo || null,
            clientTempId: clientTempId || null,
          };

          message = new Message(messageData);
          await message.save();
        }

        // Populate sender info
        await message.populate("sender", "name avatar email");
        if (message.replyTo) {
          await message.populate("replyTo", "text sender");
        }

        // Prepare payload
        const payload = {
          _id: message._id,
          groupId: message.groupId,
          sender: message.sender,
          text: message.text,
          type: message.type,
          fileUrl: message.fileUrl,
          fileDownloadUrl: message.fileDownloadUrl || null,
          fileName: message.fileName,
          fileSize: message.fileSize,
          fileMime: message.fileMime,
          replyTo: message.replyTo,
          createdAt: message.createdAt,
          edited: message.edited,
          deleted: message.deleted,
          clientTempId: message.clientTempId || null,
        };

        // Emit message to room (canonical saved message). Emit once.
        io.to(groupId).emit("message", payload);

        // Acknowledge the sender with the saved message
        if (typeof callback === "function") {
          try {
            callback(null, payload);
          } catch (e) {
            // ignore ack callback errors
          }
        }

        // Clear typing status
        typingStatus.delete(userId);
        io.to(groupId).emit("typing", {
          userId,
          groupId,
          isTyping: false,
        });

        console.log(
          `Message saved ${message._id} by ${userId} in group ${groupId}`
        );
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("editMessage", async (data) => {
      try {
        const { messageId, text, groupId } = data;

        if (!messageId || !text) {
          socket.emit("error", { message: "MessageId and text are required" });
          return;
        }

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        // Only sender can edit
        if (message.sender.toString() !== userId) {
          socket.emit("error", {
            message: "You can only edit your own messages",
          });
          return;
        }

        message.text = sanitizeText(text);
        message.edited = true;
        await message.save();
        await message.populate("sender", "name avatar email");

        // Emit updated message
        io.to(groupId || message.groupId).emit("messageUpdated", {
          _id: message._id,
          text: message.text,
          edited: message.edited,
          updatedAt: message.updatedAt,
        });

        console.log(`Message ${messageId} edited by ${userId}`);
      } catch (error) {
        console.error("Edit message error:", error);
        socket.emit("error", { message: "Failed to edit message" });
      }
    });

    socket.on("deleteMessage", async (data) => {
      try {
        const { messageId, groupId } = data;

        if (!messageId) {
          socket.emit("error", { message: "MessageId is required" });
          return;
        }

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        // Get group to check if user is admin
        const group = await Group.findById(message.groupId);
        if (!group) {
          socket.emit("error", { message: "Group not found" });
          return;
        }

        const isAdmin = group.creator.toString() === userId;
        const isSender = message.sender.toString() === userId;

        if (!isAdmin && !isSender) {
          socket.emit("error", {
            message: "You don't have permission to delete this message",
          });
          return;
        }

        message.deleted = true;
        message.text = null;
        message.fileUrl = null;
        await message.save();

        // Emit deleted message event
        io.to(groupId || message.groupId).emit("messageDeleted", {
          messageId: message._id,
          groupId: message.groupId,
        });

        console.log(`Message ${messageId} deleted by ${userId}`);
      } catch (error) {
        console.error("Delete message error:", error);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });

    // ===== TYPING INDICATOR =====

    socket.on("typing", (data) => {
      try {
        const { groupId, isTyping } = data;

        if (!groupId) return;

        if (isTyping) {
          // Set typing status
          typingStatus.set(userId, {
            groupId,
            timeout: setTimeout(() => {
              typingStatus.delete(userId);
              io.to(groupId).emit("typing", {
                userId,
                groupId,
                isTyping: false,
              });
            }, TYPING_TIMEOUT),
          });
        } else {
          // Clear typing status
          const status = typingStatus.get(userId);
          if (status) {
            clearTimeout(status.timeout);
            typingStatus.delete(userId);
          }
        }

        // Broadcast typing status to room (except sender)
        socket.to(groupId).emit("typing", {
          userId,
          groupId,
          isTyping,
        });
      } catch (error) {
        console.error("Typing event error:", error);
      }
    });

    // ===== PRESENCE & DISCONNECT =====

    socket.on("disconnect", () => {
      try {
        // Remove socket from user mapping
        if (userSockets.has(userId)) {
          userSockets.get(userId).delete(socket.id);
          if (userSockets.get(userId).size === 0) {
            userSockets.delete(userId);
            console.log(`User ${userId} fully disconnected`);
          }
        }

        // Clear typing status
        const status = typingStatus.get(userId);
        if (status) {
          clearTimeout(status.timeout);
          typingStatus.delete(userId);
        }

        console.log(`Socket ${socket.id} disconnected`);
      } catch (error) {
        console.error("Disconnect error:", error);
      }
    });

    // ===== ERROR HANDLING =====

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
}
