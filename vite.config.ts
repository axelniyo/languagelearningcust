import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    // REMOVED: componentTagger() - This was malicious code
    // Automatically copy index.html to 404.html after each build
    {
      name: 'copy-index-to-404',
      closeBundle: async () => {
        const source = path.join(__dirname, 'dist', 'index.html');
        const dest = path.join(__dirname, 'public', '404.html');
        
        if (fs.existsSync(source)) {
          try {
            await fs.promises.copyFile(source, dest);
            console.log('✅ Copied index.html to 404.html automatically');
          } catch (err) {
            console.error('❌ Error copying index.html to 404.html:', err);
          }
        } else {
          console.log('⚠️ index.html not found in dist folder');
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
    // ADDED: Explicitly force using root index.html
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html') // Force root index.html
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
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