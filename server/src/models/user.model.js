import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "https://ui-avatars.com/api/?background=random",
    },
    about: {
      type: String,
      default: "",
    },
    // Links to external profiles (LinkedIn, GitHub, etc.)
    links: {
      type: [
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
        },
      ],
      default: [],
    },
    // Contact information (optional fields)
    contact: {
      phone: { type: String, default: "" },
      alternateEmail: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    education: {
      college: {
        type: String,
        default: "",
      },
      degree: {
        type: String,
        default: "",
      },
      year: {
        type: String,
        default: "",
      },
      major: {
        type: String,
        default: "",
      },
    },
    interests: [String],
    skills: [String],
    joinedGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    skills: [
      {
        type: String,
      },
    ],
    joinedGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.checkProfileCompletion = function () {
  return !!(
    this.name &&
    this.about &&
    this.education.college &&
    this.education.degree &&
    this.education.year &&
    this.education.major &&
    this.interests.length > 0 &&
    this.skills.length > 0
  );
};

// Method to check profile completion
userSchema.methods.checkProfileCompletion = function () {
  return !!(
    this.name &&
    this.email &&
    this.about &&
    this.education.college &&
    this.education.degree &&
    this.interests.length > 0 &&
    this.skills.length > 0
  );
};

export default mongoose.model("User", userSchema);
