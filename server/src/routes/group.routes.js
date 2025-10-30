import express from "express";
import {
  createGroup,
  getGroups,
  getGroupById,
  joinGroup,
} from "../controllers/group.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createGroup);
router.get("/", protect, getGroups);
router.get("/:id", protect, getGroupById);
router.post("/:id/join", protect, joinGroup);

export default router;
