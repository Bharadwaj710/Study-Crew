import Invitation from "../models/invitation.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";

// Get user's invitations
export const getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      recipient: req.user.id,
      status: "pending",
    })
      .populate("sender", "name email avatar")
      .populate("group", "name type goal privacy")
      .sort({ createdAt: -1 });

    res.json({
      invitations,
      count: invitations.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Accept invitation
export const acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Verify recipient
    if (invitation.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update invitation status
    invitation.status = "accepted";
    await invitation.save();

    // Add user to group
    const group = await Group.findById(invitation.group);
    if (!group.members.includes(req.user.id)) {
      group.members.push(req.user.id);
      group.pendingInvites = group.pendingInvites.filter(
        (id) => id.toString() !== req.user.id
      );
      await group.save();
    }

    // Add group to user's joined groups
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { joinedGroups: invitation.group },
    });

    res.json({
      message: "Invitation accepted successfully",
      group,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Decline invitation
export const declineInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    invitation.status = "declined";
    await invitation.save();

    res.json({ message: "Invitation declined" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
