import User from "../models/user.model.js";
import validator from "validator";
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
