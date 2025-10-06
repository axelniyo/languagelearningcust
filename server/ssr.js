import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { renderToString } from 'react-dom/server';
import React from 'react';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const staticPath = join(__dirname, '../client/build');

// List of routes that should be SSR'd for SEO
const SEORoutes = [
  '/',
  '/courses',
  '/exercises',
  '/grammar',
  '/languages',
  '/phrases',
  '/units',
  '/course/:courseId',
  '/lesson/:lessonId'
];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS in development
if (!isProduction) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
}

// Serve static files from the React app
app.use(express.static(staticPath, { index: false }));

// API routes (if any)
app.use('/api', (req, res, next) => {
  // Forward API requests to your API server or handle them here
  next();
});

// Helper function to check if a route should be SSR'd
const shouldSSR = (url) => {
  // Check exact matches first
  if (SEORoutes.includes(url)) return true;
  
  // Check dynamic routes
  return SEORoutes.some(route => {
    if (route.includes(':')) {
      const routeParts = route.split('/');
      const urlParts = url.split('/');
      
      if (routeParts.length !== urlParts.length) return false;
      
      return routeParts.every((part, i) => {
        return part.startsWith(':') || part === urlParts[i];
      });
    }
    return false;
  });
};

// Handle all GET requests with potential SSR
app.get('*', async (req, res, next) => {
  try {
    // Read the index.html file
    const filePath = join(staticPath, 'index.html');
    let htmlData;
    
    try {
      htmlData = await fs.readFile(filePath, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).send('Not Found');
      }
      throw err;
    }

    // Only perform SSR in production and for SEO routes
    const useSSR = isProduction && shouldSSR(req.path);
    
    if (useSSR) {
      try {
        // Clear the require cache to get fresh module state
        const clientBuildPath = join(__dirname, '../client/build');
        const cacheKeys = Object.keys(require.cache);
        cacheKeys.forEach(key => {
          if (key.startsWith(clientBuildPath)) {
            delete require.cache[key];
          }
        });

        // Dynamically import the App component
        const { default: App } = await import('../client/src/App.js');
        
        // Create a simple router context for server-side routing
        const context = {};
        
        // Create a simple location object for StaticRouter
        const location = req.url;
        
        // Render the app to a string
        const appString = renderToString(
          React.createElement(
            React.StrictMode,
            null,
            React.createElement(App, { location, context })
          )
        );
        
        // Check if the render resulted in a redirect
        if (context.url) {
          return res.redirect(context.status || 302, context.url);
        }
        
        // Get the title and meta tags from the rendered app
        // This would be set by the Seo component during render
        const title = context.title || 'Language Mentor';
        const metaDescription = context.metaDescription || 'Learn new languages with our interactive platform';
        
        // Inject the rendered app and SEO metadata into our HTML
        htmlData = htmlData
          .replace('<title>React App</title>', `<title>${title}</title>`)
          .replace(
            '<meta name="description" content="Web site created using create-react-app"/>',
            `<meta name="description" content="${metaDescription}" />`
          )
          .replace(
            '<div id="root"></div>',
            `<div id="root">${appString}</div>`
          );
        
      } catch (renderError) {
        console.error('Error during server-side rendering:', renderError);
        // Fall back to client-side rendering if SSR fails
        htmlData = htmlData.replace(
          '<div id="root"></div>',
          '<div id="root"></div>'
        );
      }
    } else {
      // For non-SEO routes or in development, use client-side rendering
      htmlData = htmlData.replace(
        '<div id="root"></div>',
        '<div id="root"></div>'
      );
    }

    // Set appropriate cache headers for SEO
    if (useSSR) {
      // Cache SSR'd pages for 1 hour
      res.set('Cache-Control', 'public, max-age=3600');
    } else {
      // Don't cache API responses or other non-SSR content
      res.set('Cache-Control', 'no-store, max-age=0');
    }

    // Send the response
    res.status(200).send(htmlData);
  } catch (error) {
    console.error('Error in SSR handler:', error);
    next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Internal Server Error');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
});
