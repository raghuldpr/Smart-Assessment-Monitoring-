export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  department: string;
  year?: string | null;
  created_at?: string | Date;
  updated_at?: string | Date;
}

/**
 * Base User class demonstrating Encapsulation and Data Abstraction.
 * Sensitive fields (password_hash) are encapsulated and filtered out in public projections.
 */
export class User {
  protected _id: number;
  protected _name: string;
  protected _email: string;
  protected _passwordHash: string;
  protected _role: UserRole;
  protected _department: string;
  protected _year: string | null;
  protected _createdAt: string;
  protected _updatedAt: string;

  constructor(data: UserRow) {
    this._id = data.id;
    this._name = data.name;
    this._email = data.email.toLowerCase().trim();
    this._passwordHash = data.password_hash;
    this._role = data.role;
    this._department = data.department;
    this._year = data.year || null;
    this._createdAt = data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString();
    this._updatedAt = data.updated_at ? new Date(data.updated_at).toISOString() : new Date().toISOString();
  }

  // Encapsulated Getters
  public get id(): number { return this._id; }
  public get name(): string { return this._name; }
  public get email(): string { return this._email; }
  public get passwordHash(): string { return this._passwordHash; }
  public get role(): UserRole { return this._role; }
  public get department(): string { return this._department; }
  public get year(): string | null { return this._year; }
  public get createdAt(): string { return this._createdAt; }
  public get updatedAt(): string { return this._updatedAt; }

  // Encapsulated Setters with validation
  public setName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    this._name = name.trim();
  }

  public setDepartment(dept: string): void {
    if (!dept || dept.trim().length === 0) {
      throw new Error('Department is required');
    }
    this._department = dept.trim();
  }

  public setYear(year: string | null): void {
    this._year = year;
  }

  public hasRole(requiredRole: UserRole | UserRole[]): boolean {
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(this._role);
    }
    return this._role === requiredRole;
  }

  /**
   * Polymorphic method to get role-specific display badge/title
   */
  public getRoleTitle(): string {
    switch (this._role) {
      case 'STUDENT': return 'Student';
      case 'FACULTY': return 'Faculty Member';
      case 'ADMIN': return 'System Administrator';
      default: return 'User';
    }
  }

  /**
   * Encapsulation: Ensure password_hash is never exposed in client-facing payloads
   */
  public toJSON(): Omit<UserRow, 'password_hash'> {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      role: this._role,
      department: this._department,
      year: this._year,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
    };
  }

  /**
   * For database storage
   */
  public toDbRow(): UserRow {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      password_hash: this._passwordHash,
      role: this._role,
      department: this._department,
      year: this._year,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
    };
  }
}
