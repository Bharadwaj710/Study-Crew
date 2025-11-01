import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assigned: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        progressValue: {
          type: Number,
          default: 0,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    type: {
      type: String,
      enum: ["binary", "measurable"],
      default: "binary",
    },
    unit: {
      type: String,
      default: "",
    },
    targetValue: {
      type: Number,
      default: 1,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["open", "completed", "archived"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
