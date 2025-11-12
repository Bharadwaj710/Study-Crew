import express from "express";
import {
  createGroup,
  getGroups,
  getGroupById,
  deleteGroup,
  joinGroup,
  exploreGroups,
  requestToJoinGroup,
  listJoinRequests,
  handleJoinRequest,
  removeMember,
  leaveGroup,
} from "../controllers/group.controller.js";
import { cancelJoinRequest } from '../controllers/group.controller.js';
import { protect } from "../middleware/authMiddleware.js";
import * as taskController from "../controllers/task.controller.js";

const router = express.Router();

// ✅ STATIC ROUTES FIRST
router.get("/explore", protect, exploreGroups); // GET /api/groups/explore
router.post("/:id/join-request", protect, requestToJoinGroup); // POST join request
router.get("/:id/join-requests", protect, listJoinRequests); // GET requests for creator
router.put("/:id/handle-request", protect, handleJoinRequest); // Accept/decline
router.delete("/:id/cancel-join-request", protect, cancelJoinRequest);
// Leave group
router.put("/:id/leave", protect, leaveGroup);

// Remove a member (admin only)
router.put("/:id/remove/:memberId", protect, removeMember);

// ✅ MAIN GROUP ROUTES
router.post("/", protect, createGroup);
router.get("/", protect, getGroups);
router.post("/:id/join", protect, joinGroup);
router.get("/:id", protect, getGroupById);

// Delete group (creator only)
router.delete("/:id", protect, deleteGroup);

// Task routes - nested under groups
// Task routes - nested under groups
router.get("/:groupId/tasks", protect, taskController.getTasks);
router.get("/:groupId/tasks/:taskId", protect, taskController.getTask);
router.post("/:groupId/tasks", protect, (req, res) => {
  const io = req.app.get("io");
  taskController.createTask(req, res, io);
});
router.put("/:groupId/tasks/:taskId", protect, (req, res) => {
  const io = req.app.get("io");
  taskController.updateTask(req, res, io);
});
router.put("/:groupId/tasks/:taskId/progress", protect, (req, res) => {
  const io = req.app.get("io");
  taskController.updateProgress(req, res, io);
});
router.put("/:groupId/tasks/:taskId/complete", protect, (req, res) => {
  const io = req.app.get("io");
  taskController.completeTask(req, res, io);
});
router.delete("/:groupId/tasks/:taskId", protect, (req, res) => {
  const io = req.app.get("io");
  taskController.deleteTask(req, res, io);
});

export default router;
