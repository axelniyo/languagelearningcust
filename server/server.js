import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== DIST PATH DETECTION ====================

const getDistPath = () => {
  const possiblePaths = [
    path.join(process.cwd(), 'dist'),           // Render location
    path.join(process.cwd(), '../dist'),        // Alternative
    path.join(__dirname, '../../dist'),         // Another alternative
    '/opt/render/project/src/dist',             // Render specific
  ];
  
  for (const distPath of possiblePaths) {
    try {
      if (fs.existsSync(path.join(distPath, 'index.html'))) {
        console.log(`✅ Found dist at: ${distPath}`);
        return distPath;
      }
    } catch (error) {
      continue;
    }
  }
  
  console.log('❌ No dist folder found, using fallback');
  return path.join(process.cwd(), 'dist');
};

const DIST_PATH = getDistPath();

// ==================== PRERENDER MIDDLEWARE ====================

const servePrerenderedHTML = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebot|facebookexternalhit|twitterbot|linkedinbot|google-structured-data-testing-tool/i.test(userAgent.toLowerCase());
  
  console.log(`🔍 Prerender Check: ${req.path}, User-Agent: ${userAgent?.substring(0, 50)}, IsBot: ${isBot}`);
  
  const prerenderedRoutes = [
    '/', 
    '/learn/german', '/learn/german/',
    '/learn/japanese', '/learn/japanese/', 
    '/learn/spanish', '/learn/spanish/',
    '/learn/french', '/learn/french/', 
    '/learn/italian', '/learn/italian/',
    '/german-lesson/1', '/german-lesson/1/',
    '/german-lesson/2', '/german-lesson/2/',
    '/japanese-lesson/1', '/japanese-lesson/1/',
    '/japanese-lesson/2049', '/japanese-lesson/2049/', 
    '/spanish-lesson/1', '/spanish-lesson/1/',
    '/spanish-lesson/2', '/spanish-lesson/2/'
  ];
  
  const shouldServePrerendered = prerenderedRoutes.includes(req.path) || isBot;
  
  if (shouldServePrerendered) {
    let prerenderedPath;
    
    if (req.path === '/' || req.path === '') {
      prerenderedPath = path.join(DIST_PATH, 'index.html');
    } else {
      // Remove trailing slash for consistency
      const cleanPath = req.path.endsWith('/') ? req.path.slice(0, -1) : req.path;
      prerenderedPath = path.join(DIST_PATH, cleanPath, 'index.html');
    }
    
    console.log(`📁 Looking for prerendered file: ${prerenderedPath}`);
    console.log(`📁 File exists: ${fs.existsSync(prerenderedPath)}`);
    
    if (fs.existsSync(prerenderedPath)) {
      console.log(`🤖 SERVING PRERENDERED HTML to ${isBot ? 'BOT' : 'user'} for: ${req.path}`);
      return res.sendFile(prerenderedPath);
    } else {
      console.log(`❌ Prerendered file NOT FOUND: ${prerenderedPath}`);
    }
  } else {
    console.log(`➡️  Skipping prerender for: ${req.path}`);
  }
  
  next();
};

