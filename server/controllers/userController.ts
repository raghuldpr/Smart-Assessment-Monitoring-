import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { userRepo, submissionRepo, assessmentRepo, assignmentRepo } from '../db/repositories.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Faculty } from '../models/Faculty.js';
import { InternalAssessment } from '../models/InternalAssessment.js';

export class UserController {
  /**
   * GET /api/users
   * Filterable by role, department, and search query
   */
  public static async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { role, department, search } = req.query;
      const rows = await userRepo.findAll({
        role: role as string,
        department: department as string,
        search: search as string,
      });

      const users = rows.map((r) => new User(r).toJSON());
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/users/:id
   */
  public static async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const row = await userRepo.findById(id);

      if (!row) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      // If requested user is a STUDENT, attach student academic details
      if (row.role === 'STUDENT') {
        const assessments = await assessmentRepo.findAll({ studentId: id });
        const submissions = await submissionRepo.findAll({ studentId: id });
        const allAssignments = await assignmentRepo.findAll({});

        const completedSubs = submissions.filter((s) => s.marks !== null);
        const avgMarks = completedSubs.length > 0
          ? Number((completedSubs.reduce((sum, s) => sum + Number(s.marks || 0), 0) / completedSubs.length).toFixed(2))
          : 0;

        const avgAttendance = assessments.length > 0
          ? Number((assessments.reduce((sum, a) => sum + Number(a.attendance_percentage || 0), 0) / assessments.length).toFixed(2))
          : 0;

        const overallPct = assessments.length > 0
          ? Number((assessments.reduce((sum, a) => sum + Number(a.percentage || 0), 0) / assessments.length).toFixed(2))
          : (avgMarks > 0 ? avgMarks : 0);

        const category = assessments.length > 0 || completedSubs.length > 0
          ? InternalAssessment.classifyPerformance(overallPct)
          : 'N/A';

        const student = new Student(row, {
          assignmentsSubmitted: submissions.length,
          assignmentsTotal: allAssignments.length,
          averageMarks: avgMarks,
          averageAttendance: avgAttendance,
          performanceCategory: category,
        });

        res.status(200).json({
          success: true,
          data: {
            ...student.toJSON(),
            submissions,
            assessments,
          },
        });
        return;
      }

      // If requested user is FACULTY, attach subjects
      if (row.role === 'FACULTY') {
        const assignments = await assignmentRepo.findAll({ facultyId: id });
        const subjects = Array.from(new Set(assignments.map((a) => a.subject)));
        const faculty = new Faculty(row, subjects);
        res.status(200).json({
          success: true,
          data: {
            ...faculty.toJSON(),
            assignmentsCount: assignments.length,
          },
        });
        return;
      }

      const user = new User(row);
      res.status(200).json({
        success: true,
        data: user.toJSON(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * PUT /api/users/:id
   */
  public static async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { name, department, year, role } = req.body;

      // Ensure caller has admin privileges or is updating their own profile
      if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
        res.status(403).json({ success: false, message: 'You do not have permission to edit this profile.' });
        return;
      }

      const existing = await userRepo.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      await userRepo.update(id, {
        name,
        department,
        year,
        // Only Admin can change role
        role: req.user?.role === 'ADMIN' ? role : undefined,
      });

      const updated = await userRepo.findById(id);
      res.status(200).json({
        success: true,
        message: 'User profile updated successfully.',
        data: new User(updated!).toJSON(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * DELETE /api/users/:id
   */
  public static async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Only administrators can delete user accounts.' });
        return;
      }

      // Prevent self-deletion
      if (req.user.id === id) {
        res.status(400).json({ success: false, message: 'You cannot delete your own administrative account.' });
        return;
      }

      const deleted = await userRepo.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'User not found or already deleted.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
