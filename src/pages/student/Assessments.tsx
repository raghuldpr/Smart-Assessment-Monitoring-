import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { InternalAssessment } from '../../types/index.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Award, BookOpen, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';

export const StudentAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<InternalAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/assessments');
        if (res.data.success) {
          setAssessments(res.data.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load assessments');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Internal Assessments & Marks</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Official semester internal assessment scores comprising Test 1, Test 2, assignments, and attendance
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : assessments.length === 0 ? (
        <EmptyState
          title="No assessments recorded"
          description="Faculty has not published any internal assessment records for your registered profile yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assessments.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {a.subject}
                  </span>
                  <StatusBadge status={a.performance_category} />
                </div>

                <div className="flex items-baseline justify-between mt-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Consolidated Percentage</span>
                    <div className="text-2xl font-black text-slate-900">{a.percentage}%</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-medium">Total Marks</span>
                    <div className="text-lg font-bold text-slate-700">{a.total_marks} / 80</div>
                  </div>
                </div>

                {/* Score Breakdown Table */}
                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Test 1</span>
                    <span className="text-sm font-bold text-slate-800">{a.test_1}</span>
                    <span className="text-[9px] text-slate-400 block">/ 30</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Test 2</span>
                    <span className="text-sm font-bold text-slate-800">{a.test_2}</span>
                    <span className="text-[9px] text-slate-400 block">/ 30</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Assign.</span>
                    <span className="text-sm font-bold text-slate-800">{a.assignment_marks}</span>
                    <span className="text-[9px] text-slate-400 block">/ 20</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Attend.</span>
                    <span className="text-sm font-bold text-slate-800">{a.attendance_percentage}%</span>
                    <span className="text-[9px] text-slate-400 block">Recorded</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  Category: <strong>{a.performance_category}</strong>
                </span>
                <span className="text-[11px] text-slate-400">
                  Standard Scale
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
