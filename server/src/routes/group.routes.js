import express from "express";
import {
  createGroup,
  getGroups,
  getGroupById,
  joinGroup,
} from "../controllers/group.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import * as taskController from "../controllers/task.controller.js";

const router = express.Router();

router.post("/", protect, createGroup);
router.get("/", protect, getGroups);
router.get("/:id", protect, getGroupById);
router.post("/:id/join", protect, joinGroup);

// Task routes - nested under groups
router.get("/:groupId/tasks", protect, taskController.getTasks);
router.post("/:groupId/tasks", protect, taskController.createTask);
router.put("/:groupId/tasks/:taskId", protect, taskController.updateTask);
router.delete("/:groupId/tasks/:taskId", protect, taskController.deleteTask);

export default router;
