import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesDir = path.join(__dirname, 'routes');

const filesToFix = [
  'phrases.js',
  'grammar.js',
  'exercises.js'
];

async function fixImport(file) {
  const filePath = path.join(routesDir, file);
  console.log(`🔧 Fixing imports in ${file}...`);
  
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    // Fix imports
    content = content.replace(
      /import\s+{\s*promisePool\s*}\s+from\s+['"]\.\.\/config\/database['"]/g,
      'import pool from "../config/database.js"'
    );
    
    // Fix any remaining promisePool.query to pool.query
    content = content.replace(
      /await\s+promisePool\.query\(/g,
      'await pool.query('
    );
    
    // Fix any remaining promisePool.execute to pool.query
    content = content.replace(
      /(const\s*\[\s*\w*\s*\]\s*=\s*)?await\s+promisePool\.execute\(/g,
      (match, group1) => group1 ? group1 + 'await pool.query(' : 'await pool.query('
    );
    
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✅ Fixed imports in ${file}`);
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Fixing remaining imports...');
  
  for (const file of filesToFix) {
    await fixImport(file);
  }
  
  console.log('✨ All imports have been fixed!');
  console.log('\nNext steps:');
  console.log('1. Run: npm start');
  console.log('2. If you see any errors, please share them');
}

main().catch(console.error);
