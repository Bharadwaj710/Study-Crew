import express from "express";
import { getPublicProfile } from "../controllers/userPublic.controller.js";

const router = express.Router();

// Public route to get a user's public profile summary
router.get("/:id", getPublicProfile);

export default router;
