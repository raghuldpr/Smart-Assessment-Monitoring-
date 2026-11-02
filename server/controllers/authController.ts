import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { userRepo } from '../db/repositories.js';
import { generateToken, AuthRequest } from '../middleware/auth.js';
import { User, UserRole } from '../models/User.js';

import { seedCollegeSampleData, PRECONFIGURED_STUDENTS, PRECONFIGURED_FACULTY } from '../services/seedService.js';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, confirmPassword, role, department, year } = req.body;

      // Validation
      if (!name || !email || !password || !role || !department) {
        res.status(400).json({
          success: false,
          message: 'All fields (Name, Email, Password, Role, Department) are required.',
        });
        return;
      }

      const validRoles: UserRole[] = ['STUDENT', 'FACULTY', 'ADMIN'];
      if (!validRoles.includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role. Must be STUDENT, FACULTY, or ADMIN.',
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.',
        });
        return;
      }

      if (confirmPassword && password !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Passwords do not match.',
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
        });
        return;
      }

      // Prevent duplicate email addresses
      const existingUser = await userRepo.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in.',
        });
        return;
      }

      // Hash password using bcryptjs
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Persist user to database
      const createdRow = await userRepo.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        role,
        department: department.trim(),
        year: year || (role === 'STUDENT' ? '1st Year' : null),
      });

      const userEntity = new User(createdRow);
      const token = generateToken({
        id: userEntity.id,
        email: userEntity.email,
        role: userEntity.role,
        name: userEntity.name,
        department: userEntity.department,
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: {
          token,
          user: userEntity.toJSON(),
        },
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'An error occurred during account registration.',
      });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required.',
        });
        return;
      }

      // Safe check: ensure initial college data exists if database was fresh
      try {
        await seedCollegeSampleData();
      } catch (seedErr: any) {
        console.warn('Seed check during login:', seedErr?.message);
      }

      const userRow = await userRepo.findByEmail(email);
      if (!userRow) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
        return;
      }

      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, userRow.password_hash);
      } catch (bcryptErr) {
        console.error('Bcrypt compare error:', bcryptErr);
      }

      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
        return;
      }

      const userEntity = new User(userRow);
      const token = generateToken({
        id: userEntity.id,
        email: userEntity.email,
        role: userEntity.role,
        name: userEntity.name,
        department: userEntity.department || 'General',
      });

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          user: userEntity.toJSON(),
        },
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'An error occurred during sign in. Please try again.',
      });
    }
  }

  public static async demoLogin(req: Request, res: Response): Promise<void> {
    try {
      const { role, email } = req.body;

      // Ensure base sample data is seeded (fail-safe)
      try {
        await seedCollegeSampleData();
      } catch (seedErr: any) {
        console.warn('Seed check during demo login:', seedErr?.message);
      }

      let targetEmail = email;
      if (!targetEmail) {
        const targetRole = (role || 'STUDENT').toUpperCase();
        if (targetRole === 'FACULTY') {
          targetEmail = 'faculty@college.edu';
        } else if (targetRole === 'ADMIN') {
          targetEmail = 'admin@college.edu';
        } else {
          targetEmail = 'abhishek@college.edu';
        }
      }

      let userRow = await userRepo.findByEmail(targetEmail);
      if (!userRow) {
        // Fallback: search by role in case email was modified
        const targetRole = (role || (targetEmail.includes('faculty') ? 'FACULTY' : 'STUDENT')).toUpperCase();
        const roleUsers = await userRepo.findAll({ role: targetRole });
        userRow = roleUsers[0] || null;
      }

      if (!userRow) {
        res.status(404).json({ success: false, message: `Account with email ${targetEmail} not found.` });
        return;
      }

      const userEntity = new User(userRow);
      const token = generateToken({
        id: userEntity.id,
        email: userEntity.email,
        role: userEntity.role,
        name: userEntity.name,
        department: userEntity.department || 'General',
      });

      res.status(200).json({
        success: true,
        message: `Signed in as ${userEntity.name} (${userEntity.role}).`,
        data: {
          token,
          user: userEntity.toJSON(),
        },
      });
    } catch (err: any) {
      console.error('Demo login error:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to perform demo login.',
      });
    }
  }

  public static async getDemoAccounts(req: Request, res: Response): Promise<void> {
    try {
      // Ensure seeded
      await seedCollegeSampleData();
      res.status(200).json({
        success: true,
        data: {
          students: PRECONFIGURED_STUDENTS,
          faculty: PRECONFIGURED_FACULTY,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to retrieve demo accounts.' });
    }
  }

  public static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      const userRow = await userRepo.findById(req.user.id);
      if (!userRow) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const userEntity = new User(userRow);
      res.status(200).json({
        success: true,
        data: userEntity.toJSON(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
