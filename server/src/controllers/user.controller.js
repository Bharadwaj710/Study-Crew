import User from "../models/user.model.js";
import validator from "validator";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  removeLocalFile,
} from "../utils/uploadImage.js";
// Get current user profile
export const getProfile = async (req, res) => {
  try {
    console.log("User in request:", req.user);
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("joinedGroups", "name type privacy");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user,
      isProfileComplete: user.checkProfileCompletion(),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      about,
      education,
      interests,
      skills,
      avatar,
      links,
      contact,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (about) user.about = about;
    if (education) user.education = { ...user.education, ...education };
    if (interests) user.interests = interests;
    if (skills) user.skills = skills;
    if (avatar) user.avatar = avatar;

    // Handle links if provided: validate and sanitize
    if (links && Array.isArray(links)) {
      const validLinks = [];
      for (const l of links) {
        if (!l) continue;
        const nameVal = (l.name || "").toString().trim();
        const urlVal = (l.url || "").toString().trim();
        // require both name and a valid absolute URL (with protocol)
        if (
          nameVal.length > 0 &&
          urlVal.length > 0 &&
          validator.isURL(urlVal, { require_protocol: true })
        ) {
          validLinks.push({ name: nameVal, url: urlVal });
        }
      }
      // Replace user's links with validated set
      user.links = validLinks;
    }

    // Handle contact updates if provided: merge partial updates.
    // Be permissive and store trimmed values sent by the client so UX is not confusing.
    if (contact && typeof contact === "object") {
      const updatedContact = { ...(user.contact || {}) };

      // Phone: store trimmed value (client already validates length). Keep formatting.
      if (contact.phone !== undefined) {
        updatedContact.phone = (contact.phone || "").toString().trim();
      }

      // Alternate email: store trimmed value. Server-side validation available but do not block saving here.
      if (contact.alternateEmail !== undefined) {
        updatedContact.alternateEmail = (contact.alternateEmail || "")
          .toString()
          .trim();
      }

      // City / state / country: accept trimmed strings (allow empty to clear)
      ["city", "state", "country"].forEach((f) => {
        if (contact[f] !== undefined) {
          updatedContact[f] = (contact[f] || "").toString().trim();
        }
      });

      // Debug log to trace contact updates
      console.log("Updating contact for user", req.user.userId, updatedContact);

      user.contact = updatedContact;
    }

    // Check if profile is complete
    user.isProfileComplete = user.checkProfileCompletion();

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Search users by name
export const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.trim().length < 2) {
      return res.status(400).json({ message: "Search query too short" });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
      _id: { $ne: req.user.userId }, // Exclude current user
    })
      .select("name email avatar skills interests")
      .limit(10);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// AI-powered member recommendation
export const recommendMembers = async (req, res) => {
  try {
    const { skills, interests, limit = 5 } = req.query;

    const skillsArray = skills ? skills.split(",") : [];
    const interestsArray = interests ? interests.split(",") : [];

    // Find users with matching skills or interests
    const users = await User.find({
      _id: { $ne: req.user.userId },
      $or: [
        { skills: { $in: skillsArray } },
        { interests: { $in: interestsArray } },
      ],
    })
      .select("name email avatar skills interests")
      .limit(parseInt(limit));

    // Simple scoring algorithm
    const scoredUsers = users.map((user) => {
      let score = 0;

      // Count matching skills
      const matchingSkills = user.skills.filter((skill) =>
        skillsArray.includes(skill)
      ).length;

      // Count matching interests
      const matchingInterests = user.interests.filter((interest) =>
        interestsArray.includes(interest)
      ).length;

      score = matchingSkills * 2 + matchingInterests;

      return {
        ...user.toObject(),
        matchScore: score,
        matchingSkills,
        matchingInterests,
      };
    });

    // Sort by score
    scoredUsers.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      recommended: scoredUsers,
      message: "Recommendations based on skills and interests match",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Upload avatar and save to user profile
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      // cleanup temp file
      removeLocalFile(req.file.path);
      return res.status(404).json({ message: "User not found" });
    }

    // If user already had an image uploaded to Cloudinary, remove it
    if (user.cloudinaryId) {
      try {
        await deleteFromCloudinary(user.cloudinaryId);
      } catch (err) {
        // log and continue
        console.error(
          "Failed to delete previous Cloudinary image:",
          err.message || err
        );
      }
    }

    // Upload new file
    const { url, public_id } = await uploadToCloudinary(
      req.file.path,
      "studycrew/avatars"
    );

    user.avatar = url;
    user.cloudinaryId = public_id;
    await user.save();

    // remove local temp file
    removeLocalFile(req.file.path);

    res.json({
      avatarUrl: url,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    // try to clean temp file
    if (req.file && req.file.path) removeLocalFile(req.file.path);
    console.error("uploadAvatar error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove avatar: delete Cloudinary image (if any) and reset user's avatar to default (ui-avatars)
export const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If there is a cloudinary image stored, delete it
    if (user.cloudinaryId) {
      try {
        await deleteFromCloudinary(user.cloudinaryId);
      } catch (err) {
        console.error(
          "Failed to delete Cloudinary image during removeAvatar:",
          err.message || err
        );
      }
    }

    // Reset avatar - leave UI to fallback by using empty string or ui-avatars URL
    user.avatar = ""; // frontend will fallback to ui-avatars using the user's name
    user.cloudinaryId = "";
    await user.save();

    res.json({
      message: "Avatar removed",
      avatarUrl: user.avatar,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    console.error("removeAvatar error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
