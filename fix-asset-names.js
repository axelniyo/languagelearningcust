// fix-asset-names.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixAssetNames() {
  const distDir = path.join(__dirname, 'dist');
  const timestamp = Date.now();
  
  console.log('🔧 Fixing asset names with cache busting...');
  
  // Read all HTML files in dist
  const htmlFiles = [
    'index.html',
    'learn/japanese/index.html',
    'learn/german/index.html', 
    'learn/spanish/index.html',
    'japanese-lesson/2049/index.html',
    'german-lesson/1/index.html',
    'spanish-lesson/1/index.html'
  ];

  let fixedCount = 0;

  htmlFiles.forEach(htmlFile => {
    const filePath = path.join(distDir, htmlFile);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Replace any asset references with consistent names + cache busting
      content = content.replace(/assets\/index-[^"]+\.js/g, 'assets/index.js');
      content = content.replace(/assets\/index-[^"]+\.css/g, 'assets/index.css');
      content = content.replace(/assets\/react-[^"]+\.js/g, 'assets/react.js');
      content = content.replace(/assets\/mui-[^"]+\.js/g, 'assets/mui.js');
      content = content.replace(/assets\/vendor-[^"]+\.js/g, 'assets/vendor.js');
      
      // Add cache busting to all asset references
      content = content.replace(
        /src="\/assets\/([^"]+)"/g, 
        `src="/assets/$1?v=${timestamp}"`
      );
      content = content.replace(
        /href="\/assets\/([^"]+)"/g, 
        `href="/assets/$1?v=${timestamp}"`
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed asset names in: ${htmlFile}`);
        fixedCount++;
      }
    }
  });

  console.log(`🎉 Fixed ${fixedCount} HTML files with cache busting (timestamp: ${timestamp})`);
}

fixAssetNames();