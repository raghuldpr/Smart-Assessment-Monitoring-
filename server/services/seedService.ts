import bcrypt from 'bcryptjs';
import { userRepo, assignmentRepo, submissionRepo, assessmentRepo } from '../db/repositories.js';
import { dbManager, LocalRelationalAdapter, MySQLAdapter } from '../db/database.js';
import { InternalAssessment } from '../models/InternalAssessment.js';

export const PRECONFIGURED_STUDENTS = [
  {
    name: 'Abhishek Kumaran',
    email: 'abhishek@college.edu',
    rollNumber: 'CS2023001',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
  },
  {
    name: 'Rahul',
    email: 'rahul@college.edu',
    rollNumber: 'CS2023002',
    department: 'Computer Science & Engineering',
    year: '2nd Year',
  },
  {
    name: 'Priya Patel',
    email: 'priya@college.edu',
    rollNumber: 'IT2023015',
    department: 'Information Technology',
    year: '3rd Year',
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha@college.edu',
    rollNumber: 'CS2022045',
    department: 'Computer Science & Engineering',
    year: '4th Year',
  },
  {
    name: 'Vikram Verma',
    email: 'vikram@college.edu',
    rollNumber: 'EC2024018',
    department: 'Electronics & Communication',
    year: '2nd Year',
  },
];

export const PRECONFIGURED_FACULTY = [
  {
    name: 'Dr. Sarah Connor',
    email: 'faculty@college.edu',
    department: 'Computer Science & Engineering',
    title: 'Professor & HOD',
    subjects: ['Data Structures & Algorithms', 'Database Management Systems'],
  },
  {
    name: 'Prof. Rajesh Kumar',
    email: 'rajesh@college.edu',
    department: 'Computer Science & Engineering',
    title: 'Associate Professor',
    subjects: ['Operating Systems', 'Computer Networks'],
  },
];

