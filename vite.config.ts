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
    // Enhanced plugin to handle _redirects file
    {
      name: 'copy-redirects',
      closeBundle: async () => {
        const publicDir = path.join(__dirname, 'public');
        const source = path.join(publicDir, '_redirects');
        const dest = path.join(__dirname, 'dist', '_redirects');
        
        // Ensure public directory exists
        if (!fs.existsSync(publicDir)) {
          await fs.promises.mkdir(publicDir, { recursive: true });
        }
        
        // Create _redirects file if it doesn't exist
        if (!fs.existsSync(source)) {
          try {
            await fs.promises.writeFile(source, '/* /index.html 200');
            console.log('Created _redirects file in public directory');
          } catch (err) {
            console.error('Error creating _redirects file:', err);
            return;
          }
        }
        
        // Copy to dist
        try {
          await fs.promises.copyFile(source, dest);
          console.log('Copied _redirects file to dist directory');
        } catch (err) {
          console.error('Error copying _redirects file:', err);
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
