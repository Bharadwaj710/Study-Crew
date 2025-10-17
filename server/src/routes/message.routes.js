import express from "express";
import { postMessage, getMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.post("/", postMessage);
router.get("/group/:groupId", getMessages);

export default router;
