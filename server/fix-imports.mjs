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
    
    // Fix import statement
    content = content.replace(
      /import\s+{\s*promisePool\s*}\s+from\s+['"]\.\.\/config\/database['"]/g,
      'import pool from "../config/database.js"'
    );
    
    // Fix any remaining promisePool.query to pool.query
    content = content.replace(
      /promisePool\.query\(/g,
      'pool.query('
    );
    
    // Fix any remaining promisePool.execute to pool.query
    content = content.replace(
      /promisePool\.execute\(/g,
      'pool.query('
    );
    
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
    return true;
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting to fix all route files...');
  
  // Get all route files
  const routeFiles = (await fs.readdir(routesDir))
    .filter(file => file.endsWith('.js'));
  
  let fixedCount = 0;
  
  for (const file of routeFiles) {
    const filePath = path.join(routesDir, file);
    const content = await fs.readFile(filePath, 'utf8');
    
    // Only process files that contain promisePool
    if (content.includes('promisePool')) {
      const success = await fixFile(file);
      if (success) fixedCount++;
    }
  }
  
  console.log(`\n✨ Fixed ${fixedCount} route files!`);
  console.log('\nNext steps:');
  console.log('1. Run: npm start');
  console.log('2. If you see any errors, please share them');
}

main().catch(console.error);
