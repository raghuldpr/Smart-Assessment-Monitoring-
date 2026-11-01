import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import api from '../../services/api.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Award, TrendingUp, BarChart3, CheckCircle2, Calendar, BookOpen } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const StudentPerformance: React.FC = () => {
  const { user } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await api.get(`/reports/student/${user.id}`);
        if (res.data.success) {
          setReport(res.data.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load performance report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const metrics = report?.metrics || {
    totalAssessments: 0,
    test1Average: 0,
    test2Average: 0,
    assignmentAverage: 0,
    attendanceAverage: 0,
    attendancePercentage: 0,
    overallPercentage: 0,
    category: 'N/A',
  };

  const performanceCategory = metrics.category || metrics.overallCategory || 'N/A';
  const chartData = report?.subjectChart || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Performance Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Consolidated performance metrics, test averages, assignment progress, and subject scores
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Aggregate Score Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Academic Standing
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-black text-slate-900">{metrics.overallPercentage}%</span>
            <StatusBadge status={performanceCategory} className="text-sm px-3 py-1" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Based on {metrics.totalAssessments} registered internal assessment evaluations
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Test 1 Avg</span>
            <span className="text-base font-bold text-slate-800">{metrics.test1Average}</span>
            <span className="text-[9px] text-slate-400 block">/ 30</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Test 2 Avg</span>
            <span className="text-base font-bold text-slate-800">{metrics.test2Average}</span>
            <span className="text-[9px] text-slate-400 block">/ 30</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Assign Avg</span>
            <span className="text-base font-bold text-slate-800">{metrics.assignmentAverage}</span>
            <span className="text-[9px] text-slate-400 block">/ 20</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Attendance</span>
            <span className="text-base font-bold text-slate-800">{metrics.attendanceAverage}%</span>
            <span className="text-[9px] text-slate-400 block">Semester</span>
          </div>
        </div>
      </div>

      {/* Recharts Component */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Test 1 vs Test 2 Comparison by Subject</h3>
            <p className="text-xs text-slate-500">Compare your progress between internal test cycles</p>
          </div>
          <BarChart3 className="w-5 h-5 text-indigo-600" />
        </div>

        {chartData.length === 0 ? (
          <EmptyState
            title="No comparative data"
            description="Comparative metrics will populate as soon as faculty inputs assessment marks."
          />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 30]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="test1" name="Test 1 (Max 30)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="test2" name="Test 2 (Max 30)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Performance Grading Scale Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Institutional Performance Classification Matrix
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
            <span className="text-xs font-bold text-emerald-800">Excellent (90% – 100%)</span>
            <p className="text-[11px] text-emerald-700 mt-1">Outstanding grasp of concepts, high attendance.</p>
          </div>
          <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50">
            <span className="text-xs font-bold text-blue-800">Good (75% – 89%)</span>
            <p className="text-[11px] text-blue-700 mt-1">Consistent performance across tests and projects.</p>
          </div>
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
            <span className="text-xs font-bold text-amber-800">Average (60% – 74%)</span>
            <p className="text-[11px] text-amber-700 mt-1">Meets minimum passing requirements.</p>
          </div>
          <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50">
            <span className="text-xs font-bold text-rose-800">Needs Improvement (&lt; 60%)</span>
            <p className="text-[11px] text-rose-700 mt-1">Requires remedial tests, assignments, or attendance recovery.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
