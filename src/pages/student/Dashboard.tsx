import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { StatCard } from '../../components/StatCard.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Calendar,
  ArrowRight,
  TrendingUp,
  Sparkles,
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

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSeedSampleData = async () => {
    try {
      setSeeding(true);
      await api.post('/dashboard/seed-sample-data');
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || 'Failed to load sample college data');
    } finally {
      setSeeding(false);
    }
  };

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
        {error || 'Unable to retrieve dashboard.'}
      </div>
    );
  }

  const { cards, recentAssignments = [], upcomingDeadlines = [], recentGrades = [], performanceChart = [] } = data;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Academic Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time overview of your assignments, submissions, internal marks, and attendance
          </p>
        </div>

        {cards.totalAssignments === 0 && (
          <button
            onClick={handleSeedSampleData}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm bg-slate-900 text-white text-xs font-bold font-mono uppercase tracking-wider hover:bg-slate-800 transition shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{seeding ? 'Populating Data...' : 'Load Sample College Coursework'}</span>
          </button>
        )}
      </div>

      {cards.totalAssignments === 0 && (
        <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Empty Academic Record
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your faculty has not published any coursework yet. Click the button to automatically populate realistic Computer Science subjects, assignments, upcoming deadlines, and sample grades.
            </p>
          </div>
          <button
            onClick={handleSeedSampleData}
            disabled={seeding}
            className="shrink-0 px-3.5 py-2 rounded-sm bg-slate-900 text-white text-xs font-bold font-mono uppercase tracking-wider hover:bg-slate-800 transition shadow-xs disabled:opacity-50"
          >
            {seeding ? 'Loading Sample Data...' : 'Populate Sample Data'}
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          id="stat-total-assignments"
          title="Total Assignments"
          value={cards.totalAssignments || 0}
          icon={<BookOpen className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          id="stat-submitted"
          title="Submitted"
          value={cards.submittedAssignments || 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          id="stat-pending"
          title="Pending"
          value={cards.pendingAssignments || 0}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          id="stat-avg-marks"
          title="Average Marks"
          value={`${cards.averageMarks || 0}%`}
          icon={<Award className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          id="stat-attendance"
          title="Attendance"
          value={`${cards.attendance || 0}%`}
          icon={<Calendar className="w-5 h-5" />}
          color="slate"
        />
      </div>

      {/* Performance Chart & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-sm border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-900" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Subject-wise Assessment Percentage</h3>
            </div>
            <Link to="/student/performance" className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1">
              View Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {performanceChart.length === 0 ? (
            <EmptyState
              title="No assessments recorded"
              description="Your internal marks will appear in this chart once faculty records them."
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceChart} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fontFamily: 'monospace' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '2px', border: '1px solid #cbd5e1', fontSize: '12px', fontFamily: 'monospace' }}
                    formatter={(val: any) => [`${val}%`, 'Score']}
                  />
                  <Bar dataKey="percentage" fill="#0f172a" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-sm border border-slate-200 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Upcoming Deadlines</h3>
            <Link to="/student/assignments" className="text-xs text-slate-700 hover:text-slate-900 font-semibold">All</Link>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No upcoming deadlines.</p>
            ) : (
              upcomingDeadlines.map((item: any) => (
                <div key={item.id} className="p-3 rounded-sm border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">{item.title}</h4>
                    <span className="text-[10px] font-mono font-medium text-slate-500 shrink-0">
                      {new Date(item.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">{item.subject}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">Max Marks: {item.maximum_marks}</span>
                    {item.submitted ? (
                      <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Submitted
                      </span>
                    ) : (
                      <Link
                        to="/student/assignments"
                        className="text-[11px] text-slate-900 hover:underline font-bold"
                      >
                        Submit Now →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Assignments & Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <div className="bg-white rounded-sm border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Assignments</h3>
            <Link to="/student/assignments" className="text-xs font-semibold text-slate-900 hover:underline">
              View All
            </Link>
          </div>

          {recentAssignments.length === 0 ? (
            <EmptyState
              title="No assignments created yet"
              description="Faculty has not assigned any homework or projects yet."
            />
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-sm">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {recentAssignments.map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{a.title}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{a.subject}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {new Date(a.due_date).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={a.student_status || 'Not Submitted'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Grades */}
        <div className="bg-white rounded-sm border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Evaluated Grades</h3>
            <Link to="/student/submissions" className="text-xs font-semibold text-slate-900 hover:underline">
              View Submissions
            </Link>
          </div>

          {recentGrades.length === 0 ? (
            <EmptyState
              title="No grades received yet"
              description="Evaluations will appear here once faculty assesses your submissions."
            />
          ) : (
            <div className="space-y-3">
              {recentGrades.map((g: any) => (
                <div key={g.id} className="p-3 rounded-sm border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{g.assignment_title}</h4>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-300">
                      {g.marks} / {g.maximum_marks || 100}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">{g.subject}</p>
                  {g.feedback && (
                    <p className="text-xs text-slate-700 mt-2 italic bg-white p-2 rounded-sm border border-slate-200">
                      "{g.feedback}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
