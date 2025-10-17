import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { PORT } from "./config/env.js";
import setupChatSocket from "./socket/chatSocket.js";

async function start() {
  await connectDB();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });
  setupChatSocket(io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
