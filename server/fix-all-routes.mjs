import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesDir = path.join(__dirname, 'routes');

async function updateRouteFile(file) {
  try {
    const filePath = path.join(routesDir, file);
    console.log(`Updating ${filePath}...`);
    
    let content = await fs.readFile(filePath, 'utf8');
    
    // Fix imports
    content = content.replace(
      /import\s+{\s*promisePool\s*}\s+from\s+['"]\.\.\/config\/database['"]/g,
      'import pool from "../config/database.js"'
    );
    
    // Fix query patterns
    content = content.replace(
      /const\s*\[\s*(\w+)\s*\]\s*=\s*await\s+promisePool\.execute\(/g,
      'const [$1] = await pool.query('
    );
    
    // Fix single line queries
    content = content.replace(
      /await\s+promisePool\.execute\(/g,
      'await pool.query('
    );
    
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✅ Updated ${file}`);
  } catch (error) {
    console.error(`❌ Error updating ${file}:`, error.message);
  }
}

async function updateAllRoutes() {
  try {
    const files = await fs.readdir(routesDir);
    const routeFiles = files.filter(file => file.endsWith('.js'));
    
    console.log('🚀 Updating all route files...');
    for (const file of routeFiles) {
      await updateRouteFile(file);
    }
    console.log('✨ All route files updated successfully!');
  } catch (error) {
    console.error('Error updating route files:', error);
  }
}

updateAllRoutes();
