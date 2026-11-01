import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { assessmentRepo, submissionRepo, userRepo, assignmentRepo } from '../db/repositories.js';
import { PerformanceReport } from '../models/PerformanceReport.js';

export class ReportController {
  /**
   * GET /api/reports/performance
   * Returns institution-wide or faculty-specific performance metrics and distributions
   */
  public static async getOverallPerformance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { facultyId } = req.query;
      const targetFacultyId = req.user?.role === 'FACULTY' ? req.user.id : (facultyId ? Number(facultyId) : undefined);

      const assessments = await assessmentRepo.findAll({ facultyId: targetFacultyId });
      const submissions = await submissionRepo.findAll({});

      const metrics = PerformanceReport.calculateMetrics(
        assessments.map((a) => ({
          test_1: Number(a.test_1 || 0),
          test_2: Number(a.test_2 || 0),
          assignment_marks: Number(a.assignment_marks || 0),
          attendance_percentage: Number(a.attendance_percentage || 0),
          percentage: Number(a.percentage || 0),
        })),
        submissions.map((s) => ({
          marks: s.marks !== null ? Number(s.marks) : null,
          maximum_marks: Number(s.maximum_marks || 100),
        }))
      );

      const subjectBreakdown = PerformanceReport.groupBySubject(
        assessments.map((a) => ({
          subject: a.subject,
          test_1: Number(a.test_1 || 0),
          test_2: Number(a.test_2 || 0),
          assignment_marks: Number(a.assignment_marks || 0),
          attendance_percentage: Number(a.attendance_percentage || 0),
          percentage: Number(a.percentage || 0),
        }))
      );

      // Grade category distribution for charts
      const categoryDistribution = [
        { name: 'Excellent (90-100)', count: 0, fill: '#10b981' },
        { name: 'Good (75-89)', count: 0, fill: '#3b82f6' },
        { name: 'Average (60-74)', count: 0, fill: '#f59e0b' },
        { name: 'Needs Improvement (<60)', count: 0, fill: '#ef4444' },
      ];

      for (const a of assessments) {
        const pct = Number(a.percentage || 0);
        if (pct >= 90) categoryDistribution[0].count++;
        else if (pct >= 75) categoryDistribution[1].count++;
        else if (pct >= 60) categoryDistribution[2].count++;
        else categoryDistribution[3].count++;
      }

      res.status(200).json({
        success: true,
        data: {
          metrics,
          subjectBreakdown,
          categoryDistribution,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/reports/student/:id
   */
  public static async getStudentReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const studentId = Number(req.params.id);

      // Access control: A student can only view their own report
      if (req.user?.role === 'STUDENT' && req.user.id !== studentId) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }

      const student = await userRepo.findById(studentId);
      if (!student || student.role !== 'STUDENT') {
        res.status(404).json({ success: false, message: 'Student not found.' });
        return;
      }

      const assessments = await assessmentRepo.findAll({ studentId });
      const submissions = await submissionRepo.findAll({ studentId });
      const assignments = await assignmentRepo.findAll({});

      const metrics = PerformanceReport.calculateMetrics(
        assessments.map((a) => ({
          test_1: Number(a.test_1 || 0),
          test_2: Number(a.test_2 || 0),
          assignment_marks: Number(a.assignment_marks || 0),
          attendance_percentage: Number(a.attendance_percentage || 0),
          percentage: Number(a.percentage || 0),
        })),
        submissions.map((s) => ({
          marks: s.marks !== null ? Number(s.marks) : null,
          maximum_marks: Number(s.maximum_marks || 100),
        }))
      );

      // Subject-wise performance for student chart
      const subjectChart = assessments.map((a) => ({
        subject: a.subject,
        test1: Number(a.test_1 || 0),
        test2: Number(a.test_2 || 0),
        assignmentMarks: Number(a.assignment_marks || 0),
        attendance: Number(a.attendance_percentage || 0),
        percentage: Number(a.percentage || 0),
      }));

      res.status(200).json({
        success: true,
        data: {
          student: {
            id: student.id,
            name: student.name,
            email: student.email,
            department: student.department,
            year: student.year,
          },
          metrics,
          subjectChart,
          assessments,
          submissions,
          totalAssignments: assignments.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/reports/subject/:subject
   */
  public static async getSubjectReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const subject = req.params.subject;
      const assessments = await assessmentRepo.findAll({ subject });
      const assignments = await assignmentRepo.findAll({ subject });

      const metrics = PerformanceReport.calculateMetrics(
        assessments.map((a) => ({
          test_1: Number(a.test_1 || 0),
          test_2: Number(a.test_2 || 0),
          assignment_marks: Number(a.assignment_marks || 0),
          attendance_percentage: Number(a.attendance_percentage || 0),
          percentage: Number(a.percentage || 0),
        })),
        []
      );

      res.status(200).json({
        success: true,
        data: {
          subject,
          metrics,
          assessments,
          assignmentsCount: assignments.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
