// vite.config.ts
import { defineConfig } from "file:///C:/webs/Language%20custom/node_modules/vite/dist/node/index.js";
import react from "file:///C:/webs/Language%20custom/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/webs/Language%20custom/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\webs\\Language custom";
var vite_config_default = defineConfig({
  base: "./",
  plugins: [
    react(),
    componentTagger()
  ],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    open: true,
    cors: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true
      }
    },
    // Vite's way of handling SPA fallback
    fs: {
      strict: false
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
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
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFx3ZWJzXFxcXExhbmd1YWdlIGN1c3RvbVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcd2Vic1xcXFxMYW5ndWFnZSBjdXN0b21cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L3dlYnMvTGFuZ3VhZ2UlMjBjdXN0b20vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tICdsb3ZhYmxlLXRhZ2dlcic7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiAnLi8nLFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcbiAgXSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIGhvc3Q6IHRydWUsXG4gICAgb3BlbjogdHJ1ZSxcbiAgICBjb3JzOiB0cnVlLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICB3czogdHJ1ZVxuICAgICAgfVxuICAgIH0sXG4gICAgLy8gVml0ZSdzIHdheSBvZiBoYW5kbGluZyBTUEEgZmFsbGJhY2tcbiAgICBmczoge1xuICAgICAgc3RyaWN0OiBmYWxzZVxuICAgIH1cbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgYXNzZXRzRGlyOiAnYXNzZXRzJyxcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgcmVhY3Q6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICBtdWk6IFsnQG11aS9tYXRlcmlhbCcsICdAbXVpL2ljb25zLW1hdGVyaWFsJywgJ0BlbW90aW9uL3JlYWN0JywgJ0BlbW90aW9uL3N0eWxlZCddLFxuICAgICAgICAgIHZlbmRvcjogWydheGlvcycsICdkYXRlLWZucyddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1AsU0FBUyxvQkFBb0I7QUFDNVIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixnQkFBZ0I7QUFBQSxFQUNsQjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsSUFBSTtBQUFBLE1BQ047QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLElBQUk7QUFBQSxNQUNGLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osT0FBTyxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUNoRCxLQUFLLENBQUMsaUJBQWlCLHVCQUF1QixrQkFBa0IsaUJBQWlCO0FBQUEsVUFDakYsUUFBUSxDQUFDLFNBQVMsVUFBVTtBQUFBLFFBQzlCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLEVBQ3BEO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
