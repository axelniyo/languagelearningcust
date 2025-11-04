import { renderToString } from 'react-dom/server';
import React from 'react';
import fs from 'fs/promises';
import path from 'path';

async function testSSR() {
  try {
    console.log('Testing SSR setup...');
    
    // Test React SSR
    const testElement = React.createElement('div', null, 'SSR Test Successful!');
    const result = renderToString(testElement);
    
    console.log('✅ React SSR test passed!');
    console.log('Rendered output:', result);
    
    // Test file system access
    const testFilePath = path.join(process.cwd(), 'client', 'public', 'index.html');
    const fileExists = await fs.access(testFilePath).then(() => true).catch(() => false);
    
    if (fileExists) {
      console.log('✅ Found index.html at:', testFilePath);
    } else {
      console.warn('⚠️  Could not find index.html at:', testFilePath);
    }
    
    console.log('\n🎉 SSR setup looks good! To proceed:');
    console.log('1. Build the React app: cd client && npm run build');
    console.log('2. Start the SSR server: cd .. && node server/ssr.js');
    console.log('3. Open http://localhost:5000 in your browser');
    
  } catch (error) {
    console.error('❌ SSR test failed:', error);
    process.exit(1);
  }
}

testSSR();
