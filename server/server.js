 import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/database.js';

// Import routes
import languagesRouter from './routes/languages.js';
import coursesRouter from './routes/courses.js';
import unitsRouter from './routes/units.js';
import lessonsRouter from './routes/lessons.js';
import authRouter from './routes/auth.js';
import vocabularyRouter from './routes/vocabulary.js';
import grammarRouter from './routes/grammar.js';
import phrasesRouter from './routes/phrases.js';
import exercisesRouter from './routes/exercises.js';

// Initialize dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'https://languagelearningcustfro.onrender.com/', // Render subdomain
    'https://wmicsports.com',                      // Your new custom domain
    'http://localhost:5173',                       // Vite default
    'http://localhost:3000',                       // Localhost
    'http://localhost:8080'                        // Vite dev server port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/languages', languagesRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/units', unitsRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/auth', authRouter);
app.use('/api/vocabulary', vocabularyRouter);
app.use('/api/grammar', grammarRouter);
app.use('/api/phrases', phrasesRouter);
app.use('/api/exercises', exercisesRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Language Learning API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Language Learning API - XAMPP Ready!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      languages: '/api/languages',
      courses: '/api/courses',
      units: '/api/units',
      lessons: '/api/lessons',
      vocabulary: '/api/vocabulary',
      grammar: '/api/grammar',
      phrases: '/api/phrases',
      exercises: '/api/exercises'
    },
    documentation: 'Connect your React app to this API',
    database: 'XAMPP MariaDB'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log(`🚀 Language Learning API Server`);
  console.log(`🚀 Running on: http://localhost:${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Database: XAMPP MariaDB`);
  console.log('🚀 ================================');
  console.log('📡 API Endpoints:');
  console.log(`   GET  /health`);
  console.log(`   POST /api/auth/signup`);
  console.log(`   POST /api/auth/signin`);
  console.log(`   POST /api/auth/signout`);
  console.log(`   GET  /api/languages`);
  console.log(`   GET  /api/courses`);
  console.log(`   GET  /api/units`);
  console.log(`   GET  /api/lessons`);
  console.log(`   GET  /api/vocabulary`);
  console.log(`   GET  /api/grammar`);
  console.log(`   GET  /api/phrases`);
  console.log(`   GET  /api/exercises`);
  console.log('🚀 ================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

export default app;
