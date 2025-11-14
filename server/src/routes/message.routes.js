import express from "express";
import * as messageController from "../controllers/message.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

// Get messages for a group with pagination
router.get("/groups/:groupId/messages", messageController.getMessages);

// Create message (REST fallback)
router.post("/groups/:groupId/messages", messageController.createMessage);

// Edit message
router.put("/messages/:messageId", messageController.editMessage);

// Delete message
router.delete("/messages/:messageId", messageController.deleteMessage);

export default router;
