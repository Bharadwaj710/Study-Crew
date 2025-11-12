import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    type: {
      type: String,
      enum: [
        "join_request", // requester → creator
        "invite",        // creator → invitee
        "join_response", 
        "removed_member",
         "group_activity",// creator → requester (new)
      ],
      required: true,
    },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "pending",   // waiting for user action
        "accepted",  // accepted by user
        "declined",  // declined by user
        "unread",    // informational (new)
        "read",      // informational, viewed (new)
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
