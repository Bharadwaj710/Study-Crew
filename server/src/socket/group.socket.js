export function setupGroupSocket(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join group room
    socket.on("joinGroup", (groupId) => {
      socket.join(`group:${groupId}`);
      console.log(`Socket ${socket.id} joined group:${groupId}`);
    });

    // Leave group room
    socket.on("leaveGroup", (groupId) => {
      socket.leave(`group:${groupId}`);
      console.log(`Socket ${socket.id} left group:${groupId}`);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
