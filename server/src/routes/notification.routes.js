// routes/notification.routes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getNotifications, respondNotification,deleteNotification } from "../controllers/notification.controller.js";

const router = express.Router();
router.use(protect);
router.get("/", getNotifications);
router.patch("/:id/respond", respondNotification);
router.delete("/:id", protect, deleteNotification);

export default router;
