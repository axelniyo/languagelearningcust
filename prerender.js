import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use your ACTUAL URL structure
const routes = [
  '/',
  '/learn/german',
  '/learn/japanese', 
  '/learn/spanish',
  '/learn/french',
  '/learn/italian',
  // Your actual lesson URLs
  '/german-lesson/1',
  '/german-lesson/2',
  '/japanese-lesson/1', 
  '/japanese-lesson/2049',
  '/spanish-lesson/1',
  '/spanish-lesson/2'
];

async function prerender() {
  console.log('🚀 Starting prerendering for SEO...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const route of routes) {
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      
      const url = `https://languagementor.site${route}`;
      console.log(`📄 Prerendering: ${url}`);
      
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Wait for React app to load - use newer Puppeteer methods
      await page.waitForFunction(() => {
        const root = document.querySelector('#root');
        return root && 
               root.innerHTML && 
               root.innerHTML.length > 500 &&
               !root.innerHTML.includes('Loading...');
      }, { timeout: 20000 });

      // Use setTimeout instead of waitForTimeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      const html = await page.content();
      
      let dir;
      if (route === '/') {
        dir = path.join(process.cwd(), 'dist');
      } else {
        dir = path.join(process.cwd(), 'dist', route);
      }
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const fileName = route === '/' ? 'index.html' : 'index.html';
      const filePath = path.join(dir, fileName);
      
      fs.writeFileSync(filePath, html);
      console.log(`✅ Success: ${route} -> ${filePath}`);
      
      await page.close();
      
    } catch (error) {
      console.error(`❌ Failed to prerender ${route}:`, error.message);
    }
  }

  await browser.close();
  console.log('🎉 Prerendering completed!');
}

prerender().catch(console.error);