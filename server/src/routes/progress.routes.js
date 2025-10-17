import express from "express";
import {
  addProgress,
  getProgress,
} from "../controllers/progress.controller.js";

const router = express.Router();

router.post("/", addProgress);
router.get("/:userId", getProgress);

export default router;
