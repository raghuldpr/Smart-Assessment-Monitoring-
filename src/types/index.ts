export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  year?: string | null;
  created_at: string;
  updated_at: string;
  academicSummary?: {
    assignmentsSubmitted: number;
    assignmentsTotal: number;
    averageMarks: number;
    averageAttendance: number;
    performanceCategory: string;
  };
  assignedSubjects?: string[];
}

export type AssignmentStatus = 'Not Submitted' | 'Submitted' | 'Graded' | 'Overdue';

export interface Assignment {
  id: number;
  title: string;
  subject: string;
  description: string;
  assigned_date: string;
  due_date: string;
  maximum_marks: number;
  faculty_id: number;
  faculty_name?: string;
  is_overdue: boolean;
  student_status?: AssignmentStatus;
  submission?: Submission | null;
  created_at: string;
  updated_at: string;
}

export type SubmissionStatus = 'SUBMITTED' | 'GRADED';

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  file_name: string;
  submission_notes?: string | null;
  submitted_date: string;
  marks?: number | null;
  feedback?: string | null;
  graded_date?: string | null;
  status: SubmissionStatus;
  is_graded: boolean;
  percentage?: number | null;
  student_name?: string;
  student_email?: string;
  assignment_title?: string;
  subject?: string;
  maximum_marks?: number;
}

export type PerformanceCategory = 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';

export interface InternalAssessment {
  id: number;
  student_id: number;
  subject: string;
  test_1: number;
  test_2: number;
  assignment_marks: number;
  attendance_percentage: number;
  total_marks: number;
  percentage: number;
  faculty_id?: number | null;
  performance_category: PerformanceCategory;
  student_name?: string;
  student_email?: string;
  department?: string;
  year?: string | null;
}

export interface DashboardData {
  role: UserRole;
  cards: Record<string, any>;
  recentAssignments?: Assignment[];
  upcomingDeadlines?: any[];
  recentGrades?: Submission[];
  recentSubmissions?: Submission[];
  performanceChart?: any[];
  charts?: Record<string, any>;
  subjectStats?: any[];
  assessmentsCount?: number;
}
