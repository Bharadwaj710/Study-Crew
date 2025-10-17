import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import groupRoutes from "./routes/group.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorHandler);

export default app;
