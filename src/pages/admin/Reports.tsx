import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import {
  Printer,
  BarChart3,
  PieChart as PieChartIcon,
  Award,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const AdminReports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports/performance');
        if (res.data.success) {
          setReportData(res.data.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load institutional reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { metrics, subjectBreakdown = [], categoryDistribution = [] } = reportData || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Accreditation & Academic Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            College-level assessment metrics, grade distribution percentiles, and departmental syllabus outcomes
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Official Report</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Institutional Standing */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall College Performance Index
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-black text-slate-900">{metrics?.overallPercentage || 0}%</span>
            <StatusBadge status={metrics?.overallCategory || 'N/A'} className="text-sm px-3 py-1" />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Evaluated across {metrics?.totalAssessments || 0} student assessment records
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Test 1 Avg</span>
            <span className="text-base font-bold text-slate-800">{metrics?.test1Average || 0}</span>
            <span className="text-[9px] text-slate-400 block">/ 30</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Test 2 Avg</span>
            <span className="text-base font-bold text-slate-800">{metrics?.test2Average || 0}</span>
            <span className="text-[9px] text-slate-400 block">/ 30</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Assign Avg</span>
            <span className="text-base font-bold text-slate-800">{metrics?.assignmentAverage || 0}</span>
            <span className="text-[9px] text-slate-400 block">/ 20</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Attendance</span>
            <span className="text-base font-bold text-slate-800">{metrics?.attendanceAverage || 0}%</span>
            <span className="text-[9px] text-slate-400 block">Average</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Score Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Subject-wise Average Marks</h3>
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>

          {subjectBreakdown.length === 0 ? (
            <EmptyState
              title="No subject data"
              description="Subject metrics will appear when internal assessments are logged."
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(val: any) => [`${val}%`, 'Score']}
                  />
                  <Bar dataKey="averagePercentage" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Grade Distribution Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Campus-Wide Grade Classification</h3>
            <PieChartIcon className="w-4 h-4 text-indigo-600" />
          </div>

          {metrics?.totalAssessments === 0 ? (
            <EmptyState
              title="No assessment data"
              description="Student distributions will render when scores are calculated."
            />
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {categoryDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
