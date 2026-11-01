export type PerformanceCategory = 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';

export interface InternalAssessmentRow {
  id: number;
  student_id: number;
  subject: string;
  test_1: number | string;
  test_2: number | string;
  assignment_marks: number | string;
  attendance_percentage: number | string;
  total_marks: number | string;
  percentage: number | string;
  faculty_id?: number | null;
  student_name?: string;
  student_email?: string;
  department?: string;
  year?: string | null;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export class InternalAssessment {
  private _id: number;
  private _studentId: number;
  private _subject: string;
  private _test1: number;
  private _test2: number;
  private _assignmentMarks: number;
  private _attendancePercentage: number;
  private _totalMarks: number;
  private _percentage: number;
  private _facultyId: number | null;

  private _studentName?: string;
  private _studentEmail?: string;
  private _department?: string;
  private _year?: string | null;

  constructor(data: InternalAssessmentRow) {
    this._id = data.id;
    this._studentId = data.student_id;
    this._subject = data.subject;
    this._test1 = Number(data.test_1 || 0);
    this._test2 = Number(data.test_2 || 0);
    this._assignmentMarks = Number(data.assignment_marks || 0);
    this._attendancePercentage = Number(data.attendance_percentage || 0);

    // Auto-calculate total and percentage if not pre-provided
    const calculated = InternalAssessment.calculateTotals(
      this._test1,
      this._test2,
      this._assignmentMarks,
      this._attendancePercentage
    );
    this._totalMarks = data.total_marks !== undefined ? Number(data.total_marks) : calculated.totalMarks;
    this._percentage = data.percentage !== undefined ? Number(data.percentage) : calculated.percentage;
    this._facultyId = data.faculty_id || null;

    this._studentName = data.student_name;
    this._studentEmail = data.student_email;
    this._department = data.department;
    this._year = data.year;
  }

  public get id(): number { return this._id; }
  public get studentId(): number { return this._studentId; }
  public get subject(): string { return this._subject; }
  public get test1(): number { return this._test1; }
  public get test2(): number { return this._test2; }
  public get assignmentMarks(): number { return this._assignmentMarks; }
  public get attendancePercentage(): number { return this._attendancePercentage; }
  public get totalMarks(): number { return this._totalMarks; }
  public get percentage(): number { return this._percentage; }
  public get facultyId(): number | null { return this._facultyId; }

  /**
   * Standard College Internal Assessment Computation Formula:
   * Test 1 (max 30), Test 2 (max 30), Assignment (max 20), Attendance (max 20) = Total 100
   */
  public static calculateTotals(
    test1: number,
    test2: number,
    assignmentMarks: number,
    attendancePercentage: number
  ): { totalMarks: number; percentage: number } {
    // Attendance contributes up to 20 marks based on % (e.g. 100% = 20 marks)
    // Or direct sum if standardized. Here we do direct weighted sum:
    // Total = Test 1 (out of 30) + Test 2 (out of 30) + Assignments (out of 20) + (Attendance/100 * 20)
    const attendanceMarks = (attendancePercentage / 100) * 20;
    const total = Number((test1 + test2 + assignmentMarks + attendanceMarks).toFixed(2));
    const percentage = Number(Math.min(100, Math.max(0, total)).toFixed(2));
    return {
      totalMarks: total,
      percentage: percentage,
    };
  }

  /**
   * Strictly according to specifications:
   * 90–100: Excellent
   * 75–89: Good
   * 60–74: Average
   * Below 60: Needs Improvement
   */
  public getPerformanceCategory(): PerformanceCategory {
    return InternalAssessment.classifyPerformance(this._percentage);
  }

  public static classifyPerformance(percentage: number): PerformanceCategory {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Average';
    return 'Needs Improvement';
  }

  public static validate(data: {
    student_id: number;
    subject: string;
    test_1: number;
    test_2: number;
    assignment_marks: number;
    attendance_percentage: number;
  }): { isValid: boolean; error?: string } {
    if (!data.student_id) return { isValid: false, error: 'Student selection is required' };
    if (!data.subject || data.subject.trim().length === 0) return { isValid: false, error: 'Subject is required' };

    if (data.test_1 < 0 || data.test_1 > 30) return { isValid: false, error: 'Test 1 marks must be between 0 and 30' };
    if (data.test_2 < 0 || data.test_2 > 30) return { isValid: false, error: 'Test 2 marks must be between 0 and 30' };
    if (data.assignment_marks < 0 || data.assignment_marks > 20) {
      return { isValid: false, error: 'Assignment marks must be between 0 and 20' };
    }
    if (data.attendance_percentage < 0 || data.attendance_percentage > 100) {
      return { isValid: false, error: 'Attendance percentage must be between 0 and 100' };
    }

    return { isValid: true };
  }

  public toJSON() {
    return {
      id: this._id,
      student_id: this._studentId,
      subject: this._subject,
      test_1: this._test1,
      test_2: this._test2,
      assignment_marks: this._assignmentMarks,
      attendance_percentage: this._attendancePercentage,
      total_marks: this._totalMarks,
      percentage: this._percentage,
      faculty_id: this._facultyId,
      performance_category: this.getPerformanceCategory(),
      student_name: this._studentName,
      student_email: this._studentEmail,
      department: this._department,
      year: this._year,
    };
  }
}
