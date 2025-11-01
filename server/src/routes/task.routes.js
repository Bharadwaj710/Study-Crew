import express from "express";
import * as taskController from "../controllers/task.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router.post("/:groupId/tasks", (req, res) => {
  const io = req.app.get("io");
  taskController.createTask(req, res, io);
});

router.get("/:groupId/tasks", taskController.getTasks);
router.get("/:groupId/tasks/:taskId", taskController.getTask);

router.put("/:groupId/tasks/:taskId/progress", (req, res) => {
  const io = req.app.get("io");
  taskController.updateProgress(req, res, io);
});

router.put("/:groupId/tasks/:taskId", (req, res) => {
  const io = req.app.get("io");
  taskController.updateTask(req, res, io);
});

router.delete("/:groupId/tasks/:taskId", (req, res) => {
  const io = req.app.get("io");
  taskController.deleteTask(req, res, io);
});

export default router;
