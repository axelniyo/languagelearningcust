import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/',
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
        
        const redirectsContent = '/* /index.html 200';
        await fs.promises.writeFile(source, redirectsContent);
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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.VITE_API_BASE_URL': JSON.stringify('https://languagelearningcustbac.onrender.com')
  }
});
