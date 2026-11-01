import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { submissionRepo, assignmentRepo } from '../db/repositories.js';
import { Submission } from '../models/Submission.js';

export class SubmissionController {
  /**
   * POST /api/submissions
   * Student submits an assignment
   */
  public static async createSubmission(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { assignment_id, file_name, submission_notes } = req.body;
      const studentId = req.user!.id;

      if (!assignment_id || !file_name) {
        res.status(400).json({
          success: false,
          message: 'Assignment ID and file name are required.',
        });
        return;
      }

      // Check assignment exists
      const assignment = await assignmentRepo.findById(Number(assignment_id));
      if (!assignment) {
        res.status(404).json({
          success: false,
          message: 'Assignment not found.',
        });
        return;
      }

      // Prevent duplicate submission
      const existing = await submissionRepo.findByAssignmentAndStudent(Number(assignment_id), studentId);
      if (existing) {
        res.status(409).json({
          success: false,
          message: 'You have already submitted this assignment. Resubmission is not permitted.',
        });
        return;
      }

      const created = await submissionRepo.create({
        assignment_id: Number(assignment_id),
        student_id: studentId,
        file_name: file_name.trim(),
        submission_notes: submission_notes ? submission_notes.trim() : null,
      });

      res.status(201).json({
        success: true,
        message: 'Assignment submitted successfully.',
        data: new Submission(created).toJSON(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/submissions
   * Filterable by assignmentId, studentId, status
   */
  public static async getSubmissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { assignmentId, studentId, status } = req.query;

      // If user is a STUDENT, strictly limit to their own submissions
      let targetStudentId = studentId ? Number(studentId) : undefined;
      if (req.user?.role === 'STUDENT') {
        targetStudentId = req.user.id;
      }

      const rows = await submissionRepo.findAll({
        assignmentId: assignmentId ? Number(assignmentId) : undefined,
        studentId: targetStudentId,
        status: status as string,
      });

      const submissions = rows.map((r) => new Submission(r).toJSON());

      res.status(200).json({
        success: true,
        data: submissions,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/submissions/:id
   */
  public static async getSubmissionById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const row = await submissionRepo.findById(id);

      if (!row) {
        res.status(404).json({ success: false, message: 'Submission not found.' });
        return;
      }

      // If student, ensure they own this submission
      if (req.user?.role === 'STUDENT' && row.student_id !== req.user.id) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: new Submission(row).toJSON(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * PUT /api/submissions/:id/grade
   * Faculty evaluates and enters marks & feedback
   */
  public static async gradeSubmission(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { marks, feedback } = req.body;

      if (req.user?.role !== 'FACULTY' && req.user?.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Only faculty members can grade submissions.' });
        return;
      }

      const row = await submissionRepo.findById(id);
      if (!row) {
        res.status(404).json({ success: false, message: 'Submission not found.' });
        return;
      }

      const maxMarks = Number(row.maximum_marks) || 100;
      const numMarks = Number(marks);

      if (isNaN(numMarks) || numMarks < 0 || numMarks > maxMarks) {
        res.status(400).json({
          success: false,
          message: `Marks must be between 0 and maximum marks (${maxMarks}).`,
        });
        return;
      }

      await submissionRepo.grade(id, numMarks, feedback || '');

      const updated = await submissionRepo.findById(id);
      res.status(200).json({
        success: true,
        message: 'Submission graded successfully.',
        data: new Submission(updated!).toJSON(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
