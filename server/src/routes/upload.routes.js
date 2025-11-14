import express from "express";
import multer from "multer";
import { uploadFile, uploadAvatar } from "../controllers/upload.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Use memory storage so we can stream directly to Cloudinary from buffer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
});

// Protected upload endpoints
router.post("/uploads", protect, upload.single("file"), uploadFile);
router.post("/uploads/avatar", protect, upload.single("file"), uploadAvatar);

export default router;
