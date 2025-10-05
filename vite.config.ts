import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    componentTagger(),
    // REMOVED the custom copy-redirects plugin - Vite handles this automatically
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
