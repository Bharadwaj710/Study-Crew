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
// Task routes - nested under groups
router.get("/:groupId/tasks", protect, taskController.getTasks);
// Get a single task
router.get("/:groupId/tasks/:taskId", protect, taskController.getTask);
router.post("/:groupId/tasks", protect, (req, res) => {
  const io = req.app.get("io");
  taskController.createTask(req, res, io);
});
router.put("/:groupId/tasks/:taskId", protect, (req, res) => {
  const io = req.app.get("io");
  taskController.updateTask(req, res, io);
});
// Update progress for a task (member updates their own progress)
router.put("/:groupId/tasks/:taskId/progress", protect, (req, res) => {
  const io = req.app.get("io");
  taskController.updateProgress(req, res, io);
});
// Mark task as completed
router.put("/:groupId/tasks/:taskId/complete", protect, (req, res) => {
  const io = req.app.get("io");
  taskController.completeTask(req, res, io);
});
router.delete("/:groupId/tasks/:taskId", protect, (req, res) => {
  const io = req.app.get("io");
  taskController.deleteTask(req, res, io);
});

export default router;
