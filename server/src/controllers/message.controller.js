import Message from "../models/message.model.js";
import Group from "../models/group.model.js";

// Get messages for group
export const getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const limit = req.query.limit || 50;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.some((m) => m.toString() === req.user.userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const messages = await Message.find({ group: groupId })
      .populate("user", "name avatar email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create message
export const createMessage = async (req, res, io) => {
  try {
    const { groupId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.some((m) => m.toString() === req.user.userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const message = new Message({
      group: groupId,
      user: req.user.userId,
      text: text.trim(),
    });

    await message.save();
    await message.populate("user", "name avatar email");

    // Emit socket event
    if (io) {
      io.to(`group:${groupId}`).emit("message:new", message);
    }

    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
