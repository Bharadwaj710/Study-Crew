// Placeholder socket.io chat handlers
export default function setupChatSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`${socket.id} joined ${room}`);
    });

    socket.on("chatMessage", (msg) => {
      console.log("chatMessage", msg);
      io.to(msg.room).emit("chatMessage", msg);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected", socket.id);
    });
  });
}
