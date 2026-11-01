import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

import { dbManager } from './server/db/database.js';
import { seedCollegeSampleData } from './server/services/seedService.js';
import authRoutes from './server/routes/authRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import assignmentRoutes from './server/routes/assignmentRoutes.js';
import submissionRoutes from './server/routes/submissionRoutes.js';
import assessmentRoutes from './server/routes/assessmentRoutes.js';
import reportRoutes from './server/routes/reportRoutes.js';
import dashboardRoutes from './server/routes/dashboardRoutes.js';

dotenv.config();

let cachedApp: express.Express | null = null;

export async function createExpressApp(): Promise<express.Express> {
  if (cachedApp) return cachedApp;

  const app = express();

  // Initialize Relational Database connection (MySQL or zero-config fallback)
  await dbManager.initialize();

  // Ensure default students (Abhishek, Rahul, etc.) and faculty accounts exist
  try {
    await seedCollegeSampleData();
  } catch (err: any) {
    console.warn('⚠️ Seeding initial college data:', err.message);
  }

  // Basic Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/submissions', submissionRoutes);
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      engine: dbManager.getAdapter().getEngine(),
      timestamp: new Date().toISOString(),
    });
  });

  // Global error handler for JSON APIs
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  });

  cachedApp = app;
  return app;
}

async function startServer() {
  const app = await createExpressApp();
  const PORT = 3000;

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

// Run standalone server when not in Vercel serverless environment
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Fatal failure starting server:', err);
    process.exit(1);
  });
}
