-- ==============================================================================
-- Smart Internal Assessment and Assignment Monitoring System for Faculty
-- Database Schema for MySQL 8.0+
-- Database Name: smart_assessment
--
-- IMPORTANT NOTICE:
-- The database starts completely empty. There are NO preloaded, demo, or default
-- accounts inserted. All users must register through the web application.
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS smart_assessment
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE smart_assessment;

-- ------------------------------------------------------------------------------
-- 1. Departments Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 2. Subjects Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    semester INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 3. Users Table (Students, Faculty, Administrators)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'FACULTY', 'ADMIN') NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NULL, -- e.g. "1st Year", "2nd Year", "3rd Year", "4th Year", or "Faculty/Staff"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_department (department),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 4. Assignments Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    assigned_date DATE NOT NULL,
    due_date DATETIME NOT NULL,
    maximum_marks DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    faculty_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignments_faculty
        FOREIGN KEY (faculty_id) REFERENCES users(id)
        ON DELETE CASCADE,
    INDEX idx_assignment_faculty (faculty_id),
    INDEX idx_assignment_due_date (due_date),
    INDEX idx_assignment_subject (subject)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 5. Submissions Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    submission_notes TEXT NULL,
    submitted_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    marks DECIMAL(5, 2) NULL,
    feedback TEXT NULL,
    graded_date DATETIME NULL,
    status ENUM('SUBMITTED', 'GRADED') NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_assignment UNIQUE (assignment_id, student_id),
    CONSTRAINT fk_submissions_assignment
        FOREIGN KEY (assignment_id) REFERENCES assignments(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_submissions_student
        FOREIGN KEY (student_id) REFERENCES users(id)
        ON DELETE CASCADE,
    INDEX idx_submission_student (student_id),
    INDEX idx_submission_assignment (assignment_id),
    INDEX idx_submission_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 6. Internal Assessments Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS internal_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject VARCHAR(120) NOT NULL,
    test_1 DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    test_2 DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    assignment_marks DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    attendance_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    total_marks DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    faculty_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_subject_assessment UNIQUE (student_id, subject),
    CONSTRAINT fk_assessments_student
        FOREIGN KEY (student_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_assessments_faculty
        FOREIGN KEY (faculty_id) REFERENCES users(id)
        ON DELETE SET NULL,
    INDEX idx_assessment_student (student_id),
    INDEX idx_assessment_subject (subject)
) ENGINE=InnoDB;

-- ==============================================================================
-- END OF SCHEMA
-- Note: NO INSERT statements are included. The database begins empty.
-- ==============================================================================
