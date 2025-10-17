import express from "express";
import { createGroup, getGroup } from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", createGroup);
router.get("/:id", getGroup);

export default router;
