import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import Invitation from "../models/invitation.model.js";

import Notification from "../models/notification.model.js";
import mongoose from "mongoose";
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
    const userId = req.user.userId || req.user.id;

    // Fetch user
    const user = await User.findById(userId).select("joinedGroups");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const groups = await Group.find({
      $or: [
        { members: userId },
        { creator: userId },
        { pendingInvites: userId },
        { "joinRequests.user": userId, "joinRequests.status": "pending" },
      ],
    })
      .populate("creator", "name email avatar")
      .populate("members", "name avatar")
      .sort({ createdAt: -1 });

    // Mark each group with requestPending flag if user has pending invitation or joinRequest
    const groupsWithStatus = groups.map((group) => {
      // Check if user has pending join request
      const hasJoinRequestPending = group.joinRequests.some(
        (jr) => jr.user.toString() === userId.toString() && jr.status === "pending"
      );

      // Check if in pending invites
      const hasPendingInvite = group.pendingInvites.some(
        (inviteeId) => inviteeId.toString() === userId.toString()
      );

      return {
        ...group.toObject(),
        requestPending: hasJoinRequestPending || hasPendingInvite,
      };
    });

    res.json({ groups: groupsWithStatus });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single group
export const getGroupById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const group = await Group.findById(req.params.id)
      .populate("creator", "name email avatar")
      .populate("members", "name email avatar skills interests");

    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(m => m._id.toString() === userId);
    const hasPendingJoinRequest = group.joinRequests.some(
      jr => jr.user.toString() === userId && jr.status === "pending"
    );
    const hasPendingInvite = group.pendingInvites.some(
      i => i.toString() === userId
    );

    // Deny access to any user who is not a member and has pending join request or invite
    if (!isMember) {
      if (hasPendingJoinRequest || hasPendingInvite) {
        return res.status(403).json({ message: "Your request/invitation is pending approval." });
      }
      if (group.privacy === "private") {
        return res.status(403).json({ message: "You do not have access to this private group." });
      }
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

export const exploreGroups = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const searchTerm = req.query.search || "";
    const regex = new RegExp(searchTerm, "i");

    const groups = await Group.aggregate([
      {
        $match: {
          privacy: "public",
          members: { $ne: new mongoose.Types.ObjectId(userId) },
          creator: { $ne: new mongoose.Types.ObjectId(userId) },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creatorInfo",
        },
      },
      { $unwind: "$creatorInfo" },
      {
        $match: {
          $or: [
            { name: { $regex: regex } },
            { description: { $regex: regex } },
            { "creatorInfo.name": { $regex: regex } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          name: 1,
          type: 1,
          goal: 1,
          privacy: 1,
          description: 1,
          createdAt: 1,
          creator: {
            _id: "$creatorInfo._id",
            name: "$creatorInfo.name",
            avatar: "$creatorInfo.avatar",
          },
          members: 1,
          pendingInvites: 1,
          joinRequests: 1,
         requested: {
  $in: [
    new mongoose.Types.ObjectId(userId),
    {
      $map: {
        input: {
          $filter: {
            input: { $ifNull: ["$joinRequests", []] },
            as: "jr",
            cond: { $eq: ["$$jr.status", "pending"] }
          }
        },
        as: "jr",
        in: "$$jr.user"
      }
    }
  ]
}
        },
      },
    ]);

    res.json({ groups });
  } catch (error) {
    console.error("Explore groups search error:", error);
    res.status(500).json({ message: "Server error fetching groups", error: error.message });
  }
};

export const requestToJoinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Remove any old declined join requests for this user
    group.joinRequests = group.joinRequests.filter(
      (r) => !(r.user.toString() === req.user.userId && r.status === "declined")
    );

    // Prevent duplicate pending requests
    if (
      group.members.includes(req.user.userId) ||
      group.joinRequests.some(
        (r) => r.user.toString() === req.user.userId && r.status === "pending"
      )
    ) {
      return res
        .status(400)
        .json({ message: "Already a member or request pending" });
    }

    // Add new join request
    group.joinRequests.push({ user: req.user.userId, status: "pending" });
    await group.save();

    // Notify creator
    const requester = await User.findById(req.user.userId).select("name avatar");
    await Notification.create({
      to: group.creator,
      from: req.user.userId,
      group: group._id,
      type: "join_request",
      message: `${requester?.name || "Someone"} requested to join your group "${group.name}".`,
    });

    res.json({ message: "Join request sent" });
  } catch (error) {
    console.error("Request to join group error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const listJoinRequests = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      // Populate joinRequests.user
      .populate({
        path: "joinRequests.user",
        select: "name email avatar",
      });

    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.creator.toString() !== req.user.userId) return res.status(403).json({ message: "Not authorized" });

    // Filter joinRequests to only pending ones before sending response
    const pendingJoinRequests = group.joinRequests.filter(
      (jr) => jr.status === "pending"
    );

    res.json({ joinRequests: pendingJoinRequests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const handleJoinRequest = async (req, res) => {
  try {
    const { userId, action } = req.body; // 'accept' or 'decline'
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.creator.toString() !== req.user.userId)
      return res.status(403).json({ message: "Not authorized" });

    const request = group.joinRequests.find(
      (j) => j.user.toString() === userId && j.status === "pending"
    );
    if (!request)
      return res.status(404).json({ message: "Join request not found" });

    request.status = action === "accept" ? "accepted" : "declined";

    // ✅ If accepted, add to members
    if (action === "accept") {
      if (!group.members.includes(userId)) {
        group.members.push(userId);
        await User.findByIdAndUpdate(userId, {
          $addToSet: { joinedGroups: group._id },
        });
      }
    }

    await group.save();

    // ✅ Delete or update the original join_request notification
    await Notification.deleteMany({
      to: req.user.userId, // the creator who received the join request
      from: userId,        // the requester
      group: group._id,
      type: "join_request",
    });

    // ✅ Send a join_response notification to the requester
    const creator = await User.findById(req.user.userId).select("name");
    const message =
      action === "accept"
        ? `${creator.name} accepted your join request. You have successfully joined "${group.name}".`
        : `${creator.name} declined your join request to "${group.name}".`;

    await Notification.create({
      to: userId,
      from: req.user.userId,
      group: group._id,
      type: "join_response",
      message,
      status: "unread",
    });

    // ✅ Return updated group info
    const updatedGroup = await Group.findById(group._id)
      .populate("creator", "name email avatar")
      .populate("members", "name email avatar")
      .populate("joinRequests.user", "name email avatar");

    res.json({ message: `Request ${action}ed`, group: updatedGroup });
  } catch (error) {
    console.error("Handle join request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const cancelJoinRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Remove the join request for this user
    const initialLength = group.joinRequests.length;
    group.joinRequests = group.joinRequests.filter(
      jr => jr.user.toString() !== userId.toString() || jr.status !== "pending"
    );

    if (group.joinRequests.length === initialLength) {
      return res.status(400).json({ message: "No pending join request found" });
    }

    await group.save();

    // Remove the notification created for this join request if any
    await Notification.deleteMany({
      to: group.creator,
      from: userId,
      group: group._id,
      type: "join_request",
      status: "pending",
    });

    res.json({ message: "Join request cancelled successfully" });
  } catch (error) {
    console.error("Cancel join request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =======================
// 🚪 Leave Group Function
// =======================
export const leaveGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id: groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.creator.toString() === userId) {
      return res.status(400).json({ message: "Group creator cannot leave their own group" });
    }

    group.members = group.members.filter(m => m.toString() !== userId);
    await group.save();

    await User.findByIdAndUpdate(userId, { $pull: { joinedGroups: group._id } });

    const member = await User.findById(userId).select("name username email");
    const displayName = member?.name || member?.username || member?.email?.split("@")[0] || "A member";

    await Notification.create({
      to: group.creator,
      from: userId,
      group: group._id,
      type: "group_activity",
      message: `${displayName} has left your group "${group.name}".`,
      status: "unread",
    });

    return res.status(200).json({ message: "You have left the group successfully." });
  } catch (error) {
    console.error("Leave group error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==============================
// ❌ Remove Member Functionality
// ==============================
export const removeMember = async (req, res) => {
  try {
    const creatorId = req.user.userId;
    const { id: groupId, memberId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.creator.toString() !== creatorId)
      return res.status(403).json({ message: "Not authorized" });

    if (memberId === creatorId)
      return res
        .status(400)
        .json({ message: "Creator cannot remove themselves" });

    // Remove member
    group.members = group.members.filter(
      (m) => m.toString() !== memberId.toString()
    );
    await group.save();

    // Remove from user's joinedGroups
    await User.findByIdAndUpdate(memberId, {
      $pull: { joinedGroups: group._id },
    });

    // Notify the removed member
    const creator = await User.findById(creatorId).select("name");
    await Notification.create({
      to: memberId,
      from: creatorId,
      group: group._id,
      type: "removed_member",
      message: `${creator.name} removed you from the group "${group.name}".`,
      status: "unread",
    });

    // Return updated members
    const updatedGroup = await Group.findById(group._id)
      .populate("creator", "name avatar")
      .populate("members", "name avatar");

    res.json({
      message: "Member removed successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("Remove member error:", error);
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
