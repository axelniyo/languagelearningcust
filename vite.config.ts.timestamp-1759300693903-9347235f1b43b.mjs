// vite.config.ts
import { defineConfig } from "file:///C:/webs/Language%20custom/node_modules/vite/dist/node/index.js";
import react from "file:///C:/webs/Language%20custom/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/webs/Language%20custom/node_modules/lovable-tagger/dist/index.js";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import fs from "fs";
var __vite_injected_original_import_meta_url = "file:///C:/webs/Language%20custom/vite.config.ts";
var require2 = createRequire(__vite_injected_original_import_meta_url);
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var vite_config_default = defineConfig({
  base: "/",
  plugins: [
    react(),
    componentTagger(),
    // Plugin to copy _redirects file to dist
    {
      name: "copy-redirects",
      closeBundle: async () => {
        const source = path.join(__dirname, "public", "_redirects");
        const dest = path.join(__dirname, "dist", "_redirects");
        if (fs.existsSync(source)) {
          try {
            await fs.promises.copyFile(source, dest);
            console.log("Copied _redirects file to dist directory");
          } catch (err) {
            console.error("Error copying _redirects file:", err);
          }
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
      "/api": {
        target: "https://languagelearningcustbac.onrender.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path2) => path2.replace(/^\/api/, "/api")
      }
    },
    fs: {
      strict: false
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          mui: ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
          vendor: ["axios", "date-fns"]
        }
      }
    }
  },
  publicDir: "public",
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFx3ZWJzXFxcXExhbmd1YWdlIGN1c3RvbVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcd2Vic1xcXFxMYW5ndWFnZSBjdXN0b21cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L3dlYnMvTGFuZ3VhZ2UlMjBjdXN0b20vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tICdsb3ZhYmxlLXRhZ2dlcic7XG5pbXBvcnQgeyBjcmVhdGVSZXF1aXJlIH0gZnJvbSAnbW9kdWxlJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuY29uc3QgcmVxdWlyZSA9IGNyZWF0ZVJlcXVpcmUoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYmFzZTogJy8nLFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcbiAgICAvLyBQbHVnaW4gdG8gY29weSBfcmVkaXJlY3RzIGZpbGUgdG8gZGlzdFxuICAgIHtcbiAgICAgIG5hbWU6ICdjb3B5LXJlZGlyZWN0cycsXG4gICAgICBjbG9zZUJ1bmRsZTogYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAncHVibGljJywgJ19yZWRpcmVjdHMnKTtcbiAgICAgICAgY29uc3QgZGVzdCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdkaXN0JywgJ19yZWRpcmVjdHMnKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHNvdXJjZSkpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgZnMucHJvbWlzZXMuY29weUZpbGUoc291cmNlLCBkZXN0KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb3BpZWQgX3JlZGlyZWN0cyBmaWxlIHRvIGRpc3QgZGlyZWN0b3J5Jyk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjb3B5aW5nIF9yZWRpcmVjdHMgZmlsZTonLCBlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgXSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogODA4MCxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIGhvc3Q6IHRydWUsXG4gICAgb3BlbjogdHJ1ZSxcbiAgICBjb3JzOiB0cnVlLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAxJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJy9hcGknKVxuICAgICAgfVxuICAgIH0sXG4gICAgZnM6IHtcbiAgICAgIHN0cmljdDogZmFsc2VcbiAgICB9XG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIGFzc2V0c0RpcjogJ2Fzc2V0cycsXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIHJlYWN0OiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgbXVpOiBbJ0BtdWkvbWF0ZXJpYWwnLCAnQG11aS9pY29ucy1tYXRlcmlhbCcsICdAZW1vdGlvbi9yZWFjdCcsICdAZW1vdGlvbi9zdHlsZWQnXSxcbiAgICAgICAgICB2ZW5kb3I6IFsnYXhpb3MnLCAnZGF0ZS1mbnMnXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcHVibGljRGlyOiAncHVibGljJyxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStQLFNBQVMsb0JBQW9CO0FBQzVSLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFDaEMsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxRQUFRO0FBTjRJLElBQU0sMkNBQTJDO0FBUTVNLElBQU1BLFdBQVUsY0FBYyx3Q0FBZTtBQUM3QyxJQUFNLFlBQVksS0FBSyxRQUFRLGNBQWMsd0NBQWUsQ0FBQztBQUc3RCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixnQkFBZ0I7QUFBQTtBQUFBLElBRWhCO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixhQUFhLFlBQVk7QUFDdkIsY0FBTSxTQUFTLEtBQUssS0FBSyxXQUFXLFVBQVUsWUFBWTtBQUMxRCxjQUFNLE9BQU8sS0FBSyxLQUFLLFdBQVcsUUFBUSxZQUFZO0FBRXRELFlBQUksR0FBRyxXQUFXLE1BQU0sR0FBRztBQUN6QixjQUFJO0FBQ0Ysa0JBQU0sR0FBRyxTQUFTLFNBQVMsUUFBUSxJQUFJO0FBQ3ZDLG9CQUFRLElBQUksMENBQTBDO0FBQUEsVUFDeEQsU0FBUyxLQUFLO0FBQ1osb0JBQVEsTUFBTSxrQ0FBa0MsR0FBRztBQUFBLFVBQ3JEO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsU0FBUyxDQUFDQyxVQUFTQSxNQUFLLFFBQVEsVUFBVSxNQUFNO0FBQUEsTUFDbEQ7QUFBQSxJQUNGO0FBQUEsSUFDQSxJQUFJO0FBQUEsTUFDRixRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLFdBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osT0FBTyxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUNoRCxLQUFLLENBQUMsaUJBQWlCLHVCQUF1QixrQkFBa0IsaUJBQWlCO0FBQUEsVUFDakYsUUFBUSxDQUFDLFNBQVMsVUFBVTtBQUFBLFFBQzlCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxXQUFXO0FBQUEsRUFDWCxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLEVBQ3BEO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsicmVxdWlyZSIsICJwYXRoIl0KfQo=
