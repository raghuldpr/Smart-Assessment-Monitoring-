import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app, ensureDatabaseReady } from './server/app.js';

async function startServer() {
  const PORT = 3000;

  // Initialize database and sample accounts
  await ensureDatabaseReady();

  // Vite Middleware for Frontend Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Smart Assessment Server running at http://0.0.0.0:${PORT}`);
  });
}

// In local development or standalone container environments, start the listener
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Fatal failure starting server:', err);
    process.exit(1);
  });
}

export default app;
