import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Submission } from '../../types/index.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Modal } from '../../components/Modal.js';
import {
  Search,
  CheckCircle2,
  Clock,
  Award,
  FileText,
  Calendar,
  MessageSquare,
  AlertCircle,
  Edit3,
} from 'lucide-react';

export const FacultySubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Grading Modal
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [marks, setMarks] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [gradeSuccess, setGradeSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const openGradingModal = (sub: Submission) => {
    setActiveSubmission(sub);
    setMarks(sub.marks !== null && sub.marks !== undefined ? sub.marks : '');
    setFeedback(sub.feedback || '');
    setGradeError(null);
    setGradeSuccess(null);
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;

    const maxMarks = activeSubmission.maximum_marks || 100;
    if (marks === '' || Number(marks) < 0 || Number(marks) > maxMarks) {
      setGradeError(`Marks must be a valid number between 0 and ${maxMarks}.`);
      return;
    }

    setGrading(true);
    setGradeError(null);

    try {
      const res = await api.put(`/submissions/${activeSubmission.id}/grade`, {
        marks: Number(marks),
        feedback,
      });

      if (res.data.success) {
        setGradeSuccess('Evaluation and grade saved successfully.');
        setTimeout(() => {
          setActiveSubmission(null);
          fetchSubmissions();
        }, 1000);
      }
    } catch (err: any) {
      setGradeError(err.message || 'Failed to grade submission');
    } finally {
      setGrading(false);
    }
  };

  const filtered = submissions.filter((s) => {
    const matchesSearch =
      s.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.student_email?.toLowerCase().includes(search.toLowerCase()) ||
      s.assignment_title?.toLowerCase().includes(search.toLowerCase()) ||
      s.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Assignment Evaluations</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review student uploaded files, examine submission timestamps, and grade coursework with constructive feedback
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student, email, or assignment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="">All Submission Statuses</option>
            <option value="SUBMITTED">Pending Evaluation</option>
            <option value="GRADED">Graded & Evaluated</option>
          </select>
        </div>
      </div>

      {/* Table of Submissions */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No submissions available"
          description="There are currently no student submissions matching your search filters."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Assignment / Subject</th>
                  <th className="py-3 px-4">File Reference</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Marks Awarded</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{sub.student_name}</div>
                      <div className="text-[10px] text-slate-400">{sub.student_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{sub.assignment_title}</div>
                      <div className="text-[10px] text-indigo-600 font-semibold">{sub.subject}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {sub.file_name}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(sub.submitted_date).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {sub.is_graded ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {sub.marks} / {sub.maximum_marks || 100} ({sub.percentage}%)
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal italic">Ungraded</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={sub.status === 'GRADED' ? 'Graded' : 'Submitted'} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openGradingModal(sub)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                          sub.is_graded
                            ? 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                            : 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{sub.is_graded ? 'Edit Grade' : 'Grade'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      <Modal
        isOpen={!!activeSubmission}
        onClose={() => setActiveSubmission(null)}
        title={`Evaluate: ${activeSubmission?.student_name || 'Student Submission'}`}
      >
        <form onSubmit={handleGrade} className="space-y-4">
          {gradeError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{gradeError}</span>
            </div>
          )}

          {gradeSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{gradeSuccess}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
            <div>
              <span className="text-slate-400">Assignment:</span>{' '}
              <strong className="text-slate-800">{activeSubmission?.assignment_title}</strong> (
              {activeSubmission?.subject})
            </div>
            <div>
              <span className="text-slate-400">Submitted File:</span>{' '}
              <code className="font-mono text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">
                {activeSubmission?.file_name}
              </code>
            </div>
            {activeSubmission?.submission_notes && (
              <div>
                <span className="text-slate-400">Student Notes:</span>{' '}
                <span className="text-slate-700 italic">"{activeSubmission.submission_notes}"</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Marks Awarded (Max: {activeSubmission?.maximum_marks || 100})
            </label>
            <input
              type="number"
              required
              min={0}
              max={activeSubmission?.maximum_marks || 100}
              value={marks}
              onChange={(e) => setMarks(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={`Enter marks from 0 to ${activeSubmission?.maximum_marks || 100}`}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Feedback & Evaluation Remarks
            </label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback, areas for improvement, or rubric remarks..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveSubmission(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={grading || !!gradeSuccess}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shadow-sm disabled:opacity-50"
            >
              {grading ? 'Saving...' : 'Save Evaluation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
