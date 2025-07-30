import express from 'express'
import authRoutes from './routes/auth.route.js'
import dotenv from 'dotenv'
import connectDB from './lib/db.js'
import cookieParser from 'cookie-parser'
import messageRoutes from './routes/message.route.js'
import cors from 'cors'
import { app, server } from './lib/socket.js'
import path from 'path'

dotenv.config();

const PORT = process.env.PORT || 4000;
connectDB();

const __dirname = path.resolve();


// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://chatting-app-h118.vercel.app/login',
      'http://localhost:5173',
      // /^https:\/\/.*\.devshashi\.dev$/,
      // Add your production frontend URLs here
      process.env.FRONTEND_URL,
      // Allow Render preview URLs
      /^https:\/\/.*\.onrender\.com$/,
      // Allow Vercel URLs
      /^https:\/\/.*\.vercel\.app$/,
      // Allow Netlify URLs
      /^https:\/\/.*\.netlify\.app$/
    ].filter(Boolean);

    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
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
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};


app.use(cors({
  origin: [
    'https://chatting-app-h118.vercel.app/login',
    'http://localhost:5173' // For testing
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[SERVER] 📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API 404 handler - must come before static files
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    error: 'NOT_FOUND'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(`[SERVER] ❌ Global error handler:`, error.message);
  console.error(`[SERVER] Stack trace:`, error.stack);

  // Handle specific error types
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

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: 'INTERNAL_ERROR'
  });
});

// Final 404 handler - only for development
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

server.listen(PORT, () => {
  console.log(`[SERVER] 🚀 Server started on port ${PORT}`);
  console.log(`[SERVER] 🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[SERVER] 🔗 Health check: http://localhost:${PORT}/health`);
});