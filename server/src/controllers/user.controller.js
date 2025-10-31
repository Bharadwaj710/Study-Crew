import User from "../models/user.model.js";
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
    const { name, about, education, interests, skills, avatar } = req.body;

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
      _id: { $ne: req.user.id }, // Exclude current user
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
      _id: { $ne: req.user.id },
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