// Enhanced CORS middleware
app.use(cors({
  origin: [
    'https://languagementor.site',
    'https://www.languagementor.site',
    'https://languagelearningcustfro.onrender.com',
    'https://languagelearningcustbac.onrender.com',
    'https://wmicsports.com',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'No Origin'}`);
  next();
});

// ==================== DEBUG ENDPOINTS ====================

// Debug endpoint to check file structure
app.get('/debug-paths', (req, res) => {
  const checkPath = (pathToCheck, name) => {
    try {
      const exists = fs.existsSync(pathToCheck);
      return {
        name,
        path: pathToCheck,
        exists,
        files: exists ? fs.readdirSync(pathToCheck).slice(0, 10) : ['NOT FOUND'],
        hasIndex: exists && fs.existsSync(path.join(pathToCheck, 'index.html'))
      };
    } catch (error) {
      return { name, path: pathToCheck, exists: false, error: error.message };
    }
  };

  const results = [
    checkPath(DIST_PATH, 'DIST_PATH'),
    checkPath(process.cwd(), 'process.cwd()'),
    checkPath(path.join(DIST_PATH, 'japanese-lesson'), 'japanese-lesson folder'),
    checkPath(path.join(DIST_PATH, 'japanese-lesson/2049'), 'japanese-lesson/2049 folder'),
    checkPath(path.join(DIST_PATH, 'japanese-lesson/2049/index.html'), 'japanese-lesson/2049/index.html')
  ];

  res.json({
    status: 'DEBUG - File Path Analysis',
    currentDirectory: process.cwd(),
    distPath: DIST_PATH,
    paths: results
  });
});

// Test prerender endpoint
app.get('/test-prerender/:route*?', (req, res) => {
  const testRoute = req.params.route ? `/${req.params.route}` : '/japanese-lesson/2049';
  const prerenderedPath = path.join(DIST_PATH, testRoute, 'index.html');
  
  const response = {
    route: testRoute,
    prerenderedPath: prerenderedPath,
    exists: fs.existsSync(prerenderedPath),
    distPath: DIST_PATH,
    currentDir: process.cwd(),
    filesInDist: fs.existsSync(DIST_PATH) ? fs.readdirSync(DIST_PATH) : [],
    testUrl: `https://languagementor.site${testRoute}`
  };

  // If the file exists, serve it to test
  if (fs.existsSync(prerenderedPath)) {
    console.log(`✅ Test: Serving prerendered file for ${testRoute}`);
    return res.sendFile(prerenderedPath);
  } else {
    console.log(`❌ Test: Prerendered file not found for ${testRoute}`);
    res.json(response);
  }
});

// ==================== BUILD CHECK ====================

// Check if React build exists
const checkBuild = () => {
  const indexPath = path.join(DIST_PATH, 'index.html');
  const buildExists = fs.existsSync(indexPath);
  
  console.log('🏗️  Build Check:');
  console.log('   - Dist Path:', DIST_PATH);
  console.log('   - Build Exists:', buildExists);
  
  if (buildExists) {
    const files = fs.readdirSync(DIST_PATH);
    console.log('   - Files in dist:', files);
    
    // Check if prerendered files exist
    const prerenderedRoutes = [
      '/learn/german', '/learn/japanese', '/learn/spanish',
      '/german-lesson/1', '/japanese-lesson/2049'
    ];
    
    prerenderedRoutes.forEach(route => {
      const prerenderedPath = path.join(DIST_PATH, route, 'index.html');
      const exists = fs.existsSync(prerenderedPath);
      console.log(`   - ${route}: ${exists ? '✅' : '❌'}`);
    });
  } else {
    console.log('   ❌ WARNING: No React build found!');
    console.log('   Current directory files:', fs.readdirSync(process.cwd()));
  }
  
  return buildExists;
};

// ==================== STATIC FILE SERVING ====================

// Serve static files if build exists
if (fs.existsSync(DIST_PATH)) {
  console.log('✅ Serving static files from:', DIST_PATH);
  app.use(express.static(DIST_PATH, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));
} else {
  console.log('❌ No dist folder found at:', DIST_PATH);
}

// ==================== PRERENDER MIDDLEWARE ====================
// IMPORTANT: This must come AFTER static files but BEFORE API routes
app.use(servePrerenderedHTML);

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
    environment: process.env.NODE_ENV || 'development',
    hasReactBuild: fs.existsSync(path.join(DIST_PATH, 'index.html')),
    distPath: DIST_PATH
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: '🚀 Language Learning API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      languages: '/api/languages',
      courses: '/api/courses',
      auth: '/api/auth',
      debug: {
        paths: '/debug-paths',
        prerender: '/test-prerender'
      }
    }
  });
});

// ==================== SPA FALLBACK ====================

app.get('*', (req, res) => {
  const indexPath = path.join(DIST_PATH, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('🎯 Serving React SPA for route:', req.path);
    res.sendFile(indexPath);
  } else {
    // If no React build, provide clear instructions
    res.status(500).json({
      error: 'React frontend not built',
      message: 'The React application has not been built. Please check your build process.',
      instructions: [
        '1. Run: npm run build',
        '2. Ensure dist folder is deployed',
        '3. Check build commands in package.json'
      ],
      currentDirectory: process.cwd(),
      files: fs.readdirSync(process.cwd()),
      distPath: DIST_PATH
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Backend URL: https://languagelearningcustbac.onrender.com`);
  console.log(`🚀 Frontend Domain: https://languagementor.site`);
  console.log(`🚀 SEO Prerendering: ENABLED`);
  console.log(`🚀 Dist Path: ${DIST_PATH}`);
  checkBuild();
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