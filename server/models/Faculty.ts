import { User, UserRow } from './User.js';

/**
 * Faculty domain class inheriting from base User
 * Demonstrates OOP Inheritance and role-specific methods
 */
export class Faculty extends User {
  private _assignedSubjects: string[];

  constructor(data: UserRow, subjects: string[] = []) {
    if (data.role !== 'FACULTY') {
      throw new Error(`Invalid role for Faculty entity: ${data.role}`);
    }
    super(data);
    this._assignedSubjects = subjects;
  }

  // Polymorphic override of getRoleTitle
  public override getRoleTitle(): string {
    return `Faculty Professor (${this._department})`;
  }

  public get assignedSubjects(): string[] {
    return [...this._assignedSubjects];
  }

  public setAssignedSubjects(subjects: string[]): void {
    this._assignedSubjects = [...subjects];
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      assignedSubjects: this._assignedSubjects,
    };
  }
}
