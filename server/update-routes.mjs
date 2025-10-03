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
    
    // Replace requires with imports
    content = content.replace(/const\s+express\s*=\s*require\(['"]express['"]\);/g, 'import express from "express";');
    content = content.replace(/const\s+{\s*(\w+)\s*}\s*=\s*require\(['"]([^'"]+)['"]\);/g, 'import { $1 } from "$2.js";');
    content = content.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);/g, (match, p1, p2) => {
      // Skip if it's already been processed
      if (content.includes(`import ${p1} from "${p2}`)) return match;
      return `import ${p1} from "${p2}.js";`;
    });
    
    // Replace module.exports
    content = content.replace(/module\.exports\s*=\s*router;/, 'export default router;');
    
    // Update database queries to use promisePool
    content = content.replace(/db\.query\(([^)]+)\)/g, 'await promisePool.execute($1)');
    
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✅ Updated ${file}`);
  } catch (error) {
    console.error(`❌ Error updating ${file}:`, error.message);
  }
}

async function updateAllRoutes() {
  try {
    const files = await fs.readdir(routesDir);
    const routeFiles = files.filter(file => file.endsWith('.js') && file !== 'index.js');
    
    console.log('🚀 Updating route files to ES modules...');
    for (const file of routeFiles) {
      await updateRouteFile(file);
    }
    console.log('✨ All route files updated successfully!');
  } catch (error) {
    console.error('Error updating route files:', error);
  }
}

updateAllRoutes();
