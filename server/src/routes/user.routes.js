import express from "express";
const router = express.Router();
import * as userController from "../controllers/user.controller.js";
import { protect as authMiddleware } from "../middleware/authMiddleware.js";
import multer from "multer";

// store temporary uploads locally before we push to Cloudinary
const upload = multer({ dest: "uploads/avatars/" });

// All routes require authentication
router.use(authMiddleware);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
// Upload avatar (single file under field name 'avatar')
router.put(
  "/profile/avatar",
  upload.single("avatar"),
  userController.uploadAvatar
);
// Remove avatar
router.delete("/profile/avatar", userController.removeAvatar);
// Also accept POST for removal for clients that may prefer it
router.post("/profile/avatar/remove", userController.removeAvatar);
router.get("/search", userController.searchUsers);
router.get("/recommend", userController.recommendMembers);

export default router;
