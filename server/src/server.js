import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { PORT } from "./config/env.js";
import setupChatSocket from "./socket/chatSocket.js";
import { setupGroupSocket } from "./socket/group.socket.js";

async function start() {
  try {
    await connectDB();

    const server = http.createServer(app);
    const FRONTEND_URL = process.env.FRONTEND_URL || "*";
    const io = new Server(server, {
      cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
    });

    // Setup sockets **after io is created**
    setupChatSocket(io);
    setupGroupSocket(io);

    // Make io accessible throughout the app if needed
    app.set("io", io);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
