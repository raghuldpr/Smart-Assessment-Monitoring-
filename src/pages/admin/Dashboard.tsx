import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { StatCard } from '../../components/StatCard.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import {
  Users,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  FileCheck2,
  BarChart3,
  PieChart as PieChartIcon,
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

export const AdminDashboard: React.FC = () => {
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
        setError(err.message || 'Failed to load administrator dashboard');
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

  const { cards, charts = {} } = data;
  const { studentsByDepartment = [], userDistribution = [], performanceDistribution = [] } = charts;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Administration Portal</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Campus-wide monitoring of students, faculty accounts, course assignments, and assessment metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          id="stat-admin-users"
          title="Total Registered Users"
          value={cards.totalUsers || 0}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          id="stat-admin-students"
          title="Total Students"
          value={cards.totalStudents || 0}
          icon={<GraduationCap className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          id="stat-admin-faculty"
          title="Total Faculty"
          value={cards.totalFaculty || 0}
          icon={<ShieldCheck className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          id="stat-admin-assignments"
          title="Course Assignments"
          value={cards.totalAssignments || 0}
          icon={<BookOpen className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          id="stat-admin-submissions"
          title="Submissions Logged"
          value={cards.totalSubmissions || 0}
          icon={<FileCheck2 className="w-5 h-5" />}
          color="slate"
        />
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Department */}
        <div className="bg-white rounded-sm border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Student Enrollment by Department</h3>
            <BarChart3 className="w-4 h-4 text-slate-700" />
          </div>

          {studentsByDepartment.length === 0 ? (
            <EmptyState
              title="No students registered yet"
              description="Department distribution will display when students complete their registration."
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsByDepartment} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="department" tick={{ fontSize: 9, fontFamily: 'monospace' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '2px', border: '1px solid #cbd5e1', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <Bar dataKey="count" fill="#0f172a" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* User Role Distribution */}
        <div className="bg-white rounded-sm border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Campus Account Composition</h3>
            <PieChartIcon className="w-4 h-4 text-slate-700" />
          </div>

          {cards.totalUsers === 0 ? (
            <EmptyState
              title="Database is empty"
              description="Users will appear once accounts are created via the registration portal."
            />
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {userDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '2px', border: '1px solid #cbd5e1', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Institutional Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="p-5 bg-white rounded-sm border border-slate-200 hover:border-slate-400 hover:shadow-xs transition group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-slate-100 text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Manage User Directory</h4>
              <p className="text-xs text-slate-500 mt-0.5">Control roles and access permissions</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/assessments"
          className="p-5 bg-white rounded-sm border border-slate-200 hover:border-slate-400 hover:shadow-xs transition group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-slate-100 text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Audit Assessments</h4>
              <p className="text-xs text-slate-500 mt-0.5">Review faculty internal marks</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/reports"
          className="p-5 bg-white rounded-sm border border-slate-200 hover:border-slate-400 hover:shadow-xs transition group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-slate-100 text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Accreditation Reports</h4>
              <p className="text-xs text-slate-500 mt-0.5">Institutional marks distributions</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
