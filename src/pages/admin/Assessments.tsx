import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { InternalAssessment } from '../../types/index.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Search, Trash2, Award, User } from 'lucide-react';

export const AdminAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<InternalAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

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

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this assessment record?')) return;
    try {
      const res = await api.delete(`/assessments/${id}`);
      if (res.data.success) {
        fetchAssessments();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const subjects = Array.from(new Set(assessments.map((a) => a.subject)));
  const filtered = assessments.filter((a) => {
    const matchesSearch =
      a.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.student_email?.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = !subjectFilter || a.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Assessment Audit</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Central audit log of all recorded internal scores (Test 1, Test 2, Assignments, Attendance, Final Percentage)
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of Assessments */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No assessment records"
          description="There are currently no internal assessments matching your query."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-center">Test 1 (/30)</th>
                  <th className="py-3 px-4 text-center">Test 2 (/30)</th>
                  <th className="py-3 px-4 text-center">Assign (/20)</th>
                  <th className="py-3 px-4 text-center">Attendance</th>
                  <th className="py-3 px-4 text-center">Total (/80)</th>
                  <th className="py-3 px-4 text-center font-bold text-slate-900">Score %</th>
                  <th className="py-3 px-4 text-center">Category</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {a.student_name}
                      <span className="block text-[10px] text-slate-400 font-normal">{a.student_email}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{a.department}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{a.subject}</td>
                    <td className="py-3 px-4 text-center font-mono">{a.test_1}</td>
                    <td className="py-3 px-4 text-center font-mono">{a.test_2}</td>
                    <td className="py-3 px-4 text-center font-mono">{a.assignment_marks}</td>
                    <td className="py-3 px-4 text-center font-mono">{a.attendance_percentage}%</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">{a.total_marks}</td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-700">{a.percentage}%</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={a.performance_category} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Assessment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
