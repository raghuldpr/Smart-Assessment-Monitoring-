export type AssignmentStatus = 'Not Submitted' | 'Submitted' | 'Graded' | 'Overdue';

export interface AssignmentRow {
  id: number;
  title: string;
  subject: string;
  description: string;
  assigned_date: string | Date;
  due_date: string | Date;
  maximum_marks: number | string;
  faculty_id: number;
  faculty_name?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export class Assignment {
  private _id: number;
  private _title: string;
  private _subject: string;
  private _description: string;
  private _assignedDate: string;
  private _dueDate: string;
  private _maximumMarks: number;
  private _facultyId: number;
  private _facultyName?: string;
  private _createdAt: string;
  private _updatedAt: string;

  constructor(data: AssignmentRow) {
    this._id = data.id;
    this._title = data.title;
    this._subject = data.subject;
    this._description = data.description;
    this._assignedDate = typeof data.assigned_date === 'string' ? data.assigned_date : new Date(data.assigned_date).toISOString().split('T')[0];
    this._dueDate = typeof data.due_date === 'string' ? data.due_date : new Date(data.due_date).toISOString();
    this._maximumMarks = Number(data.maximum_marks);
    this._facultyId = data.faculty_id;
    this._facultyName = data.faculty_name;
    this._createdAt = data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString();
    this._updatedAt = data.updated_at ? new Date(data.updated_at).toISOString() : new Date().toISOString();
  }

  public get id(): number { return this._id; }
  public get title(): string { return this._title; }
  public get subject(): string { return this._subject; }
  public get description(): string { return this._description; }
  public get assignedDate(): string { return this._assignedDate; }
  public get dueDate(): string { return this._dueDate; }
  public get maximumMarks(): number { return this._maximumMarks; }
  public get facultyId(): number { return this._facultyId; }
  public get facultyName(): string | undefined { return this._facultyName; }
  public get createdAt(): string { return this._createdAt; }
  public get updatedAt(): string { return this._updatedAt; }

  public isOverdue(): boolean {
    return new Date(this._dueDate).getTime() < Date.now();
  }

  public getStatus(hasSubmitted: boolean, isGraded: boolean): AssignmentStatus {
    if (isGraded) return 'Graded';
    if (hasSubmitted) return 'Submitted';
    if (this.isOverdue()) return 'Overdue';
    return 'Not Submitted';
  }

  public static validate(data: Partial<AssignmentRow>): { isValid: boolean; error?: string } {
    if (!data.title || data.title.trim().length === 0) {
      return { isValid: false, error: 'Assignment title is required' };
    }
    if (!data.subject || data.subject.trim().length === 0) {
      return { isValid: false, error: 'Subject is required' };
    }
    if (!data.due_date || isNaN(new Date(data.due_date).getTime())) {
      return { isValid: false, error: 'A valid due date is required' };
    }
    const maxMarks = Number(data.maximum_marks);
    if (isNaN(maxMarks) || maxMarks <= 0) {
      return { isValid: false, error: 'Maximum marks must be a positive number' };
    }
    return { isValid: true };
  }

  public toJSON() {
    return {
      id: this._id,
      title: this._title,
      subject: this._subject,
      description: this._description,
      assigned_date: this._assignedDate,
      due_date: this._dueDate,
      maximum_marks: this._maximumMarks,
      faculty_id: this._facultyId,
      faculty_name: this._facultyName,
      is_overdue: this.isOverdue(),
      created_at: this._createdAt,
      updated_at: this._updatedAt,
    };
  }
}
