import { Server } from "socket.io";
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

// Production configuration
const allowedOrigins = [
  // Development
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  
  // Production URLs (replace with your actual URLs)
  'https://chatting-app-h118.vercel.app/login',       // Your Vercel frontend
  'https://chatty-backend-hap2.onrender.com',      // Your Render backend (for API calls)
  
  // Pattern matching for preview deployments
  /^https:\/\/.*\.vercel\.app$/,           // All Vercel previews
  /^https:\/\/.*\.onrender\.com$/,         // All Render services
  /^https:\/\/.*-yourusername\.vercel\.app$/ // Specific preview URLs
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  },
  // Add these for production stability
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on('connection', (socket) => {
  console.log(`[SOCKET] 🔌 User Connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`[SOCKET] ✅ User ${userId} connected (Socket: ${socket.id})`);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    if (userId && userId !== "undefined") {
      delete userSocketMap[userId];
      console.log(`[SOCKET] 🚪 User ${userId} disconnected`);
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  socket.on('error', (error) => {
    console.error(`[SOCKET] ❌ Error (${socket.id}):`, error);
  });
});

export { io, app, server };