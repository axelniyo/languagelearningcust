import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    componentTagger(),
    // Plugin to copy _redirects file to dist
    {
      name: 'copy-redirects',
      closeBundle: async () => {
        const source = path.join(__dirname, 'public', '_redirects');
        const dest = path.join(__dirname, 'dist', '_redirects');
        
        console.log('🔍 Checking for _redirects file...');
        console.log('📁 Source path:', source);
        console.log('📁 Destination path:', dest);
        
        if (fs.existsSync(source)) {
          try {
            console.log('✅ _redirects found in public folder');
            await fs.promises.copyFile(source, dest);
            console.log('✅ Successfully copied _redirects to dist directory');
            
            // Verify the copy worked
            if (fs.existsSync(dest)) {
              const content = await fs.promises.readFile(dest, 'utf8');
              console.log('📄 _redirects content:', content.trim());
              console.log('🎉 _redirects setup completed successfully!');
            } else {
              console.log('❌ _redirects not found in dist after copy operation');
            }
          } catch (err) {
            console.error('❌ Error copying _redirects file:', err);
          }
        } else {
          console.log('❌ _redirects file not found in public folder');
          console.log('💡 Please create public/_redirects with: /* /index.html 200');
        }
      }
    }
  ],
  server: {
    port: 8080,
    strictPort: true,
    host: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://languagelearningcustbac.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
    fs: {
      strict: false
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          vendor: ['axios', 'date-fns'],
        },
      },
    },
  },
  publicDir: 'public',
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
