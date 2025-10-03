// vite.config.ts
import { defineConfig } from "file:///C:/webs/Language%20custom/node_modules/vite/dist/node/index.js";
import react from "file:///C:/webs/Language%20custom/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/webs/Language%20custom/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\webs\\Language custom";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add this to handle client-side routing
    proxy: {
      // This ensures all routes are handled by the Vite dev server
      "^/(?!@vite|@id|node_modules|src|assets|public).*": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path2) => "/index.html"
      }
    },
    // Enable history API fallback
    historyApiFallback: true
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    chunkSizeWarningLimit: 1e3,
    // Increase chunk size warning limit to 1000 kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          react: ["react", "react-dom", "react-router-dom"],
          // Material-UI components
          mui: ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
          // Split large dependencies
          vendor: ["axios", "date-fns"]
        }
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFx3ZWJzXFxcXExhbmd1YWdlIGN1c3RvbVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcd2Vic1xcXFxMYW5ndWFnZSBjdXN0b21cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L3dlYnMvTGFuZ3VhZ2UlMjBjdXN0b20vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIC8vIEFkZCB0aGlzIHRvIGhhbmRsZSBjbGllbnQtc2lkZSByb3V0aW5nXG4gICAgcHJveHk6IHtcbiAgICAgIC8vIFRoaXMgZW5zdXJlcyBhbGwgcm91dGVzIGFyZSBoYW5kbGVkIGJ5IHRoZSBWaXRlIGRldiBzZXJ2ZXJcbiAgICAgICdeLyg/IUB2aXRlfEBpZHxub2RlX21vZHVsZXN8c3JjfGFzc2V0c3xwdWJsaWMpLionOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MCcsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+ICcvaW5kZXguaHRtbCdcbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIEVuYWJsZSBoaXN0b3J5IEFQSSBmYWxsYmFja1xuICAgIGhpc3RvcnlBcGlGYWxsYmFjazogdHJ1ZSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJiBjb21wb25lbnRUYWdnZXIoKSxcbiAgXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsIC8vIEluY3JlYXNlIGNodW5rIHNpemUgd2FybmluZyBsaW1pdCB0byAxMDAwIGtCXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIC8vIFNwbGl0IHZlbmRvciBsaWJyYXJpZXMgaW50byBzZXBhcmF0ZSBjaHVua3NcbiAgICAgICAgICByZWFjdDogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgIC8vIE1hdGVyaWFsLVVJIGNvbXBvbmVudHNcbiAgICAgICAgICBtdWk6IFsnQG11aS9tYXRlcmlhbCcsICdAbXVpL2ljb25zLW1hdGVyaWFsJywgJ0BlbW90aW9uL3JlYWN0JywgJ0BlbW90aW9uL3N0eWxlZCddLFxuICAgICAgICAgIC8vIFNwbGl0IGxhcmdlIGRlcGVuZGVuY2llc1xuICAgICAgICAgIHZlbmRvcjogWydheGlvcycsICdkYXRlLWZucyddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStQLFNBQVMsb0JBQW9CO0FBQzVSLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQSxJQUVOLE9BQU87QUFBQTtBQUFBLE1BRUwsb0RBQW9EO0FBQUEsUUFDbEQsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDQSxVQUFTO0FBQUEsTUFDckI7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLG9CQUFvQjtBQUFBLEVBQ3RCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQSxFQUM1QyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLHVCQUF1QjtBQUFBO0FBQUEsSUFDdkIsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBO0FBQUEsVUFFWixPQUFPLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBO0FBQUEsVUFFaEQsS0FBSyxDQUFDLGlCQUFpQix1QkFBdUIsa0JBQWtCLGlCQUFpQjtBQUFBO0FBQUEsVUFFakYsUUFBUSxDQUFDLFNBQVMsVUFBVTtBQUFBLFFBQzlCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLEVBQ3BEO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFsicGF0aCJdCn0K
