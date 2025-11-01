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
router.post("/:groupId/tasks", protect, (req, res) => {
  const io = req.app.get("io");
  taskController.createTask(req, res, io);
});
router.put("/:groupId/tasks/:taskId", protect, (req, res) => {
  const io = req.app.get("io");
  taskController.updateTask(req, res, io);
});
router.delete("/:groupId/tasks/:taskId", protect, (req, res) => {
  const io = req.app.get("io");
  taskController.deleteTask(req, res, io);
});

export default router;
