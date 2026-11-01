import { dbManager, MySQLAdapter, LocalRelationalAdapter } from './database.js';
import { UserRow, UserRole } from '../models/User.js';
import { AssignmentRow } from '../models/Assignment.js';
import { SubmissionRow } from '../models/Submission.js';
import { InternalAssessmentRow } from '../models/InternalAssessment.js';

export class UserRepository {
  public async findByEmail(email: string): Promise<UserRow | null> {
    const adapter = dbManager.getAdapter();
    const cleanEmail = email.toLowerCase().trim();

    if (adapter.getEngine() === 'MySQL') {
      const rows = await (adapter as MySQLAdapter).query<UserRow>(
        'SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
        [cleanEmail]
      );
      return rows[0] || null;
    } else {
      const local = (adapter as LocalRelationalAdapter).getTable('users');
      const found = local.find((u) => u.email.toLowerCase() === cleanEmail);
      return found || null;
    }
  }

  public async findById(id: number): Promise<UserRow | null> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      const rows = await (adapter as MySQLAdapter).query<UserRow>(
        'SELECT * FROM users WHERE id = ? LIMIT 1',
        [id]
      );
      return rows[0] || null;
    } else {
      const local = (adapter as LocalRelationalAdapter).getTable('users');
      const found = local.find((u) => u.id === Number(id));
      return found || null;
    }
  }

  public async create(data: {
    name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    department: string;
    year?: string | null;
  }): Promise<UserRow> {
    const adapter = dbManager.getAdapter();
    const cleanEmail = data.email.toLowerCase().trim();

    if (adapter.getEngine() === 'MySQL') {
      const res = await (adapter as MySQLAdapter).execute(
        `INSERT INTO users (name, email, password_hash, role, department, year)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.name.trim(), cleanEmail, data.password_hash, data.role, data.department.trim(), data.year || null]
      );
      const inserted = await this.findById(res.insertId!);
      return inserted!;
    } else {
      const local = adapter as LocalRelationalAdapter;
      // Check duplicate
      const exists = local.getTable('users').some((u) => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        throw new Error('Email address is already registered');
      }
      const record = local.insert('users', {
        name: data.name.trim(),
        email: cleanEmail,
        password_hash: data.password_hash,
        role: data.role,
        department: data.department.trim(),
        year: data.year || null,
      });
      return record;
    }
  }

  public async findAll(filters: {
    role?: string;
    department?: string;
    search?: string;
  }): Promise<UserRow[]> {
    const adapter = dbManager.getAdapter();

    if (adapter.getEngine() === 'MySQL') {
      let sql = 'SELECT id, name, email, role, department, year, created_at, updated_at FROM users WHERE 1=1';
      const params: any[] = [];

      if (filters.role) {
        sql += ' AND role = ?';
        params.push(filters.role);
      }
      if (filters.department) {
        sql += ' AND department = ?';
        params.push(filters.department);
      }
      if (filters.search) {
        sql += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      sql += ' ORDER BY created_at DESC';
      return await (adapter as MySQLAdapter).query<UserRow>(sql, params);
    } else {
      const local = (adapter as LocalRelationalAdapter).getTable('users');
      let result = [...local];
      if (filters.role) {
        result = result.filter((u) => u.role === filters.role);
      }
      if (filters.department) {
        result = result.filter((u) => u.department.toLowerCase() === filters.department?.toLowerCase());
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }

  public async update(id: number, data: Partial<{ name: string; department: string; year: string | null; role: UserRole }>): Promise<boolean> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      const fields: string[] = [];
      const params: any[] = [];
      if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name); }
      if (data.department !== undefined) { fields.push('department = ?'); params.push(data.department); }
      if (data.year !== undefined) { fields.push('year = ?'); params.push(data.year); }
      if (data.role !== undefined) { fields.push('role = ?'); params.push(data.role); }
      if (fields.length === 0) return true;
      params.push(id);
      const res = await (adapter as MySQLAdapter).execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
      return res.affectedRows > 0;
    } else {
      return (adapter as LocalRelationalAdapter).update('users', Number(id), data);
    }
  }

  public async delete(id: number): Promise<boolean> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      const res = await (adapter as MySQLAdapter).execute('DELETE FROM users WHERE id = ?', [id]);
      return res.affectedRows > 0;
    } else {
      return (adapter as LocalRelationalAdapter).delete('users', Number(id));
    }
  }
}

export class AssignmentRepository {
  public async create(data: {
    title: string;
    subject: string;
    description: string;
    assigned_date: string;
    due_date: string;
    maximum_marks: number;
    faculty_id: number;
  }): Promise<AssignmentRow> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      const res = await (adapter as MySQLAdapter).execute(
        `INSERT INTO assignments (title, subject, description, assigned_date, due_date, maximum_marks, faculty_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [data.title, data.subject, data.description, data.assigned_date, data.due_date, data.maximum_marks, data.faculty_id]
      );
      const rows = await (adapter as MySQLAdapter).query<AssignmentRow>(
        `SELECT a.*, u.name as faculty_name
         FROM assignments a
         JOIN users u ON a.faculty_id = u.id
         WHERE a.id = ? LIMIT 1`,
        [res.insertId!]
      );
      return rows[0];
    } else {
      const local = adapter as LocalRelationalAdapter;
      const user = local.getTable('users').find((u) => u.id === data.faculty_id);
      const rec = local.insert('assignments', {
        ...data,
      });
      return {
        ...rec,
        faculty_name: user?.name || 'Faculty',
      };
    }
  }

  public async findAll(filters: {
    facultyId?: number;
    subject?: string;
    search?: string;
  }): Promise<AssignmentRow[]> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      let sql = `
        SELECT a.*, u.name as faculty_name
        FROM assignments a
        LEFT JOIN users u ON a.faculty_id = u.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (filters.facultyId) {
        sql += ' AND a.faculty_id = ?';
        params.push(filters.facultyId);
      }
      if (filters.subject) {
        sql += ' AND a.subject = ?';
        params.push(filters.subject);
      }
      if (filters.search) {
        sql += ' AND (a.title LIKE ? OR a.description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      sql += ' ORDER BY a.due_date ASC';
      return await (adapter as MySQLAdapter).query<AssignmentRow>(sql, params);
    } else {
      const local = adapter as LocalRelationalAdapter;
      const users = local.getTable('users');
      let assignments = local.getTable('assignments').map((a) => {
        const fac = users.find((u) => u.id === a.faculty_id);
        return {
          ...a,
          faculty_name: fac?.name || 'Faculty',
        };
      });

      if (filters.facultyId) {
        assignments = assignments.filter((a) => a.faculty_id === Number(filters.facultyId));
      }
      if (filters.subject) {
        assignments = assignments.filter((a) => a.subject.toLowerCase() === filters.subject?.toLowerCase());
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        assignments = assignments.filter((a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
      }
      return assignments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    }
  }

  public async findById(id: number): Promise<AssignmentRow | null> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      const rows = await (adapter as MySQLAdapter).query<AssignmentRow>(
        `SELECT a.*, u.name as faculty_name
         FROM assignments a
         LEFT JOIN users u ON a.faculty_id = u.id
         WHERE a.id = ? LIMIT 1`,
        [id]
      );
      return rows[0] || null;
    } else {
      const local = adapter as LocalRelationalAdapter;
      const item = local.getTable('assignments').find((a) => a.id === Number(id));
      if (!item) return null;
      const fac = local.getTable('users').find((u) => u.id === item.faculty_id);
      return { ...item, faculty_name: fac?.name || 'Faculty' };
    }
  }

  public async update(id: number, data: Partial<AssignmentRow>): Promise<boolean> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      const fields: string[] = [];
      const params: any[] = [];
      if (data.title !== undefined) { fields.push('title = ?'); params.push(data.title); }
      if (data.subject !== undefined) { fields.push('subject = ?'); params.push(data.subject); }
      if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description); }
      if (data.due_date !== undefined) { fields.push('due_date = ?'); params.push(data.due_date); }
      if (data.maximum_marks !== undefined) { fields.push('maximum_marks = ?'); params.push(data.maximum_marks); }
      if (fields.length === 0) return true;
      params.push(id);
      const res = await (adapter as MySQLAdapter).execute(`UPDATE assignments SET ${fields.join(', ')} WHERE id = ?`, params);
      return res.affectedRows > 0;
    } else {
      return (adapter as LocalRelationalAdapter).update('assignments', Number(id), data);
    }
  }

  public async delete(id: number): Promise<boolean> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      const res = await (adapter as MySQLAdapter).execute('DELETE FROM assignments WHERE id = ?', [id]);
      return res.affectedRows > 0;
    } else {
      return (adapter as LocalRelationalAdapter).delete('assignments', Number(id));
    }
  }
}

export class SubmissionRepository {
  public async create(data: {
    assignment_id: number;
    student_id: number;
    file_name: string;
    submission_notes?: string | null;
  }): Promise<SubmissionRow> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      const res = await (adapter as MySQLAdapter).execute(
        `INSERT INTO submissions (assignment_id, student_id, file_name, submission_notes, status)
         VALUES (?, ?, ?, ?, 'SUBMITTED')`,
        [data.assignment_id, data.student_id, data.file_name, data.submission_notes || null]
      );
      const row = await this.findById(res.insertId!);
      return row!;
    } else {
      const local = adapter as LocalRelationalAdapter;
      // Prevent duplicate submission check
      const duplicate = local.getTable('submissions').some(
        (s) => s.assignment_id === data.assignment_id && s.student_id === data.student_id
      );
      if (duplicate) {
        throw new Error('You have already submitted this assignment.');
      }
      const record = local.insert('submissions', {
        assignment_id: data.assignment_id,
        student_id: data.student_id,
        file_name: data.file_name,
        submission_notes: data.submission_notes || null,
        submitted_date: new Date().toISOString(),
        marks: null,
        feedback: null,
        graded_date: null,
        status: 'SUBMITTED',
      });
      return await this.findById(record.id) as SubmissionRow;
    }
  }

  public async findById(id: number): Promise<SubmissionRow | null> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      const rows = await (adapter as MySQLAdapter).query<SubmissionRow>(
        `SELECT s.*, u.name as student_name, u.email as student_email,
                a.title as assignment_title, a.subject, a.maximum_marks
         FROM submissions s
         JOIN users u ON s.student_id = u.id
         JOIN assignments a ON s.assignment_id = a.id
         WHERE s.id = ? LIMIT 1`,
        [id]
      );
      return rows[0] || null;
    } else {
      const local = adapter as LocalRelationalAdapter;
      const sub = local.getTable('submissions').find((s) => s.id === Number(id));
      if (!sub) return null;
      const student = local.getTable('users').find((u) => u.id === sub.student_id);
      const assignment = local.getTable('assignments').find((a) => a.id === sub.assignment_id);
      return {
        ...sub,
        student_name: student?.name || 'Student',
        student_email: student?.email || '',
        assignment_title: assignment?.title || 'Assignment',
        subject: assignment?.subject || '',
        maximum_marks: assignment?.maximum_marks || 100,
      };
    }
  }

  public async findByAssignmentAndStudent(assignmentId: number, studentId: number): Promise<SubmissionRow | null> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      const rows = await (adapter as MySQLAdapter).query<SubmissionRow>(
        'SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ? LIMIT 1',
        [assignmentId, studentId]
      );
      return rows[0] || null;
    } else {
      const local = (adapter as LocalRelationalAdapter).getTable('submissions');
      return local.find((s) => s.assignment_id === Number(assignmentId) && s.student_id === Number(studentId)) || null;
    }
  }

  public async findAll(filters: {
    assignmentId?: number;
    studentId?: number;
    status?: string;
  }): Promise<SubmissionRow[]> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      let sql = `
        SELECT s.*, u.name as student_name, u.email as student_email,
                a.title as assignment_title, a.subject, a.maximum_marks
        FROM submissions s
        JOIN users u ON s.student_id = u.id
        JOIN assignments a ON s.assignment_id = a.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (filters.assignmentId) {
        sql += ' AND s.assignment_id = ?';
        params.push(filters.assignmentId);
      }
      if (filters.studentId) {
        sql += ' AND s.student_id = ?';
        params.push(filters.studentId);
      }
      if (filters.status) {
        sql += ' AND s.status = ?';
        params.push(filters.status);
      }
      sql += ' ORDER BY s.submitted_date DESC';
      return await (adapter as MySQLAdapter).query<SubmissionRow>(sql, params);
    } else {
      const local = adapter as LocalRelationalAdapter;
      const users = local.getTable('users');
      const assignments = local.getTable('assignments');

      let list = local.getTable('submissions').map((s) => {
        const student = users.find((u) => u.id === s.student_id);
        const assign = assignments.find((a) => a.id === s.assignment_id);
        return {
          ...s,
          student_name: student?.name || 'Student',
          student_email: student?.email || '',
          assignment_title: assign?.title || 'Assignment',
          subject: assign?.subject || '',
          maximum_marks: assign?.maximum_marks || 100,
        };
      });

      if (filters.assignmentId) {
        list = list.filter((s) => s.assignment_id === Number(filters.assignmentId));
      }
      if (filters.studentId) {
        list = list.filter((s) => s.student_id === Number(filters.studentId));
      }
      if (filters.status) {
        list = list.filter((s) => s.status === filters.status);
      }
      return list.sort((a, b) => new Date(b.submitted_date).getTime() - new Date(a.submitted_date).getTime());
    }
  }

  public async grade(id: number, marks: number, feedback: string): Promise<boolean> {
    const adapter = dbManager.getAdapter();
    const now = new Date().toISOString();
    if (adapter.getEngine() === 'MySQL') {
      const res = await (adapter as MySQLAdapter).execute(
        `UPDATE submissions
         SET marks = ?, feedback = ?, graded_date = ?, status = 'GRADED'
         WHERE id = ?`,
        [marks, feedback, now, id]
      );
      return res.affectedRows > 0;
    } else {
      return (adapter as LocalRelationalAdapter).update('submissions', Number(id), {
        marks,
        feedback,
        graded_date: now,
        status: 'GRADED',
      });
    }
  }
}

