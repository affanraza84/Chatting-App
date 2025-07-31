import express from 'express'
import authRoutes from './routes/auth.route.js'
import dotenv from 'dotenv'
import connectDB from './lib/db.js'
import cookieParser from 'cookie-parser'
import messageRoutes from './routes/message.route.js'
import cors from 'cors'
import { app, server } from './lib/socket.js'

dotenv.config();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173', // ✅ Vite dev server
  'http://localhost:3000', // if using React's dev server
  'http://127.0.0.1:5173', // sometimes browsers use 127.0.0.1
  process.env.FRONTEND_URL,
  /^https:\/\/chatting-app-h118-.*\.vercel\.app$/,
  /^https:\/\/.*\.onrender\.com$/,
  /^https:\/\/.*\.netlify\.app$/
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') return origin === allowedOrigin;
      if (allowedOrigin instanceof RegExp) return allowedOrigin.test(origin);
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`[SERVER] ⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-auth-token'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Log every request
app.use((req, res, next) => {
  console.log(`[SERVER] 📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    error: 'NOT_FOUND'
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error(`[SERVER] ❌ Global error handler:`, error.message);
  console.error(`[SERVER] Stack trace:`, error.stack);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: 'VALIDATION_ERROR'
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: 'INVALID_ID'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: 'INTERNAL_ERROR'
  });
});

// Final catch-all route for non-API paths (only for dev)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res) => {
    console.log(`[SERVER] ⚠️ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      success: false,
      message: 'Route not found',
      error: 'NOT_FOUND'
    });
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`[SERVER] 🚀 Server started on port ${PORT}`);
  console.log(`[SERVER] 🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[SERVER] 🔗 Health check: http://localhost:${PORT}/health`);
});