export async function seedCollegeSampleData(targetStudentId?: number): Promise<{
  usersCreated: number;
  assignmentsCreated: number;
  submissionsCreated: number;
  assessmentsCreated: number;
}> {
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  let usersCreated = 0;
  let assignmentsCreated = 0;
  let submissionsCreated = 0;
  let assessmentsCreated = 0;

  // 1. Ensure Primary Faculty accounts
  let primaryFaculty = await userRepo.findByEmail('faculty@college.edu');
  if (!primaryFaculty) {
    primaryFaculty = await userRepo.create({
      name: 'Dr. Sarah Connor',
      email: 'faculty@college.edu',
      password_hash: defaultPasswordHash,
      role: 'FACULTY',
      department: 'Computer Science & Engineering',
      year: null,
    });
    usersCreated++;
  }

  let secondaryFaculty = await userRepo.findByEmail('rajesh@college.edu');
  if (!secondaryFaculty) {
    secondaryFaculty = await userRepo.create({
      name: 'Prof. Rajesh Kumar',
      email: 'rajesh@college.edu',
      password_hash: defaultPasswordHash,
      role: 'FACULTY',
      department: 'Computer Science & Engineering',
      year: null,
    });
    usersCreated++;
  }

  // 2. Ensure Admin account
  let admin = await userRepo.findByEmail('admin@college.edu');
  if (!admin) {
    admin = await userRepo.create({
      name: 'Prof. David Miller',
      email: 'admin@college.edu',
      password_hash: defaultPasswordHash,
      role: 'ADMIN',
      department: 'Academic Affairs',
      year: null,
    });
    usersCreated++;
  }

  // 3. Ensure the 5 Preconfigured Fake Student accounts
  const studentMap = new Map<string, any>();

  for (const s of PRECONFIGURED_STUDENTS) {
    let student = await userRepo.findByEmail(s.email);
    if (!student) {
      student = await userRepo.create({
        name: s.name,
        email: s.email,
        password_hash: defaultPasswordHash,
        role: 'STUDENT',
        department: s.department,
        year: s.year,
      });
      usersCreated++;
    }
    studentMap.set(s.email, student);
  }

  // Determine all student IDs that should receive sample submissions and marks
  const studentIds = new Set<number>();
  for (const s of studentMap.values()) {
    if (s && s.id) studentIds.add(s.id);
  }
  if (targetStudentId) studentIds.add(targetStudentId);

  // Also include any other registered students in database
  const adapter = dbManager.getAdapter();
  if (adapter.getEngine() === 'LocalRelational') {
    const local = adapter as LocalRelationalAdapter;
    const allUsers = local.getTable('users');
    allUsers.filter((u) => u.role === 'STUDENT').forEach((u) => studentIds.add(u.id));
  } else {
    const mysql = adapter as MySQLAdapter;
    const allStudents = await mysql.query<any>('SELECT id FROM users WHERE role = "STUDENT"');
    allStudents.forEach((s) => studentIds.add(s.id));
  }

  // 4. Sample Assignments
  const sampleAssignmentsConfig = [
    {
      title: 'Data Structures Lab 1: Binary Search Tree Implementation',
      subject: 'Data Structures & Algorithms',
      description: 'Implement binary search tree insertion, node deletion, and recursive traversals in C++ or Python with time-complexity analysis.',
      daysFromNow: 5,
      maximumMarks: 100,
      facultyId: primaryFaculty.id,
    },
    {
      title: 'DBMS Lab 2: SQL Normalization & Complex Query Execution',
      subject: 'Database Management Systems',
      description: 'Normalize an unnormalized university schema to 3NF and construct optimized multi-table JOIN queries with execution plan benchmarks.',
      daysFromNow: 9,
      maximumMarks: 50,
      facultyId: primaryFaculty.id,
    },
    {
      title: 'Operating Systems Assignment: CPU Scheduling Algorithms',
      subject: 'Operating Systems',
      description: 'Simulate Round Robin (quantum=4ms) vs Shortest Job First (SJF) and calculate turnaround and waiting time metric tables.',
      daysFromNow: 2,
      maximumMarks: 100,
      facultyId: secondaryFaculty.id,
    },
    {
      title: 'Computer Networks: Socket Communication Client-Server Protocol',
      subject: 'Computer Networks',
      description: 'Develop a multi-threaded TCP client-server application handling concurrent packet transmissions and socket timeouts.',
      daysFromNow: 14,
      maximumMarks: 100,
      facultyId: secondaryFaculty.id,
    },
  ];

  const existingAssignments = await assignmentRepo.findAll({});
  const assignmentMap = new Map<string, any>();

  for (const cfg of sampleAssignmentsConfig) {
    let existing = existingAssignments.find((a) => a.title === cfg.title);
    if (!existing) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + cfg.daysFromNow);
      const assignedDate = new Date().toISOString().split('T')[0];
      existing = await assignmentRepo.create({
        title: cfg.title,
        subject: cfg.subject,
        description: cfg.description,
        assigned_date: assignedDate,
        due_date: dueDate.toISOString().slice(0, 16).replace('T', ' '),
        maximum_marks: cfg.maximumMarks,
        faculty_id: cfg.facultyId,
      });
      assignmentsCreated++;
    }
    assignmentMap.set(cfg.title, existing);
  }

  // 5. Sample Submissions for each student
  const a1 = assignmentMap.get('Data Structures Lab 1: Binary Search Tree Implementation');
  const a2 = assignmentMap.get('DBMS Lab 2: SQL Normalization & Complex Query Execution');
  const a3 = assignmentMap.get('Operating Systems Assignment: CPU Scheduling Algorithms');

  for (const studentId of studentIds) {
    const studentSubs = await submissionRepo.findAll({ studentId });

    // Assignment 1 -> GRADED submission
    if (a1 && !studentSubs.some((s) => s.assignment_id === a1.id)) {
      const createdSub = await submissionRepo.create({
        assignment_id: a1.id,
        student_id: studentId,
        file_name: 'BST_Implementation_and_Report.pdf',
        submission_notes: 'Implemented recursive and iterative BST insertion, deletion, and in-order traversal with O(h) complexity benchmarks.',
      });
      // Grade it with distinct realistic score based on student id
      const score = 88 + (studentId % 10);
      await submissionRepo.grade(createdSub.id, Math.min(100, score), 'Outstanding work! Code is clean, modular, and traversal benchmarks are accurate.');
      submissionsCreated++;
    }

    // Assignment 2 -> GRADED for Abhishek & Rahul
    if (a2 && (studentId === studentMap.get('abhishek@college.edu')?.id || studentId === studentMap.get('rahul@college.edu')?.id)) {
      if (!studentSubs.some((s) => s.assignment_id === a2.id)) {
        const createdSub = await submissionRepo.create({
          assignment_id: a2.id,
          student_id: studentId,
          file_name: 'SQL_Schema_Normalization_3NF.sql',
          submission_notes: 'Schema normalization scripts and multi-table inner/outer join query execution plan benchmarks.',
        });
        await submissionRepo.grade(createdSub.id, 47, 'Very good relational decomposition and clean indexes applied.');
        submissionsCreated++;
      }
    }

    // Assignment 3 -> SUBMITTED (Pending review by faculty)
    if (a3 && !studentSubs.some((s) => s.assignment_id === a3.id)) {
      await submissionRepo.create({
        assignment_id: a3.id,
        student_id: studentId,
        file_name: 'CPU_Scheduling_Simulation.zip',
        submission_notes: 'Includes C++ simulation source code, Gantt chart ASCII graphs, and average waiting time comparison tables.',
      });
      submissionsCreated++;
    }

    // 6. Sample Internal Assessments (Fixed calculation & upsert method)
    const studentAssessments = await assessmentRepo.findAll({ studentId });
    const assessmentTemplates = [
      {
        subject: 'Data Structures & Algorithms',
        test_1: 26 + (studentId % 4),
        test_2: 27 + (studentId % 3),
        assignment_marks: 18 + (studentId % 3),
        attendance_percentage: 92 + (studentId % 7),
        faculty_id: primaryFaculty.id,
      },
      {
        subject: 'Database Management Systems',
        test_1: 24 + (studentId % 5),
        test_2: 25 + (studentId % 4),
        assignment_marks: 17 + (studentId % 3),
        attendance_percentage: 88 + (studentId % 8),
        faculty_id: primaryFaculty.id,
      },
      {
        subject: 'Operating Systems',
        test_1: 27 + (studentId % 3),
        test_2: 26 + (studentId % 4),
        assignment_marks: 19,
        attendance_percentage: 95,
        faculty_id: secondaryFaculty.id,
      },
      {
        subject: 'Computer Networks',
        test_1: 23 + (studentId % 5),
        test_2: 24 + (studentId % 5),
        assignment_marks: 16 + (studentId % 4),
        attendance_percentage: 86 + (studentId % 10),
        faculty_id: secondaryFaculty.id,
      },
    ];

    for (const rec of assessmentTemplates) {
      const hasAssessment = studentAssessments.some(
        (ia) => ia.subject.toLowerCase() === rec.subject.toLowerCase()
      );
      if (!hasAssessment) {
        const calculated = InternalAssessment.calculateTotals(
          rec.test_1,
          rec.test_2,
          rec.assignment_marks,
          rec.attendance_percentage
        );
        await assessmentRepo.upsert({
          student_id: studentId,
          subject: rec.subject,
          test_1: rec.test_1,
          test_2: rec.test_2,
          assignment_marks: rec.assignment_marks,
          attendance_percentage: rec.attendance_percentage,
          total_marks: calculated.totalMarks,
          percentage: calculated.percentage,
          faculty_id: rec.faculty_id,
        });
        assessmentsCreated++;
      }
    }
  }

  return {
    usersCreated,
    assignmentsCreated,
    submissionsCreated,
    assessmentsCreated,
  };
}
