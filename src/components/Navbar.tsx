import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { StatusBadge } from './StatusBadge.js';
import { LogOut, Menu, UserCheck, GraduationCap } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-sm text-white shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
              Smart Assessment System
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400 hidden sm:block">
              College Academic & Assignment Monitoring
            </p>
          </div>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-900 leading-snug">{user.name}</span>
            <span className="text-xs text-slate-500 font-mono">
              {user.department} {user.year ? `• ${user.year}` : ''}
            </span>
          </div>

          <StatusBadge status={user.role} />

          <button
            onClick={logout}
            title="Sign out"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-sm border border-slate-200 hover:border-rose-200 transition shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};
