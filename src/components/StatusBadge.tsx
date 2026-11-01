import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-300/80';

  switch (status) {
    case 'Not Submitted':
      style = 'bg-amber-50/90 text-amber-800 border-amber-300';
      break;
    case 'Submitted':
      style = 'bg-blue-50/90 text-blue-800 border-blue-300';
      break;
    case 'Graded':
      style = 'bg-emerald-50/90 text-emerald-800 border-emerald-300';
      break;
    case 'Overdue':
      style = 'bg-rose-50/90 text-rose-800 border-rose-300';
      break;
    case 'Excellent':
      style = 'bg-emerald-100/80 text-emerald-900 border-emerald-400 font-bold';
      break;
    case 'Good':
      style = 'bg-blue-100/80 text-blue-900 border-blue-400 font-bold';
      break;
    case 'Average':
      style = 'bg-amber-100/80 text-amber-900 border-amber-400 font-bold';
      break;
    case 'Needs Improvement':
      style = 'bg-rose-100/80 text-rose-900 border-rose-400 font-bold';
      break;
    case 'STUDENT':
      style = 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
      break;
    case 'FACULTY':
      style = 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold';
      break;
    case 'ADMIN':
      style = 'bg-slate-900 text-white border-slate-900 font-bold';
      break;
    default:
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold uppercase tracking-wider border whitespace-nowrap shadow-2xs ${style} ${className}`}
    >
      {status}
    </span>
  );
};
