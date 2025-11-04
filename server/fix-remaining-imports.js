import { promises as fs } from 'fs';
import path from 'path';

const routesDir = path.join(process.cwd(), 'routes');

async function fixFiles() {
  try {
    console.log('🔍 Checking for files with promisePool imports...');
    
    const files = await fs.readdir(routesDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    
    let fixedCount = 0;
    
    for (const file of jsFiles) {
      const filePath = path.join(routesDir, file);
      let content = await fs.readFile(filePath, 'utf8');
      
      if (content.includes('import { promisePool }')) {
        console.log(`🔄 Fixing imports in ${file}...`);
        
        // Replace the import
        content = content.replace(
          /import\s+{\s*promisePool\s*}\s+from\s+['"]\.\.\/config\/database['"]/,
          'import pool from "../config/database.js"'
        );
        
        // Replace all promisePool usages with pool
        content = content.replace(/promisePool/g, 'pool');
        
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`✅ Fixed imports in ${file}`);
        fixedCount++;
      }
    }
    
    if (fixedCount === 0) {
      console.log('✅ No files with promisePool imports found');
    } else {
      console.log(`\n✨ Successfully fixed imports in ${fixedCount} file(s)`);
    }
    
    console.log('\nNext steps:');
    console.log('1. Run: npm start');
    console.log('2. If you see any errors, please share them');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixFiles();
