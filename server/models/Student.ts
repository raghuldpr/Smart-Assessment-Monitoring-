import { User, UserRow } from './User.js';

export interface StudentAcademicSummary {
  assignmentsSubmitted: number;
  assignmentsTotal: number;
  averageMarks: number;
  averageAttendance: number;
  performanceCategory: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement' | 'N/A';
}

/**
 * Student domain class inheriting from base User
 * Demonstrates OOP Inheritance and Polymorphic customization
 */
export class Student extends User {
  private _academicSummary?: StudentAcademicSummary;

  constructor(data: UserRow, summary?: StudentAcademicSummary) {
    if (data.role !== 'STUDENT') {
      throw new Error(`Invalid role for Student entity: ${data.role}`);
    }
    super(data);
    this._academicSummary = summary;
  }

  // Polymorphic override of getRoleTitle
  public override getRoleTitle(): string {
    return `Student (${this._department} - ${this._year || 'General'})`;
  }

  public get academicSummary(): StudentAcademicSummary | undefined {
    return this._academicSummary;
  }

  public setAcademicSummary(summary: StudentAcademicSummary): void {
    this._academicSummary = summary;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      academicSummary: this._academicSummary,
    };
  }
}
