import { Server } from "socket.io";

let ioInstance: Server | null = null;

export function initSocketIO(server: any) {
  ioInstance = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  ioInstance.on("connection", (socket) => {
    console.log(`[Socket.IO] Shard client connected: ${socket.id}`);
    
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`[Socket.IO] User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Shard client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

export function getIO(): Server {
  if (!ioInstance) {
    throw new Error("Socket.io server has not been initialized yet.");
  }
  return ioInstance;
}

export function emitUserEvent(userId: string, event: string, data?: any) {
  if (ioInstance) {
    ioInstance.to(userId).emit(event, data);
  }
}
