// import express from 'express'
// import authRoutes from './routes/auth.route.js'
// import dotenv from 'dotenv'
// import connectDB from './lib/db.js'
// import cookieParser from 'cookie-parser'
// import messageRoutes from './routes/message.route.js'
// import cors from 'cors'
// import { app, server } from './lib/socket.js'
// import path from 'path'

// dotenv.config();

// const PORT = process.env.PORT || 4000;
// connectDB();

// const __dirname = path.resolve();

// // CORS configuration
// const corsOptions = {
//   origin: function (origin, callback) {
//     console.log(`[CORS] 🌐 Request from origin: ${origin}`);

//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) {
//       console.log('[CORS] ✅ Allowing request with no origin');
//       return callback(null, true);
//     }

//     const allowedOrigins = [
//       'http://localhost:5173',
//       'http://localhost:5174',
//       'http://localhost:3000',
//       // Add your production frontend URLs here
//       process.env.FRONTEND_URL,
//       // Allow Render preview URLs
//       /^https:\/\/.*\.onrender\.com$/,
//       // Allow Vercel URLs
//       /^https:\/\/.*\.vercel\.app$/,
//       // Allow Netlify URLs
//       /^https:\/\/.*\.netlify\.app$/
//     ].filter(Boolean);

//     const isAllowed = allowedOrigins.some(allowedOrigin => {
//       if (typeof allowedOrigin === 'string') {
//         return origin === allowedOrigin;
//       }
//       if (allowedOrigin instanceof RegExp) {
//         return allowedOrigin.test(origin);
//       }
//       return false;
//     });

//     if (isAllowed) {
//       console.log(`[CORS] ✅ Allowing origin: ${origin}`);
//       callback(null, true);
//     } else {
//       console.log(`[CORS] ⚠️ Origin not in allowed list, but allowing anyway: ${origin}`);
//       // Allow all HTTPS origins for now to avoid CORS issues
//       callback(null, true);
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: [
//     'Content-Type',
//     'Authorization',
//     'Cookie',
//     'Set-Cookie',
//     'Access-Control-Allow-Credentials',
//     'Access-Control-Allow-Origin'
//   ],
//   exposedHeaders: ['Set-Cookie']
// };

// app.use(cors(corsOptions));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));
// app.use(cookieParser());

// // Request logging middleware
// app.use((req, res, next) => {
//   console.log(`[SERVER] 📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
//   next();
// });

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/message', messageRoutes);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     status: 'OK',
//     message: 'Server is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // API 404 handler - must come before static files
// app.use('/api', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'API endpoint not found',
//     error: 'NOT_FOUND'
//   });
// });

// // Production static file serving
// if (process.env.NODE_ENV === 'production') {
//   const frontendDistPath = path.join(__dirname, '../frontend/dist');

//   // Serve static files
//   app.use(express.static(frontendDistPath));

//   // SPA fallback - simple version without catch-all
//   app.get('/', (req, res) => {
//     res.sendFile(path.resolve(frontendDistPath, 'index.html'));
//   });

//   // Handle common SPA routes explicitly
//   const spaRoutes = ['/login', '/signup', '/profile', '/chat'];
//   spaRoutes.forEach(route => {
//     app.get(route, (req, res) => {
//       res.sendFile(path.resolve(frontendDistPath, 'index.html'));
//     });
//   });
// }

// // Global error handler
// app.use((error, req, res, next) => {
//   console.error(`[SERVER] ❌ Global error handler:`, error.message);
//   console.error(`[SERVER] Stack trace:`, error.stack);

//   // Handle specific error types
//   if (error.name === 'ValidationError') {
//     return res.status(400).json({
//       success: false,
//       message: 'Validation error',
//       error: 'VALIDATION_ERROR'
//     });
//   }

//   if (error.name === 'CastError') {
//     return res.status(400).json({
//       success: false,
//       message: 'Invalid ID format',
//       error: 'INVALID_ID'
//     });
//   }

//   // Default error response
//   res.status(500).json({
//     success: false,
//     message: 'Internal server error',
//     error: 'INTERNAL_ERROR'
//   });
// });

// server.listen(PORT, () => {
//   console.log(`[SERVER] 🚀 Server started on port ${PORT}`);
//   console.log(`[SERVER] 🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`[SERVER] 🔗 Health check: http://localhost:${PORT}/health`);
// });
