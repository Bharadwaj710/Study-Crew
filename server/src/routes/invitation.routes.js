// src/routes/invitation.routes.js
import express from "express";
import {
  getInvitations,
  acceptInvitation,
  declineInvitation,
} from "../controllers/invitaion.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all invitation routes
router.use(protect);

// Routes
router.get("/", getInvitations);
router.patch("/:id/accept", acceptInvitation);
router.patch("/:id/decline", declineInvitation);

export default router;
