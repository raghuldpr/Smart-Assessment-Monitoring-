import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { InternalAssessment, User } from '../../types/index.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Modal } from '../../components/Modal.js';
import {
  Plus,
  Search,
  Award,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calculator,
  UserCheck,
} from 'lucide-react';

const COMMON_SUBJECTS = [
  'Data Structures & Algorithms',
  'Operating Systems',
  'Database Management Systems',
  'Computer Networks',
  'Software Engineering',
  'Artificial Intelligence',
  'Web Technologies',
  'Machine Learning',
];

export const FacultyAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<InternalAssessment[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');

  // Modal Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<InternalAssessment | null>(null);
  const [studentId, setStudentId] = useState<number | ''>('');
  const [subject, setSubject] = useState(COMMON_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [test1, setTest1] = useState<number>(0);
  const [test2, setTest2] = useState<number>(0);
  const [assignmentMarks, setAssignmentMarks] = useState<number>(0);
  const [attendance, setAttendance] = useState<number>(85);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assessRes, studentsRes] = await Promise.all([
        api.get('/assessments'),
        api.get('/users?role=STUDENT'),
      ]);

      if (assessRes.data.success) {
        setAssessments(assessRes.data.data);
      }
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assessment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingAssessment(null);
    setStudentId(students.length > 0 ? students[0].id : '');
    setSubject(COMMON_SUBJECTS[0]);
    setCustomSubject('');
    setTest1(0);
    setTest2(0);
    setAssignmentMarks(0);
    setAttendance(85);
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: InternalAssessment) => {
    setEditingAssessment(item);
    setStudentId(item.student_id);
    if (COMMON_SUBJECTS.includes(item.subject)) {
      setSubject(item.subject);
      setCustomSubject('');
    } else {
      setSubject('CUSTOM');
      setCustomSubject(item.subject);
    }
    setTest1(item.test_1);
    setTest2(item.test_2);
    setAssignmentMarks(item.assignment_marks);
    setAttendance(item.attendance_percentage);
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this assessment record permanently?')) return;
    try {
      const res = await api.delete(`/assessments/${id}`);
      if (res.data.success) {
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  // Live Auto-Calculation
  const calculatedTotal = Number((test1 + test2 + assignmentMarks).toFixed(2));
  // 80 marks academic portion (30+30+20) = 80%, Attendance = 20%
  const calculatedPercentage = Number(
    ((calculatedTotal / 80) * 80 + (attendance / 100) * 20).toFixed(2)
  );

  let liveCategory = 'Needs Improvement';
  if (calculatedPercentage >= 90) liveCategory = 'Excellent';
  else if (calculatedPercentage >= 75) liveCategory = 'Good';
  else if (calculatedPercentage >= 60) liveCategory = 'Average';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    if (!studentId) {
      setFormError('Please select a valid registered student.');
      setSaving(false);
      return;
    }

    const finalSubject = subject === 'CUSTOM' ? customSubject.trim() : subject;
    if (!finalSubject) {
      setFormError('Subject is required.');
      setSaving(false);
      return;
    }

    // Validation checks
    if (test1 < 0 || test1 > 30) {
      setFormError('Test 1 marks must be between 0 and 30.');
      setSaving(false);
      return;
    }
    if (test2 < 0 || test2 > 30) {
      setFormError('Test 2 marks must be between 0 and 30.');
      setSaving(false);
      return;
    }
    if (assignmentMarks < 0 || assignmentMarks > 20) {
      setFormError('Assignment marks must be between 0 and 20.');
      setSaving(false);
      return;
    }
    if (attendance < 0 || attendance > 100) {
      setFormError('Attendance must be between 0% and 100%.');
      setSaving(false);
      return;
    }

    try {
      if (editingAssessment) {
        const res = await api.put(`/assessments/${editingAssessment.id}`, {
          subject: finalSubject,
          test_1: Number(test1),
          test_2: Number(test2),
          assignment_marks: Number(assignmentMarks),
          attendance_percentage: Number(attendance),
        });
        if (res.data.success) {
          setFormSuccess('Assessment record updated successfully.');
          setTimeout(() => {
            setIsModalOpen(false);
            loadData();
          }, 1000);
        }
      } else {
        const res = await api.post('/assessments', {
          student_id: Number(studentId),
          subject: finalSubject,
          test_1: Number(test1),
          test_2: Number(test2),
          assignment_marks: Number(assignmentMarks),
          attendance_percentage: Number(attendance),
        });
        if (res.data.success) {
          setFormSuccess('Assessment recorded and calculated successfully.');
          setTimeout(() => {
            setIsModalOpen(false);
            loadData();
          }, 1000);
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const subjects = Array.from(new Set(assessments.map((a) => a.subject)));
  const filtered = assessments.filter((a) => {
    const matchesSearch =
      a.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.student_email?.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = !subjectFilter || a.subject === subjectFilter;
    const matchesStudent = !studentFilter || String(a.student_id) === studentFilter;
    return matchesSearch && matchesSubject && matchesStudent;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Internal Assessment & Marks</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record, evaluate, and auto-calculate student internal marks (Test 1, Test 2, Assignments, Attendance)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Assessment</span>
        </button>
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
            placeholder="Search student or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="">All Students</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assessments Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No assessment records found"
          description="There are currently no internal assessment records entered. Click 'Record New Assessment' to compute marks."
          actionLabel="Record Assessment"
          onAction={openCreateModal}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-center">Test 1 (/30)</th>
                  <th className="py-3 px-4 text-center">Test 2 (/30)</th>
                  <th className="py-3 px-4 text-center">Assignment (/20)</th>
                  <th className="py-3 px-4 text-center">Attendance %</th>
                  <th className="py-3 px-4 text-center font-bold text-slate-900">Total (/80)</th>
                  <th className="py-3 px-4 text-center font-bold text-slate-900">Score %</th>
                  <th className="py-3 px-4 text-center">Category</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {a.student_name}
                      <span className="block text-[10px] text-slate-400 font-normal">{a.student_email}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{a.subject}</td>
                    <td className="py-3 px-4 text-center font-mono font-medium">{a.test_1}</td>
                    <td className="py-3 px-4 text-center font-mono font-medium">{a.test_2}</td>
                    <td className="py-3 px-4 text-center font-mono font-medium">{a.assignment_marks}</td>
                    <td className="py-3 px-4 text-center font-mono font-medium">{a.attendance_percentage}%</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                      {a.total_marks}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-700">
                      {a.percentage}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={a.performance_category} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(a)}
                          className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit Assessment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Assessment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record / Edit Assessment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssessment ? 'Edit Internal Assessment' : 'Record Internal Assessment'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Student
              </label>
              <select
                disabled={!!editingAssessment}
                value={studentId}
                onChange={(e) => setStudentId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white disabled:bg-slate-50"
              >
                {students.length === 0 ? (
                  <option value="">No registered students found</option>
                ) : (
                  students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                {COMMON_SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="CUSTOM">+ Add Custom Subject</option>
              </select>
            </div>
          </div>

          {subject === 'CUSTOM' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Custom Subject Name
              </label>
              <input
                type="text"
                required
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="e.g. Distributed Systems & Cloud Infrastructure"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Component Marks Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Test 1 (Max 30)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                step={0.5}
                required
                value={test1}
                onChange={(e) => setTest1(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Test 2 (Max 30)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                step={0.5}
                required
                value={test2}
                onChange={(e) => setTest2(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Assign (Max 20)
              </label>
              <input
                type="number"
                min={0}
                max={20}
                step={0.5}
                required
                value={assignmentMarks}
                onChange={(e) => setAssignmentMarks(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Attendance %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                required
                value={attendance}
                onChange={(e) => setAttendance(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Auto-Calculation Preview Card */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Auto-Calculated Output</span>
                <span className="text-[11px] text-slate-500">
                  Total Marks: <strong>{calculatedTotal}</strong> / 80
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-extrabold text-indigo-700">{calculatedPercentage}%</div>
              <StatusBadge status={liveCategory} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !studentId || !!formSuccess}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingAssessment ? 'Update Record' : 'Save Assessment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
