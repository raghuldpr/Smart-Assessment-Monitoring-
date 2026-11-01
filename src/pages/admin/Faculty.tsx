import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { User, Assignment } from '../../types/index.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Search, ShieldCheck, Mail, Building, BookOpen } from 'lucide-react';

export const AdminFaculty: React.FC = () => {
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [facRes, assignRes] = await Promise.all([
          api.get('/users?role=FACULTY'),
          api.get('/assignments'),
        ]);
        if (facRes.data.success) {
          setFacultyList(facRes.data.data);
        }
        if (assignRes.data.success) {
          setAssignments(assignRes.data.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load faculty members');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const departments = Array.from(new Set(facultyList.map((f) => f.department)));
  const filtered = facultyList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !department || f.department === department;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Faculty Directory</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Roster of appointed professors, lecturers, and academic departmental instructors
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
            placeholder="Search faculty by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-auto">
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
        </div>
      </div>

      {/* Faculty Cards / Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No faculty members registered"
          description="Faculty members create their profiles using the registration portal selecting the 'Faculty' role."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((fac) => {
            const facAssignments = assignments.filter((a) => a.faculty_id === fac.id);
            const subjectsTaught = Array.from(new Set(facAssignments.map((a) => a.subject)));

            return (
              <div
                key={fac.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                      {fac.name.charAt(0)}
                    </div>
                    <StatusBadge status="FACULTY" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{fac.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {fac.email}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {fac.department}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Assignments Created:</span>
                    <strong className="text-slate-800">{facAssignments.length}</strong>
                  </div>

                  <div className="text-xs text-slate-500">
                    <span className="block text-[11px] text-slate-400 mb-1">Active Subjects:</span>
                    {subjectsTaught.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No assignments published yet</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {subjectsTaught.map((sub) => (
                          <span
                            key={sub}
                            className="inline-block text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
