import User from "../models/user.model.js";
import mongoose from "mongoose";

// Return a public summary of a user (no sensitive fields)
export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id)
      .select("name avatar about education interests skills links joinedGroups")
      .populate({ path: "joinedGroups", select: "name type _id", options: { limit: 3 } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return a clean object
    res.json({ user });
  } catch (error) {
    console.error("getPublicProfile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default { getPublicProfile };
