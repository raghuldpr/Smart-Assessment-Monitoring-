import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { StatCard } from '../../components/StatCard.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import {
  Users,
  BookOpen,
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const FacultyDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load faculty dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
        {error || 'Unable to retrieve dashboard data.'}
      </div>
    );
  }

  const { cards, recentSubmissions = [], upcomingDeadlines = [], subjectStats = [] } = data;

  return (
    <div className="space-y-6">
      {/* Top Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Faculty Management Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor course enrollment, evaluate student submissions, and record internal assessments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/faculty/assignments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-sm transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Assignment</span>
          </Link>
          <Link
            to="/faculty/assessments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-sm transition shadow-2xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Record Marks</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          id="stat-faculty-students"
          title="Total Students"
          value={cards.totalStudents || 0}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          id="stat-faculty-assignments"
          title="My Assignments"
          value={cards.totalAssignments || 0}
          icon={<BookOpen className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          id="stat-faculty-pending"
          title="Pending Evaluation"
          value={cards.pendingSubmissions || 0}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          id="stat-faculty-graded"
          title="Graded Submissions"
          value={cards.gradedSubmissions || 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          id="stat-faculty-perf"
          title="Class Performance"
          value={`${cards.averageClassPerformance || 0}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="slate"
        />
      </div>

      {/* Chart & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-sm border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Class Performance by Subject</h3>
            <Link to="/faculty/reports" className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1">
              Complete Reports <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {subjectStats.length === 0 ? (
            <EmptyState
              title="No subject assessments recorded"
              description="Record test and assignment marks to visualize class performance metrics here."
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '2px', border: '1px solid #cbd5e1', fontSize: '12px', fontFamily: 'monospace' }}
                    formatter={(val: any) => [`${val}%`, 'Avg Score']}
                  />
                  <Bar dataKey="averagePercentage" fill="#0f172a" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-sm border border-slate-200 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Course Deadlines</h3>
            <Link to="/faculty/assignments" className="text-xs text-slate-700 hover:text-slate-900 font-semibold">Manage</Link>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No active upcoming deadlines.</p>
            ) : (
              upcomingDeadlines.map((item: any) => (
                <div key={item.id} className="p-3 rounded-sm border border-slate-200 bg-slate-50/70">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">{item.title}</h4>
                    <span className="text-[10px] font-mono font-medium text-slate-500 shrink-0">
                      {new Date(item.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">{item.subject}</p>
                  <div className="mt-2 text-[10px] font-mono text-slate-400">
                    Max Marks: {item.maximum_marks}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Submissions Requiring Attention */}
      <div className="bg-white rounded-sm border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Student Submissions</h3>
            <p className="text-xs text-slate-500">Submissions received from enrolled students across your courses</p>
          </div>
          <Link to="/faculty/submissions" className="text-xs font-semibold text-slate-900 hover:underline">
            View All Submissions
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <EmptyState
            title="No submissions available"
            description="When enrolled students submit work for your assignments, they will show up here for grading."
          />
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-sm">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Assignment</th>
                  <th className="py-2.5 px-3">File Reference</th>
                  <th className="py-2.5 px-3">Submitted At</th>
                  <th className="py-2.5 px-3">Evaluation</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {recentSubmissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {sub.student_name || 'Student'}
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">{sub.student_email}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800">{sub.assignment_title}</span>
                      <span className="block text-[10px] font-mono text-slate-500">{sub.subject}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{sub.file_name}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{new Date(sub.submitted_date).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={sub.status === 'GRADED' ? 'Graded' : 'Submitted'} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to="/faculty/submissions"
                        className="text-xs font-bold text-slate-900 hover:underline"
                      >
                        {sub.status === 'GRADED' ? 'Review Grade' : 'Grade Now →'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
