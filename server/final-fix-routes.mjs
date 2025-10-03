import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesDir = path.join(__dirname, 'routes');

async function fixFile(file) {
  const filePath = path.join(routesDir, file);
  console.log(`🔧 Fixing ${file}...`);
  
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    // Fix imports
    content = content.replace(
      /import\s+{\s*promisePool\s*}\s+from\s+['"]\.\.\/config\/database['"]/g,
      'import pool from "../config/database.js"'
    );
    
    // Fix any remaining promisePool.execute to pool.query
    content = content.replace(
      /(const\s*\[\s*\w*\s*\]\s*=\s*)?await\s+promisePool\.execute\(/g,
      (match, group1) => group1 ? group1 + 'await pool.query(' : 'await pool.query('
    );
    
    // Fix any direct promisePool.query to pool.query
    content = content.replace(
      /await\s+promisePool\.query\(/g,
      'await pool.query('
    );
    
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
}

async function fixAllRoutes() {
  try {
    console.log('🚀 Starting to fix all route files...');
    
    // Get all route files
    const files = await fs.readdir(routesDir);
    const routeFiles = files.filter(file => file.endsWith('.js'));
    
    // Process each file
    for (const file of routeFiles) {
      await fixFile(file);
    }
    
    console.log('✨ All route files have been fixed!');
    console.log('\nNext steps:');
    console.log('1. Run: npm start');
    console.log('2. If you see any errors, please share them');
    
  } catch (error) {
    console.error('❌ Error fixing routes:', error);
  }
}

// Run the fixer
fixAllRoutes();
