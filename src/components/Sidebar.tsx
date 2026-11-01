import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  LayoutDashboard,
  User,
  Users,
  BookOpen,
  FileCheck2,
  Award,
  BarChart3,
  ShieldCheck,
  GraduationCap,
  ClipboardList,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'My Profile', icon: User },
    { to: '/student/assignments', label: 'Assignments', icon: BookOpen },
    { to: '/student/submissions', label: 'Submissions', icon: FileCheck2 },
    { to: '/student/assessments', label: 'Assessments', icon: Award },
    { to: '/student/performance', label: 'Performance', icon: BarChart3 },
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/students', label: 'Students', icon: Users },
    { to: '/faculty/assignments', label: 'Assignments', icon: BookOpen },
    { to: '/faculty/submissions', label: 'Submissions', icon: FileCheck2 },
    { to: '/faculty/assessments', label: 'Assessments', icon: Award },
    { to: '/faculty/reports', label: 'Reports', icon: BarChart3 },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/students', label: 'Students', icon: GraduationCap },
    { to: '/admin/faculty', label: 'Faculty', icon: ShieldCheck },
    { to: '/admin/assignments', label: 'Assignments', icon: BookOpen },
    { to: '/admin/assessments', label: 'Assessments', icon: ClipboardList },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ];

  const links = role === 'STUDENT' ? studentLinks : role === 'FACULTY' ? facultyLinks : adminLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200 bg-white flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 lg:hidden">
          <span className="text-sm font-bold text-slate-900 tracking-tight">Navigation Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 hidden lg:block">
          <div className="flex items-center gap-3 px-2.5 py-2 rounded-sm bg-slate-50 border border-slate-200/80">
            <div className="w-8 h-8 rounded-sm bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase font-mono shadow-2xs">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate leading-snug">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate font-mono">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {role} Portal
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-sm transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
