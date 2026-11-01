import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-sm border border-dashed border-slate-300 bg-slate-50/60"
    >
      <div className="p-3 bg-white rounded-sm shadow-2xs border border-slate-200 text-slate-500 mb-3">
        {icon || <FolderOpen className="w-5 h-5" />}
      </div>
      <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center px-3.5 py-1.5 border border-transparent text-xs font-semibold rounded-sm text-white bg-slate-900 hover:bg-slate-800 transition shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
