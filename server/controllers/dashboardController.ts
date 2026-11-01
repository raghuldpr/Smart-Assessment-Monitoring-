import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { userRepo, assignmentRepo, submissionRepo, assessmentRepo } from '../db/repositories.js';
import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';
import { InternalAssessment } from '../models/InternalAssessment.js';
import { PerformanceReport } from '../models/PerformanceReport.js';
import { seedCollegeSampleData } from '../services/seedService.js';

export class DashboardController {
  public static async getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const role = user.role;

      if (role === 'STUDENT') {
        // --- STUDENT DASHBOARD ---
        const allAssignments = await assignmentRepo.findAll({});
        const mySubmissions = await submissionRepo.findAll({ studentId: user.id });
        const myAssessments = await assessmentRepo.findAll({ studentId: user.id });

        const totalAssignments = allAssignments.length;
        const submittedAssignments = mySubmissions.length;
        const pendingAssignments = Math.max(0, totalAssignments - submittedAssignments);

        const gradedSubs = mySubmissions.filter((s) => s.marks !== null);
        const averageMarks = gradedSubs.length > 0
          ? Number((gradedSubs.reduce((sum, s) => sum + (Number(s.marks) / (Number(s.maximum_marks) || 100)) * 100, 0) / gradedSubs.length).toFixed(2))
          : 0;

        const averageAttendance = myAssessments.length > 0
          ? Number((myAssessments.reduce((sum, a) => sum + Number(a.attendance_percentage || 0), 0) / myAssessments.length).toFixed(2))
          : 0;

        // Upcoming deadlines
        const now = new Date();
        const upcomingDeadlines = allAssignments
          .filter((a) => new Date(a.due_date) >= now)
          .slice(0, 5)
          .map((a) => {
            const hasSub = mySubmissions.find((s) => s.assignment_id === a.id);
            return {
              ...new Assignment(a).toJSON(),
              submitted: !!hasSub,
            };
          });

        // Recent assignments
        const recentAssignments = allAssignments.slice(0, 5).map((a) => {
          const hasSub = mySubmissions.find((s) => s.assignment_id === a.id);
          const entity = new Assignment(a);
          return {
            ...entity.toJSON(),
            student_status: entity.getStatus(!!hasSub, hasSub?.status === 'GRADED'),
          };
        });

        // Recent grades
        const recentGrades = gradedSubs.slice(0, 5).map((s) => new Submission(s).toJSON());

        // Performance chart data
        const performanceChart = myAssessments.map((a) => ({
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
            role: 'STUDENT',
            cards: {
              totalAssignments,
              submittedAssignments,
              pendingAssignments,
              averageMarks,
              attendance: averageAttendance,
            },
            recentAssignments,
            upcomingDeadlines,
            recentGrades,
            performanceChart,
          },
        });
        return;
      }

      if (role === 'FACULTY') {
        // --- FACULTY DASHBOARD ---
        const allStudents = await userRepo.findAll({ role: 'STUDENT' });
        const myAssignments = await assignmentRepo.findAll({ facultyId: user.id });
        const myAssignmentIds = new Set(myAssignments.map((a) => a.id));

        const allSubmissions = await submissionRepo.findAll({});
        const relevantSubmissions = allSubmissions.filter((s) => myAssignmentIds.has(s.assignment_id));

        const pendingSubmissions = relevantSubmissions.filter((s) => s.status !== 'GRADED').length;
        const gradedSubmissions = relevantSubmissions.filter((s) => s.status === 'GRADED').length;

        const myAssessments = await assessmentRepo.findAll({ facultyId: user.id });
        const avgClassPerf = myAssessments.length > 0
          ? Number((myAssessments.reduce((sum, a) => sum + Number(a.percentage || 0), 0) / myAssessments.length).toFixed(2))
          : 0;

        const now = new Date();
        const upcomingDeadlines = myAssignments
          .filter((a) => new Date(a.due_date) >= now)
          .slice(0, 5)
          .map((a) => new Assignment(a).toJSON());

        const recentSubmissions = relevantSubmissions.slice(0, 6).map((s) => new Submission(s).toJSON());

        // Subject performance summary
        const subjectStats = PerformanceReport.groupBySubject(
          myAssessments.map((a) => ({
            subject: a.subject,
            test_1: Number(a.test_1 || 0),
            test_2: Number(a.test_2 || 0),
            assignment_marks: Number(a.assignment_marks || 0),
            attendance_percentage: Number(a.attendance_percentage || 0),
            percentage: Number(a.percentage || 0),
          }))
        );

        res.status(200).json({
          success: true,
          data: {
            role: 'FACULTY',
            cards: {
              totalStudents: allStudents.length,
              totalAssignments: myAssignments.length,
              pendingSubmissions,
              gradedSubmissions,
              averageClassPerformance: avgClassPerf,
            },
            recentSubmissions,
            upcomingDeadlines,
            subjectStats,
            assessmentsCount: myAssessments.length,
          },
        });
        return;
      }

      if (role === 'ADMIN') {
        // --- ADMIN DASHBOARD ---
        const allUsers = await userRepo.findAll({});
        const allStudents = allUsers.filter((u) => u.role === 'STUDENT');
        const allFaculty = allUsers.filter((u) => u.role === 'FACULTY');
        const allAssignments = await assignmentRepo.findAll({});
        const allSubmissions = await submissionRepo.findAll({});
        const allAssessments = await assessmentRepo.findAll({});

        // Students by department chart
        const deptMap: Record<string, number> = {};
        allStudents.forEach((s) => {
          deptMap[s.department] = (deptMap[s.department] || 0) + 1;
        });
        const studentsByDepartment = Object.entries(deptMap).map(([department, count]) => ({
          department,
          count,
        }));

        // User distribution
        const userDistribution = [
          { name: 'Students', count: allStudents.length, fill: '#3b82f6' },
          { name: 'Faculty', count: allFaculty.length, fill: '#10b981' },
          { name: 'Administrators', count: allUsers.filter((u) => u.role === 'ADMIN').length, fill: '#8b5cf6' },
        ];

        // Overall performance distribution
        const performanceDistribution = [
          { name: 'Excellent (90-100)', count: 0, fill: '#10b981' },
          { name: 'Good (75-89)', count: 0, fill: '#3b82f6' },
          { name: 'Average (60-74)', count: 0, fill: '#f59e0b' },
          { name: 'Needs Improvement (<60)', count: 0, fill: '#ef4444' },
        ];
        allAssessments.forEach((a) => {
          const category = InternalAssessment.classifyPerformance(Number(a.percentage || 0));
          const found = performanceDistribution.find((p) => p.name.startsWith(category));
          if (found) found.count++;
        });

        res.status(200).json({
          success: true,
          data: {
            role: 'ADMIN',
            cards: {
              totalUsers: allUsers.length,
              totalStudents: allStudents.length,
              totalFaculty: allFaculty.length,
              totalAssignments: allAssignments.length,
              totalSubmissions: allSubmissions.length,
            },
            charts: {
              studentsByDepartment,
              userDistribution,
              performanceDistribution,
              totalAssessments: allAssessments.length,
            },
          },
        });
        return;
      }

      res.status(400).json({ success: false, message: 'Unrecognized user role.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async seedData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const result = await seedCollegeSampleData(user.id);
      res.status(200).json({
        success: true,
        message: 'Successfully populated realistic college courses, assignments, and assessment data.',
        data: result,
      });
    } catch (err: any) {
      console.error('Seed data error:', err);
      res.status(500).json({ success: false, message: err.message || 'Failed to seed sample data.' });
    }
  }
}
