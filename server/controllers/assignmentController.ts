import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { assignmentRepo, submissionRepo } from '../db/repositories.js';
import { Assignment } from '../models/Assignment.js';

export class AssignmentController {
  /**
   * GET /api/assignments
   * Returns assignments. If the user is a STUDENT, includes their specific submission status.
   */
  public static async getAssignments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { facultyId, subject, search } = req.query;
      const rows = await assignmentRepo.findAll({
        facultyId: facultyId ? Number(facultyId) : undefined,
        subject: subject as string,
        search: search as string,
      });

      const user = req.user;
      let userSubmissions: any[] = [];
      if (user && user.role === 'STUDENT') {
        userSubmissions = await submissionRepo.findAll({ studentId: user.id });
      }

      const assignments = rows.map((r) => {
        const entity = new Assignment(r);
        const sub = userSubmissions.find((s) => s.assignment_id === r.id);
        const studentStatus = entity.getStatus(!!sub, sub?.status === 'GRADED');
        return {
          ...entity.toJSON(),
          student_status: studentStatus,
          submission: sub || null,
        };
      });

      res.status(200).json({
        success: true,
        data: assignments,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/assignments/:id
   */
  public static async getAssignmentById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const row = await assignmentRepo.findById(id);

      if (!row) {
        res.status(404).json({ success: false, message: 'Assignment not found.' });
        return;
      }

      const entity = new Assignment(row);
      let studentSubmission = null;

      if (req.user && req.user.role === 'STUDENT') {
        studentSubmission = await submissionRepo.findByAssignmentAndStudent(id, req.user.id);
      }

      res.status(200).json({
        success: true,
        data: {
          ...entity.toJSON(),
          student_status: entity.getStatus(!!studentSubmission, studentSubmission?.status === 'GRADED'),
          submission: studentSubmission,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/assignments
   * Faculty or Admin only
   */
  public static async createAssignment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, subject, description, due_date, maximum_marks } = req.body;

      const validation = Assignment.validate({
        title,
        subject,
        due_date,
        maximum_marks,
      });

      if (!validation.isValid) {
        res.status(400).json({ success: false, message: validation.error });
        return;
      }

      const facultyId = req.user!.id;
      const assignedDate = new Date().toISOString().split('T')[0];

      const created = await assignmentRepo.create({
        title: title.trim(),
        subject: subject.trim(),
        description: description || '',
        assigned_date: assignedDate,
        due_date: new Date(due_date).toISOString(),
        maximum_marks: Number(maximum_marks),
        faculty_id: facultyId,
      });

      const entity = new Assignment(created);
      res.status(201).json({
        success: true,
        message: 'Assignment created successfully.',
        data: entity.toJSON(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * PUT /api/assignments/:id
   */
  public static async updateAssignment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const existing = await assignmentRepo.findById(id);

      if (!existing) {
        res.status(404).json({ success: false, message: 'Assignment not found.' });
        return;
      }

      // Faculty owner or admin check
      if (req.user?.role !== 'ADMIN' && existing.faculty_id !== req.user?.id) {
        res.status(403).json({ success: false, message: 'You can only edit assignments you created.' });
        return;
      }

      const { title, subject, description, due_date, maximum_marks } = req.body;

      await assignmentRepo.update(id, {
        title: title ? title.trim() : undefined,
        subject: subject ? subject.trim() : undefined,
        description,
        due_date: due_date ? new Date(due_date).toISOString() : undefined,
        maximum_marks: maximum_marks !== undefined ? Number(maximum_marks) : undefined,
      });

      const updated = await assignmentRepo.findById(id);
      res.status(200).json({
        success: true,
        message: 'Assignment updated successfully.',
        data: new Assignment(updated!).toJSON(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * DELETE /api/assignments/:id
   */
  public static async deleteAssignment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const existing = await assignmentRepo.findById(id);

      if (!existing) {
        res.status(404).json({ success: false, message: 'Assignment not found.' });
        return;
      }

      if (req.user?.role !== 'ADMIN' && existing.faculty_id !== req.user?.id) {
        res.status(403).json({ success: false, message: 'You can only delete assignments you created.' });
        return;
      }

      await assignmentRepo.delete(id);
      res.status(200).json({
        success: true,
        message: 'Assignment deleted successfully.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
