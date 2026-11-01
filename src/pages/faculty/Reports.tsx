import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Printer,
  FileSpreadsheet,
  Award,
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

export const FacultyReports: React.FC = () => {
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
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Performance Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical analysis of internal evaluations, grade distribution charts, and subject averages
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Aggregate KPI Header */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Total Assessments</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{metrics?.totalAssessments || 0}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Test 1 Average</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{metrics?.test1Average || 0}</span>
          <span className="text-[9px] text-slate-400">/ 30</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Test 2 Average</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{metrics?.test2Average || 0}</span>
          <span className="text-[9px] text-slate-400">/ 30</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Assignment Avg</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{metrics?.assignmentAverage || 0}</span>
          <span className="text-[9px] text-slate-400">/ 20</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Class Standing</span>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="text-xl font-black text-slate-900">{metrics?.overallPercentage || 0}%</span>
            <StatusBadge status={metrics?.overallCategory || 'N/A'} />
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Score Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Subject-wise Average Marks</h3>
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>

          {subjectBreakdown.length === 0 ? (
            <EmptyState
              title="No assessment data"
              description="Record student internal assessment marks to populate subject charts."
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(val: any) => [`${val}%`, 'Avg Marks']}
                  />
                  <Bar dataKey="averagePercentage" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Grade Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Student Grade Classification</h3>
            <PieChartIcon className="w-4 h-4 text-indigo-600" />
          </div>

          {metrics?.totalAssessments === 0 ? (
            <EmptyState
              title="No grades distributed"
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

      {/* Subject Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">Consolidated Subject Breakdown</h3>
        </div>

        {subjectBreakdown.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 italic">
            No subject records available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4 text-center">Test 1 Avg (/30)</th>
                  <th className="py-2.5 px-4 text-center">Test 2 Avg (/30)</th>
                  <th className="py-2.5 px-4 text-center">Assignment Avg (/20)</th>
                  <th className="py-2.5 px-4 text-center">Attendance Avg</th>
                  <th className="py-2.5 px-4 text-right">Class Average %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjectBreakdown.map((s: any) => (
                  <tr key={s.subject} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{s.subject}</td>
                    <td className="py-2.5 px-4 text-center">{s.test1Average}</td>
                    <td className="py-2.5 px-4 text-center">{s.test2Average}</td>
                    <td className="py-2.5 px-4 text-center">{s.assignmentAverage}</td>
                    <td className="py-2.5 px-4 text-center">{s.attendanceAverage}%</td>
                    <td className="py-2.5 px-4 text-right font-black text-indigo-700">
                      {s.averagePercentage}%
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
