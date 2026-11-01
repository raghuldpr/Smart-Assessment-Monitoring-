import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { assessmentRepo, userRepo } from '../db/repositories.js';
import { InternalAssessment } from '../models/InternalAssessment.js';

export class AssessmentController {
  /**
   * GET /api/assessments
   */
  public static async getAssessments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { studentId, subject, facultyId } = req.query;

      let targetStudentId = studentId ? Number(studentId) : undefined;
      // If student, can only view their own assessments
      if (req.user?.role === 'STUDENT') {
        targetStudentId = req.user.id;
      }

      const rows = await assessmentRepo.findAll({
        studentId: targetStudentId,
        subject: subject as string,
        facultyId: facultyId ? Number(facultyId) : undefined,
      });

      const list = rows.map((r) => new InternalAssessment(r).toJSON());

      res.status(200).json({
        success: true,
        data: list,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/assessments/:id
   */
  public static async getAssessmentById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const row = await assessmentRepo.findById(id);

      if (!row) {
        res.status(404).json({ success: false, message: 'Internal assessment record not found.' });
        return;
      }

      if (req.user?.role === 'STUDENT' && row.student_id !== req.user.id) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: new InternalAssessment(row).toJSON(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/assessments
   * Faculty or Admin creates or updates an assessment record
   */
  public static async createAssessment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        student_id,
        subject,
        test_1,
        test_2,
        assignment_marks,
        attendance_percentage,
      } = req.body;

      // Validate inputs
      const validation = InternalAssessment.validate({
        student_id: Number(student_id),
        subject: subject || '',
        test_1: Number(test_1 || 0),
        test_2: Number(test_2 || 0),
        assignment_marks: Number(assignment_marks || 0),
        attendance_percentage: Number(attendance_percentage || 0),
      });

      if (!validation.isValid) {
        res.status(400).json({ success: false, message: validation.error });
        return;
      }

      // Check student exists
      const student = await userRepo.findById(Number(student_id));
      if (!student || student.role !== 'STUDENT') {
        res.status(400).json({ success: false, message: 'Selected user is not a valid registered student.' });
        return;
      }

      const calculated = InternalAssessment.calculateTotals(
        Number(test_1 || 0),
        Number(test_2 || 0),
        Number(assignment_marks || 0),
        Number(attendance_percentage || 0)
      );

      const record = await assessmentRepo.upsert({
        student_id: Number(student_id),
        subject: subject.trim(),
        test_1: Number(test_1 || 0),
        test_2: Number(test_2 || 0),
        assignment_marks: Number(assignment_marks || 0),
        attendance_percentage: Number(attendance_percentage || 0),
        total_marks: calculated.totalMarks,
        percentage: calculated.percentage,
        faculty_id: req.user?.id || null,
      });

      res.status(201).json({
        success: true,
        message: 'Internal assessment recorded successfully.',
        data: new InternalAssessment(record).toJSON(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * PUT /api/assessments/:id
   */
  public static async updateAssessment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const existing = await assessmentRepo.findById(id);

      if (!existing) {
        res.status(404).json({ success: false, message: 'Assessment record not found.' });
        return;
      }

      const {
        test_1,
        test_2,
        assignment_marks,
        attendance_percentage,
        subject,
      } = req.body;

      const t1 = test_1 !== undefined ? Number(test_1) : Number(existing.test_1);
      const t2 = test_2 !== undefined ? Number(test_2) : Number(existing.test_2);
      const aMarks = assignment_marks !== undefined ? Number(assignment_marks) : Number(existing.assignment_marks);
      const att = attendance_percentage !== undefined ? Number(attendance_percentage) : Number(existing.attendance_percentage);

      const validation = InternalAssessment.validate({
        student_id: existing.student_id,
        subject: subject || existing.subject,
        test_1: t1,
        test_2: t2,
        assignment_marks: aMarks,
        attendance_percentage: att,
      });

      if (!validation.isValid) {
        res.status(400).json({ success: false, message: validation.error });
        return;
      }

      const calculated = InternalAssessment.calculateTotals(t1, t2, aMarks, att);

      const updated = await assessmentRepo.upsert({
        student_id: existing.student_id,
        subject: subject ? subject.trim() : existing.subject,
        test_1: t1,
        test_2: t2,
        assignment_marks: aMarks,
        attendance_percentage: att,
        total_marks: calculated.totalMarks,
        percentage: calculated.percentage,
        faculty_id: req.user?.id || existing.faculty_id,
      });

      res.status(200).json({
        success: true,
        message: 'Internal assessment updated successfully.',
        data: new InternalAssessment(updated).toJSON(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * DELETE /api/assessments/:id
   */
  public static async deleteAssessment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const existing = await assessmentRepo.findById(id);

      if (!existing) {
        res.status(404).json({ success: false, message: 'Assessment not found.' });
        return;
      }

      await assessmentRepo.delete(id);
      res.status(200).json({
        success: true,
        message: 'Internal assessment record deleted successfully.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
