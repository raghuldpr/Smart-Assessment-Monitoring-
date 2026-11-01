import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Submission } from '../../types/index.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Calendar, FileText, Award, MessageSquare, Search } from 'lucide-react';

export const StudentSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/submissions');
        if (res.data.success) {
          setSubmissions(res.data.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter(
    (s) =>
      s.assignment_title?.toLowerCase().includes(search.toLowerCase()) ||
      s.subject?.toLowerCase().includes(search.toLowerCase()) ||
      s.file_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assignment Submissions</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          History of all submitted coursework, assigned evaluations, and professor remarks
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by assignment, subject, or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No submissions available"
          description="You have not submitted any assignments yet. Browse assignments to make your first submission."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                    {sub.subject}
                  </span>
                  <StatusBadge status={sub.status === 'GRADED' ? 'Graded' : 'Submitted'} />
                </div>

                <h3 className="text-sm font-bold text-slate-900">{sub.assignment_title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {sub.file_name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Submitted: {new Date(sub.submitted_date).toLocaleString()}
                  </span>
                </div>

                {sub.submission_notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Notes:</span> {sub.submission_notes}
                  </p>
                )}

                {sub.feedback && (
                  <div className="flex items-start gap-2 bg-indigo-50/60 p-3 rounded-lg border border-indigo-100 text-xs text-indigo-900">
                    <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Faculty Feedback:</span> {sub.feedback}
                    </div>
                  </div>
                )}
              </div>

              {/* Evaluation score badge */}
              <div className="flex flex-col items-end justify-center shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
                {sub.is_graded ? (
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-medium">Evaluation Score</span>
                    <div className="text-xl font-extrabold text-emerald-600 flex items-center gap-1 justify-end">
                      <Award className="w-5 h-5 text-emerald-500" />
                      {sub.marks} / {sub.maximum_marks || 100}
                    </div>
                    {sub.percentage !== null && (
                      <span className="text-[11px] font-semibold text-emerald-700">
                        {sub.percentage}% Score
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      Pending Evaluation
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
