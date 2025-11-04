import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Prerender proxy middleware
app.use(async (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot/i.test(userAgent.toLowerCase());
  
  console.log(`🌐 Frontend - Request: ${req.path}, Bot: ${isBot}`);
  
  if (isBot && !req.path.startsWith('/api/')) {
    try {
      // Fetch prerendered HTML from backend
      const backendUrl = `https://languagelearningcustbac.onrender.com${req.path}`;
      console.log(`🤖 Fetching prerendered content from: ${backendUrl}`);
      
      const response = await fetch(backendUrl, {
        headers: {
          'User-Agent': userAgent
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        console.log(`✅ Serving prerendered HTML for: ${req.path}`);
        return res.send(html);
      }
    } catch (error) {
      console.error('❌ Prerender fetch failed:', error.message);
    }
  }
  
  next(); // Normal users get React app
});

// Serve static files (your React build)
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 FRONTEND server running on port ${PORT}`);
  console.log(`🤖 Prerender proxy: ENABLED`);
  console.log(`🌐 Domain: https://languagementor.site`);
});