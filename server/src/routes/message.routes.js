import express from "express";
import * as messageController from "../controllers/message.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get("/:groupId/messages", messageController.getMessages);

router.post("/:groupId/messages", (req, res) => {
  const io = req.app.get("io");
  messageController.createMessage(req, res, io);
});

export default router;
