// build-prerender.js
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = [
  // REMOVED: '/' - don't overwrite the main index.html built by Vite
  '/learn/japanese',
  '/japanese-lesson/2049',
  '/learn/german', 
  '/german-lesson/1',
  '/learn/spanish',
  '/spanish-lesson/1'
];

async function prerender() {
  console.log('🚀 Starting build-time prerendering...');
  
  for (const route of routes) {
    try {
      console.log(`📄 Prerendering: ${route}`);
      
      const response = await fetch(`https://languagelearningcustbac.onrender.com${route}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      
      // Create directory structure for route-specific pages
      const filePath = path.join(__dirname, 'dist', route, 'index.html');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      
      fs.writeFileSync(filePath, html);
      console.log(`✅ Generated: ${filePath}`);
      
    } catch (error) {
      console.error(`❌ Failed to prerender ${route}:`, error.message);
    }
  }
  
  console.log('🎉 Build-time prerendering completed!');
}

prerender();