import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_internal_assessment_jwt_secure_secret_2025';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
    name: string;
    department: string;
  };
}

/**
 * Middleware: Verify JWT from Authorization Header
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: UserRole;
      name: string;
      department: string;
    };
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token. Please sign in again.',
    });
  }
}

/**
 * Middleware: Enforce Role-Based Access Control (RBAC)
 */
export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden. You do not have permission for this resource. Required role: ${allowedRoles.join(' or ')}.`,
      });
      return;
    }

    next();
  };
}

export function generateToken(payload: {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  department: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