export class AssessmentRepository {
  public async upsert(data: {
    student_id: number;
    subject: string;
    test_1: number;
    test_2: number;
    assignment_marks: number;
    attendance_percentage: number;
    total_marks: number;
    percentage: number;
    faculty_id?: number | null;
  }): Promise<InternalAssessmentRow> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      await (adapter as MySQLAdapter).execute(
        `INSERT INTO internal_assessments
         (student_id, subject, test_1, test_2, assignment_marks, attendance_percentage, total_marks, percentage, faculty_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         test_1 = VALUES(test_1),
         test_2 = VALUES(test_2),
         assignment_marks = VALUES(assignment_marks),
         attendance_percentage = VALUES(attendance_percentage),
         total_marks = VALUES(total_marks),
         percentage = VALUES(percentage),
         faculty_id = VALUES(faculty_id)`,
        [
          data.student_id,
          data.subject,
          data.test_1,
          data.test_2,
          data.assignment_marks,
          data.attendance_percentage,
          data.total_marks,
          data.percentage,
          data.faculty_id || null,
        ]
      );
      const rows = await (adapter as MySQLAdapter).query<InternalAssessmentRow>(
        `SELECT ia.*, u.name as student_name, u.email as student_email, u.department, u.year
         FROM internal_assessments ia
         JOIN users u ON ia.student_id = u.id
         WHERE ia.student_id = ? AND ia.subject = ? LIMIT 1`,
        [data.student_id, data.subject]
      );
      return rows[0];
    } else {
      const local = adapter as LocalRelationalAdapter;
      const existing = local.getTable('internal_assessments').find(
        (ia) => ia.student_id === data.student_id && ia.subject.toLowerCase() === data.subject.toLowerCase()
      );

      if (existing) {
        local.update('internal_assessments', existing.id, data);
        const student = local.getTable('users').find((u) => u.id === data.student_id);
        return {
          ...existing,
          ...data,
          student_name: student?.name,
          student_email: student?.email,
          department: student?.department,
          year: student?.year,
        };
      } else {
        const created = local.insert('internal_assessments', data);
        const student = local.getTable('users').find((u) => u.id === data.student_id);
        return {
          ...created,
          student_name: student?.name,
          student_email: student?.email,
          department: student?.department,
          year: student?.year,
        };
      }
    }
  }

  public async findAll(filters: {
    studentId?: number;
    subject?: string;
    facultyId?: number;
  }): Promise<InternalAssessmentRow[]> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      let sql = `
        SELECT ia.*, u.name as student_name, u.email as student_email, u.department, u.year
        FROM internal_assessments ia
        JOIN users u ON ia.student_id = u.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (filters.studentId) {
        sql += ' AND ia.student_id = ?';
        params.push(filters.studentId);
      }
      if (filters.subject) {
        sql += ' AND ia.subject = ?';
        params.push(filters.subject);
      }
      if (filters.facultyId) {
        sql += ' AND ia.faculty_id = ?';
        params.push(filters.facultyId);
      }
      sql += ' ORDER BY ia.created_at DESC';
      return await (adapter as MySQLAdapter).query<InternalAssessmentRow>(sql, params);
    } else {
      const local = adapter as LocalRelationalAdapter;
      const users = local.getTable('users');

      let list = local.getTable('internal_assessments').map((ia) => {
        const student = users.find((u) => u.id === ia.student_id);
        return {
          ...ia,
          student_name: student?.name || 'Student',
          student_email: student?.email || '',
          department: student?.department || '',
          year: student?.year || '',
        };
      });

      if (filters.studentId) {
        list = list.filter((ia) => ia.student_id === Number(filters.studentId));
      }
      if (filters.subject) {
        list = list.filter((ia) => ia.subject.toLowerCase() === filters.subject?.toLowerCase());
      }
      if (filters.facultyId) {
        list = list.filter((ia) => ia.faculty_id === Number(filters.facultyId));
      }
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }

  public async findById(id: number): Promise<InternalAssessmentRow | null> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      const rows = await (adapter as MySQLAdapter).query<InternalAssessmentRow>(
        `SELECT ia.*, u.name as student_name, u.email as student_email, u.department, u.year
         FROM internal_assessments ia
         JOIN users u ON ia.student_id = u.id
         WHERE ia.id = ? LIMIT 1`,
        [id]
      );
      return rows[0] || null;
    } else {
      const local = adapter as LocalRelationalAdapter;
      const found = local.getTable('internal_assessments').find((ia) => ia.id === Number(id));
      if (!found) return null;
      const student = local.getTable('users').find((u) => u.id === found.student_id);
      return {
        ...found,
        student_name: student?.name,
        student_email: student?.email,
        department: student?.department,
        year: student?.year,
      };
    }
  }

  public async delete(id: number): Promise<boolean> {
    const adapter = dbManager.getAdapter();
    if (adapter.getEngine() === 'MySQL') {
      const res = await (adapter as MySQLAdapter).execute('DELETE FROM internal_assessments WHERE id = ?', [id]);
      return res.affectedRows > 0;
    } else {
      return (adapter as LocalRelationalAdapter).delete('internal_assessments', Number(id));
    }
  }
}

export const userRepo = new UserRepository();
export const assignmentRepo = new AssignmentRepository();
export const submissionRepo = new SubmissionRepository();
export const assessmentRepo = new AssessmentRepository();
