import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import Invitation from "../models/invitation.model.js";
import Task from "../models/task.model.js";

// Create group
export const createGroup = async (req, res) => {
  try {
    const {
      name,
      type,
      goal,
      privacy,
      invitedMembers = [],
      description,
    } = req.body;

    if (!name || !type || !goal) {
      return res
        .status(400)
        .json({ message: "Name, type, and goal are required" });
    }

    const creator = await User.findById(req.user.userId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const group = new Group({
      name,
      type,
      goal,
      privacy: privacy || "public",
      creator: req.user.userId,
      members: [req.user.userId], // only creator
      description: description || "",
      pendingInvites: invitedMembers,
    });
    await group.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $push: { joinedGroups: group._id },
    });
    if (invitedMembers.length > 0) {
      const invitations = invitedMembers.map((memberId) => ({
        sender: req.user.userId,
        recipient: memberId,
        group: group._id,
        message: `You've been invited to join ${name}`,
      }));

      await Invitation.insertMany(invitations);
    }

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all groups
export const getGroups = async (req, res) => {
  try {
    // Fetch user to see what groups they have confirmed membership in
    const user = await User.findById(req.user.userId).select("joinedGroups");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find groups that are either public or that user has joined (via joinedGroups array)
    const groups = await Group.find({
      $or: [{ privacy: "public" }, { _id: { $in: user.joinedGroups } }],
    })
      .populate("creator", "name email avatar")
      .populate("members", "name avatar")
      .sort({ createdAt: -1 });

    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single group
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("creator", "name email avatar")
      .populate("members", "name email avatar skills interests");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (member) => member._id.toString() === req.user.userId
    );

    if (group.privacy === "private" && !isMember) {
      return res
        .status(403)
        .json({ message: "You do not have access to this group" });
    }

    res.json({ group });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Join group
export const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.includes(req.user.userId))
      return res.status(400).json({ message: "Already a member" });

    if (group.privacy === "private")
      return res
        .status(403)
        .json({ message: "This is a private group. You need an invitation." });

    group.members.push(req.user.userId);
    await group.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $push: { joinedGroups: group._id },
    });

    res.json({ message: "Successfully joined the group", group });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a group and related tasks/invitations (only creator can delete)
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Only creator may delete
    if (group.creator.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Only the creator can delete this group." });
    }

    // Delete related tasks
    await Task.deleteMany({ group: group._id });

    // Delete related invitations
    await Invitation.deleteMany({ group: group._id });

    // Remove group reference from users' joinedGroups arrays
    await User.updateMany(
      { joinedGroups: group._id },
      { $pull: { joinedGroups: group._id } }
    );

    // Finally, delete the group itself
    await Group.findByIdAndDelete(group._id);

    // Optionally emit socket events here (if desired)

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("deleteGroup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
