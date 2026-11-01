import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { DashboardLayout } from './layouts/DashboardLayout.js';
import { UserRole } from './types/index.js';

// Auth Pages
import { Login } from './pages/auth/Login.js';
import { Register } from './pages/auth/Register.js';

// Student Pages
import { StudentDashboard } from './pages/student/Dashboard.js';
import { StudentProfile } from './pages/student/Profile.js';
import { StudentAssignments } from './pages/student/Assignments.js';
import { StudentSubmissions } from './pages/student/Submissions.js';
import { StudentAssessments } from './pages/student/Assessments.js';
import { StudentPerformance } from './pages/student/Performance.js';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/Dashboard.js';
import { FacultyStudents } from './pages/faculty/Students.js';
import { FacultyAssignments } from './pages/faculty/Assignments.js';
import { FacultySubmissions } from './pages/faculty/Submissions.js';
import { FacultyAssessments } from './pages/faculty/Assessments.js';
import { FacultyReports } from './pages/faculty/Reports.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard.js';
import { AdminUsers } from './pages/admin/Users.js';
import { AdminStudents } from './pages/admin/Students.js';
import { AdminFaculty } from './pages/admin/Faculty.js';
import { AdminAssignments } from './pages/admin/Assignments.js';
import { AdminAssessments } from './pages/admin/Assessments.js';
import { AdminReports } from './pages/admin/Reports.js';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Smart Assessment System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to proper role dashboard
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Application Routes under DashboardLayout */}
          <Route element={<DashboardLayout />}>
            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/submissions"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentSubmissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assessments"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentAssessments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/performance"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentPerformance />
                </ProtectedRoute>
              }
            />

            {/* Faculty Routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/students"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultyStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/assignments"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultyAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/submissions"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultySubmissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/assessments"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultyAssessments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/reports"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultyReports />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/faculty"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminFaculty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assignments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assessments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminAssessments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
