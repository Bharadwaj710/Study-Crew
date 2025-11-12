import Notification from "../models/notification.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";

// Only fetch notifications which are still pending
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      to: req.user.userId,
      $or: [
        { status: "pending" },
        { status: "unread" },
      ],
    })
      .populate("from", "name avatar")
      .populate("group", "name type goal privacy")
      .sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// controllers/notification.controller.js
export const respondNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const notification = await Notification.findById(id);
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    if (notification.to.toString() !== req.user.userId)
      return res.status(403).json({ message: "Unauthorized" });

    // Update current notification
    notification.status = action === "accept" ? "accepted" : "declined";
    await notification.save();

    // Handle join_request
    if (notification.type === "join_request") {
      const group = await Group.findById(notification.group);
      if (!group)
        return res.status(404).json({ message: "Group not found" });

      const request = group.joinRequests.find(
        (r) =>
          r.user.toString() === notification.from.toString() &&
          r.status === "pending"
      );

      if (request) {
  request.status = action === "accept" ? "accepted" : "declined";
  if (action === "accept") {
    if (!group.members.includes(request.user)) {
      group.members.push(request.user);
      await User.findByIdAndUpdate(request.user, {
        $addToSet: { joinedGroups: group._id },
      });
    }
  }
  await group.save();
}

      // 🔔 Send a notification back to the requester
      const creator = await User.findById(req.user.userId).select("name");
      const message =
        action === "accept"
          ? `${creator.name} accepted your join request. You have successfully joined "${group.name}".`
          : `${creator.name} declined your join request to "${group.name}".`;

      await Notification.create({
        to: notification.from, // the requester
        from: req.user.userId, // the creator
        group: group._id,
        type: "join_response", // new type
        message,
        status: "unread", // informational, not actionable
      });
    }

    res.json({ message: `Notification ${action}ed successfully` });
  } catch (error) {
    console.error("Respond notification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({
      _id: req.params.id,
      to: req.user.userId,
    });
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
