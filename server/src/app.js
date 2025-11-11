import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import groupRoutes from "./routes/group.routes.js";
import userRoutes from "./routes/user.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import taskRoutes from "./routes/task.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/users", userRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/messages", messageRoutes);
//app.use("/api/groups", taskRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

export { app };
