// This file helps with client-side routing in development
// It's automatically picked up by Vite when serving the app

const { createServer } = require('vite');

async function startServer() {
  const server = await createServer({
    configFile: false,
    server: {
      port: 8080,
      open: true,
      historyApiFallback: true,
    },
  });

  await server.listen();
  server.printUrls();
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
