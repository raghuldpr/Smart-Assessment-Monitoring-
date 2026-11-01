import { PerformanceCategory, InternalAssessment } from './InternalAssessment.js';

export interface PerformanceMetrics {
  assignmentAverage: number;
  test1Average: number;
  test2Average: number;
  attendancePercentage: number;
  overallPercentage: number;
  category: PerformanceCategory | 'N/A';
  totalAssessments: number;
  totalSubmissions: number;
}

export interface SubjectPerformance {
  subject: string;
  test1Avg: number;
  test2Avg: number;
  assignmentAvg: number;
  attendanceAvg: number;
  overallPercentage: number;
  studentCount: number;
}

export class PerformanceReport {
  /**
   * Computes standardized metrics from raw assessment and submission records.
   * All metrics are calculated dynamically from actual records.
   */
  public static calculateMetrics(
    assessments: Array<{
      test_1: number;
      test_2: number;
      assignment_marks: number;
      attendance_percentage: number;
      percentage: number;
    }>,
    submissions: Array<{
      marks: number | null;
      maximum_marks?: number;
    }>
  ): PerformanceMetrics {
    if (!assessments || assessments.length === 0) {
      // Calculate submission-only average if any
      const gradedSubs = submissions.filter(s => s.marks !== null && (s.maximum_marks || 100) > 0);
      const subAvg = gradedSubs.length > 0
        ? Number((gradedSubs.reduce((acc, curr) => acc + (Number(curr.marks) / (Number(curr.maximum_marks) || 100)) * 100, 0) / gradedSubs.length).toFixed(2))
        : 0;

      return {
        assignmentAverage: subAvg,
        test1Average: 0,
        test2Average: 0,
        attendancePercentage: 0,
        overallPercentage: subAvg,
        category: gradedSubs.length > 0 ? InternalAssessment.classifyPerformance(subAvg) : 'N/A',
        totalAssessments: 0,
        totalSubmissions: submissions.length,
      };
    }

    const count = assessments.length;
    const test1Total = assessments.reduce((acc, a) => acc + Number(a.test_1 || 0), 0);
    const test2Total = assessments.reduce((acc, a) => acc + Number(a.test_2 || 0), 0);
    const assignMarksTotal = assessments.reduce((acc, a) => acc + Number(a.assignment_marks || 0), 0);
    const attendanceTotal = assessments.reduce((acc, a) => acc + Number(a.attendance_percentage || 0), 0);
    const percentageTotal = assessments.reduce((acc, a) => acc + Number(a.percentage || 0), 0);

    const overallPct = Number((percentageTotal / count).toFixed(2));

    return {
      assignmentAverage: Number((assignMarksTotal / count).toFixed(2)),
      test1Average: Number((test1Total / count).toFixed(2)),
      test2Average: Number((test2Total / count).toFixed(2)),
      attendancePercentage: Number((attendanceTotal / count).toFixed(2)),
      overallPercentage: overallPct,
      category: InternalAssessment.classifyPerformance(overallPct),
      totalAssessments: count,
      totalSubmissions: submissions.length,
    };
  }

  /**
   * Groups records by subject to produce chart data for Recharts
   */
  public static groupBySubject(
    assessments: Array<{
      subject: string;
      test_1: number;
      test_2: number;
      assignment_marks: number;
      attendance_percentage: number;
      percentage: number;
    }>
  ): SubjectPerformance[] {
    const map = new Map<string, {
      t1: number;
      t2: number;
      assign: number;
      att: number;
      pct: number;
      count: number;
    }>();

    for (const a of assessments) {
      const existing = map.get(a.subject) || { t1: 0, t2: 0, assign: 0, att: 0, pct: 0, count: 0 };
      existing.t1 += Number(a.test_1 || 0);
      existing.t2 += Number(a.test_2 || 0);
      existing.assign += Number(a.assignment_marks || 0);
      existing.att += Number(a.attendance_percentage || 0);
      existing.pct += Number(a.percentage || 0);
      existing.count += 1;
      map.set(a.subject, existing);
    }

    const results: SubjectPerformance[] = [];
    map.forEach((val, key) => {
      results.push({
        subject: key,
        test1Avg: Number((val.t1 / val.count).toFixed(2)),
        test2Avg: Number((val.t2 / val.count).toFixed(2)),
        assignmentAvg: Number((val.assign / val.count).toFixed(2)),
        attendanceAvg: Number((val.att / val.count).toFixed(2)),
        overallPercentage: Number((val.pct / val.count).toFixed(2)),
        studentCount: val.count,
      });
    });

    return results;
  }
}
