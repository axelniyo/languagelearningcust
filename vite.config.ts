import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/' : '/',
  plugins: [
    react(),
    componentTagger(),
    {
      name: 'copy-redirects',
      closeBundle: async () => {
        const publicDir = path.join(__dirname, 'public');
        const source = path.join(publicDir, '_redirects');
        const dest = path.join(__dirname, 'dist', '_redirects');
        
        if (!fs.existsSync(publicDir)) {
          await fs.promises.mkdir(publicDir, { recursive: true });
        }
        
        if (!fs.existsSync(source)) {
          await fs.promises.writeFile(source, '/* /index.html 200');
        }
        
        await fs.promises.copyFile(source, dest);
      }
    }
  ],
  server: {
    port: 3000,
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
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './src')
    }
  }
}));
