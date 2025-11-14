import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "pdf", "system"],
      default: "text",
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileDownloadUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null,
    },
    fileMime: {
      type: String,
      default: null,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    // Optional client-side temp id to support optimistic UI and deduplication
    clientTempId: {
      type: String,
      default: null,
      index: true,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for efficient pagination and queries
messageSchema.index({ groupId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
