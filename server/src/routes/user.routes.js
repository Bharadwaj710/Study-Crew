import express from "express";
const router = express.Router();
import * as userController from "../controllers/user.controller.js";
import { protect as authMiddleware } from "../middleware/authMiddleware.js";



// All routes require authentication
router.use(authMiddleware);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.get("/search", userController.searchUsers);
router.get("/recommend", userController.recommendMembers);

export default router;
