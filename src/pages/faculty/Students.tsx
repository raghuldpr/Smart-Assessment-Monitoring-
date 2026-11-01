import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { User } from '../../types/index.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Modal } from '../../components/Modal.js';
import { Search, UserCheck, Eye, GraduationCap, Mail, Building, Calendar, Award } from 'lucide-react';

export const FacultyStudents: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');

  // Student Report Modal
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [studentReport, setStudentReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users?role=STUDENT');
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleViewReport = async (student: User) => {
    setSelectedStudent(student);
    setReportLoading(true);
    try {
      const res = await api.get(`/reports/student/${student.id}`);
      if (res.data.success) {
        setStudentReport(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const departments = Array.from(new Set(students.map((s) => s.department).filter(Boolean)));
  const years = Array.from(new Set(students.map((s) => s.year).filter(Boolean)));

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !department || s.department === department;
    const matchesYear = !year || s.year === year;
    return matchesSearch && matchesDept && matchesYear;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Enrolled Students Directory</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Directory of registered students across departments, their enrollment status, and academic dossiers
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
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y as string}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of Students */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No students found"
          description="There are currently no registered students matching the search filters. Students must register their own accounts."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Performance</th>
                  <th className="py-3 px-4 text-right">Academic Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                        {s.name.charAt(0)}
                      </div>
                      <span>{s.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{s.email}</td>
                    <td className="py-3 px-4 text-slate-700">{s.department}</td>
                    <td className="py-3 px-4 text-slate-600">{s.year || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {s.academicSummary ? (
                        <StatusBadge status={s.academicSummary.performanceCategory} />
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewReport(s)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => {
          setSelectedStudent(null);
          setStudentReport(null);
        }}
        title={`Student Dossier: ${selectedStudent?.name || ''}`}
        maxWidth="xl"
      >
        {reportLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Student metadata */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Department:</span>
                <span className="font-semibold text-slate-800">{selectedStudent?.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Academic Year:</span>
                <span className="font-semibold text-slate-800">{selectedStudent?.year || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Email:</span>
                <span className="font-semibold text-slate-800">{selectedStudent?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Overall Standing:</span>
                <StatusBadge status={studentReport?.metrics?.overallCategory || 'N/A'} />
              </div>
            </div>

            {/* Performance metrics breakdown */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Test 1 Avg</span>
                <span className="text-sm font-bold text-slate-800">{studentReport?.metrics?.test1Average || 0}</span>
                <span className="text-[9px] text-slate-400 block">/ 30</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Test 2 Avg</span>
                <span className="text-sm font-bold text-slate-800">{studentReport?.metrics?.test2Average || 0}</span>
                <span className="text-[9px] text-slate-400 block">/ 30</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Assign Avg</span>
                <span className="text-sm font-bold text-slate-800">{studentReport?.metrics?.assignmentAverage || 0}</span>
                <span className="text-[9px] text-slate-400 block">/ 20</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Attendance</span>
                <span className="text-sm font-bold text-slate-800">{studentReport?.metrics?.attendanceAverage || 0}%</span>
                <span className="text-[9px] text-slate-400 block">Average</span>
              </div>
            </div>

            {/* Assessment Records list */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Subject Assessments</h4>
              {studentReport?.assessments?.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-3 text-center border rounded-lg bg-slate-50">
                  No internal assessment records entered for this student yet.
                </p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-2">Subject</th>
                        <th className="p-2 text-center">Test 1</th>
                        <th className="p-2 text-center">Test 2</th>
                        <th className="p-2 text-center">Assign</th>
                        <th className="p-2 text-center">Attend %</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-right">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentReport?.assessments?.map((a: any) => (
                        <tr key={a.id}>
                          <td className="p-2 font-medium text-slate-800">{a.subject}</td>
                          <td className="p-2 text-center">{a.test_1}</td>
                          <td className="p-2 text-center">{a.test_2}</td>
                          <td className="p-2 text-center">{a.assignment_marks}</td>
                          <td className="p-2 text-center">{a.attendance_percentage}%</td>
                          <td className="p-2 text-right font-bold">{a.percentage}%</td>
                          <td className="p-2 text-right">
                            <StatusBadge status={a.performance_category} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
