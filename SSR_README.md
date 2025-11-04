# Server-Side Rendering (SSR) Setup

This guide explains how to set up and run the application with Server-Side Rendering (SSR) for improved SEO.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later) or yarn

## Installation

1. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

2. Install server dependencies:
   ```bash
   cd ../server
   npm install
   ```

## Running the Application with SSR

1. Build the React application:
   ```bash
   cd client
   npm run build:ssr
   ```

2. Start the SSR server:
   ```bash
   npm run start:ssr
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Development Workflow

For development, you can run the client in development mode:

```bash
cd client
npm start
```

This will start the development server at `http://localhost:3000` with hot-reloading.

## Environment Variables

Make sure to set up the following environment variables in a `.env` file in the root directory:

```
PORT=5000
NODE_ENV=production
# Add other environment variables as needed
```

## Notes

- The SSR server runs on port 5000 by default.
- The client development server runs on port 3000.
- For production, it's recommended to use a process manager like PM2 to keep the server running.
