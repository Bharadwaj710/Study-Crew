import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Group", GroupSchema);
