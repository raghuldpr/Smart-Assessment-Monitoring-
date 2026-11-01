export type SubmissionStatus = 'SUBMITTED' | 'GRADED';

export interface SubmissionRow {
  id: number;
  assignment_id: number;
  student_id: number;
  file_name: string;
  submission_notes?: string | null;
  submitted_date: string | Date;
  marks?: number | string | null;
  feedback?: string | null;
  graded_date?: string | Date | null;
  status: SubmissionStatus;
  student_name?: string;
  student_email?: string;
  assignment_title?: string;
  subject?: string;
  maximum_marks?: number | string;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export class Submission {
  private _id: number;
  private _assignmentId: number;
  private _studentId: number;
  private _fileName: string;
  private _submissionNotes: string | null;
  private _submittedDate: string;
  private _marks: number | null;
  private _feedback: string | null;
  private _gradedDate: string | null;
  private _status: SubmissionStatus;

  // Joined fields
  private _studentName?: string;
  private _studentEmail?: string;
  private _assignmentTitle?: string;
  private _subject?: string;
  private _maximumMarks?: number;

  constructor(data: SubmissionRow) {
    this._id = data.id;
    this._assignmentId = data.assignment_id;
    this._studentId = data.student_id;
    this._fileName = data.file_name;
    this._submissionNotes = data.submission_notes || null;
    this._submittedDate = typeof data.submitted_date === 'string' ? data.submitted_date : new Date(data.submitted_date).toISOString();
    this._marks = data.marks !== undefined && data.marks !== null ? Number(data.marks) : null;
    this._feedback = data.feedback || null;
    this._gradedDate = data.graded_date ? new Date(data.graded_date).toISOString() : null;
    this._status = data.status;

    this._studentName = data.student_name;
    this._studentEmail = data.student_email;
    this._assignmentTitle = data.assignment_title;
    this._subject = data.subject;
    this._maximumMarks = data.maximum_marks !== undefined && data.maximum_marks !== null ? Number(data.maximum_marks) : undefined;
  }

  public get id(): number { return this._id; }
  public get assignmentId(): number { return this._assignmentId; }
  public get studentId(): number { return this._studentId; }
  public get fileName(): string { return this._fileName; }
  public get submissionNotes(): string | null { return this._submissionNotes; }
  public get submittedDate(): string { return this._submittedDate; }
  public get marks(): number | null { return this._marks; }
  public get feedback(): string | null { return this._feedback; }
  public get gradedDate(): string | null { return this._gradedDate; }
  public get status(): SubmissionStatus { return this._status; }

  public isGraded(): boolean {
    return this._status === 'GRADED' && this._marks !== null;
  }

  public calculatePercentage(): number | null {
    if (this._marks === null || !this._maximumMarks || this._maximumMarks <= 0) {
      return null;
    }
    return Number(((this._marks / this._maximumMarks) * 100).toFixed(2));
  }

  public toJSON() {
    return {
      id: this._id,
      assignment_id: this._assignmentId,
      student_id: this._studentId,
      file_name: this._fileName,
      submission_notes: this._submissionNotes,
      submitted_date: this._submittedDate,
      marks: this._marks,
      feedback: this._feedback,
      graded_date: this._gradedDate,
      status: this._status,
      is_graded: this.isGraded(),
      percentage: this.calculatePercentage(),
      student_name: this._studentName,
      student_email: this._studentEmail,
      assignment_title: this._assignmentTitle,
      subject: this._subject,
      maximum_marks: this._maximumMarks,
    };
  }
}
