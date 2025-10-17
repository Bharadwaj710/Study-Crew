import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    notes: String,
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Progress", ProgressSchema);
