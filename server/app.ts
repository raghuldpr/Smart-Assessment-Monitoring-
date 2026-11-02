import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { dbManager } from './db/database.js';
import { seedCollegeSampleData } from './services/seedService.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

export const app = express();

// Track DB initialization promise so all requests wait until DB is ready
let initPromise: Promise<void> | null = null;

export async function ensureDatabaseReady(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await dbManager.initialize();
        await seedCollegeSampleData();
        console.log('✅ College sample accounts & course data verified/seeded.');
      } catch (err: any) {
        console.warn('⚠️ Warning during database/seed initialization:', err.message);
      }
    })();
  }
  return initPromise;
}

// Basic Middlewares
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization middleware: ensures DB and seeds are ready before any API call runs
app.use(async (req, res, next) => {
  // Normalize URL in case Vercel rewrites altered the path
  const matchedPath = (req.headers['x-matched-path'] as string) || '';
  if (matchedPath && req.url === '/api' && matchedPath.startsWith('/api')) {
    req.url = matchedPath;
  }

  try {
    await ensureDatabaseReady();
    next();
  } catch (err) {
    next(err);
  }
});

// Dual-path route mounting: Supports both '/api/auth' and '/auth'
// (Guarantees matching regardless of whether hosting platform strips or preserves '/api')
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/users', '/users'], userRoutes);
app.use(['/api/assignments', '/assignments'], assignmentRoutes);
app.use(['/api/submissions', '/submissions'], submissionRoutes);
app.use(['/api/assessments', '/assessments'], assessmentRoutes);
app.use(['/api/reports', '/reports'], reportRoutes);
app.use(['/api/dashboard', '/dashboard'], dashboardRoutes);

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    engine: dbManager.getAdapter().getEngine(),
    timestamp: new Date().toISOString(),
  });
});

// Global error handler for JSON APIs (always returns proper JSON with clear message)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

export default app;
