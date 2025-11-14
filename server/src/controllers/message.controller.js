import Message from "../models/message.model.js";
import Group from "../models/group.model.js";

// Get messages for group with pagination
export const getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before; // timestamp or messageId for pagination

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check membership
    if (!group.members.some((m) => m.toString() === req.user.userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const query = { groupId, deleted: false };

    if (before) {
      // Parse before as timestamp or messageId
      if (before.match(/^[0-9a-f]{24}$/i)) {
        // It's a message ID
        const beforeMessage = await Message.findById(before);
        if (beforeMessage) {
          query.createdAt = { $lt: beforeMessage.createdAt };
        }
      } else {
        // It's a timestamp
        query.createdAt = { $lt: new Date(before) };
      }
    }

    const messages = await Message.find(query)
      .populate("sender", "name avatar email")
      .populate("replyTo", "text sender")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ messages: messages.reverse(), total: messages.length });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create message (REST fallback; primarily via Socket.IO)
export const createMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, type, fileUrl, fileName, fileSize, fileMime, replyTo } =
      req.body;

    if (!text && !fileUrl) {
      return res
        .status(400)
        .json({ message: "Message text or file is required" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check membership
    if (!group.members.some((m) => m.toString() === req.user.userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const messageData = {
      groupId,
      sender: req.user.userId,
      text: text || null,
      type: type || "text",
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null,
      fileMime: fileMime || null,
      replyTo: replyTo || null,
    };

    const message = new Message(messageData);
    await message.save();
    await message.populate("sender", "name avatar email");
    await message.populate("replyTo", "text sender");

    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    console.error("Create message error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Edit message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Text is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Only original sender can edit
    if (message.sender.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own messages" });
    }

    message.text = text.trim();
    message.edited = true;
    await message.save();
    await message.populate("sender", "name avatar email");

    res.json({ message: "Message updated", data: message });
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const group = await Group.findById(message.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.creator.toString() === req.user.userId;
    const isSender = message.sender.toString() === req.user.userId;

    // Only sender or admin can delete
    if (!isAdmin && !isSender) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this message" });
    }

    message.deleted = true;
    message.text = null;
    message.fileUrl = null;
    await message.save();

    res.json({ message: "Message deleted", messageId: message._id });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete all messages for a group (called when group is deleted)
export const deleteGroupMessages = async (groupId) => {
  try {
    await Message.deleteMany({ groupId });
    console.log(`Deleted all messages for group ${groupId}`);
  } catch (error) {
    console.error("Delete group messages error:", error);
  }
};
