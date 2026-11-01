import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  GraduationCap,
  LogIn,
  AlertCircle,
  Sparkles,
  BookOpen,
  ShieldCheck,
  User,
  ArrowRight,
  School,
  CheckCircle2,
  KeyRound,
  IdCard,
} from 'lucide-react';

interface StudentPreset {
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  year: string;
}

interface FacultyPreset {
  name: string;
  email: string;
  department: string;
  designation: string;
}

const PRESET_STUDENTS: StudentPreset[] = [
  {
    name: 'Abhishek Kumaran',
    email: 'abhishek@college.edu',
    rollNumber: 'CS2023001',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
  },
  {
    name: 'Rahul',
    email: 'rahul@college.edu',
    rollNumber: 'CS2023002',
    department: 'Computer Science & Engineering',
    year: '2nd Year',
  },
  {
    name: 'Priya Patel',
    email: 'priya@college.edu',
    rollNumber: 'IT2023015',
    department: 'Information Technology',
    year: '3rd Year',
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha@college.edu',
    rollNumber: 'CS2022045',
    department: 'Computer Science & Engineering',
    year: '4th Year',
  },
  {
    name: 'Vikram Verma',
    email: 'vikram@college.edu',
    rollNumber: 'EC2024018',
    department: 'Electronics & Communication',
    year: '2nd Year',
  },
];

const PRESET_FACULTY: FacultyPreset[] = [
  {
    name: 'Dr. Sarah Connor',
    email: 'faculty@college.edu',
    department: 'Computer Science & Engineering',
    designation: 'Professor & HOD',
  },
  {
    name: 'Prof. Rajesh Kumar',
    email: 'rajesh@college.edu',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
  },
];

export const Login: React.FC = () => {
  // Tab state: 'STUDENT' or 'FACULTY' or 'ADMIN'
  const [activePortal, setActivePortal] = useState<'STUDENT' | 'FACULTY' | 'ADMIN'>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickLoginEmail, setQuickLoginEmail] = useState<string | null>(null);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleRedirect = (role: string) => {
    if (role === 'STUDENT') {
      navigate('/student/dashboard');
    } else if (role === 'FACULTY') {
      navigate('/faculty/dashboard');
    } else if (role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      handleRedirect(user.role);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDemoLogin = async (targetEmail: string, roleHint: 'STUDENT' | 'FACULTY' | 'ADMIN') => {
    setError(null);
    setQuickLoginEmail(targetEmail);

    try {
      const user = await demoLogin({ email: targetEmail, role: roleHint });
      handleRedirect(user.role);
    } catch (err: any) {
      setError(err.message || `Failed to sign in as ${targetEmail}`);
    } finally {
      setQuickLoginEmail(null);
    }
  };

  const handleAutofill = (userEmail: string, userPass: string = 'password123') => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center px-4">
        <div className="inline-flex p-3 rounded-xl bg-slate-900 text-white shadow-md mb-3 ring-4 ring-slate-200">
          <GraduationCap className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Smart Assessment & Assignment Portal
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
          Internal Marks Monitoring, Digital Submissions & Performance Analytics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4 sm:px-0">
        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
          
          {/* Dual-Portal Selector Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActivePortal('STUDENT');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                activePortal === 'STUDENT'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 ring-1 ring-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <User className={`w-4 h-4 ${activePortal === 'STUDENT' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>Student Portal</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activePortal === 'STUDENT' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'
              }`}>
                5 Demo Profiles
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePortal('FACULTY');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                activePortal === 'FACULTY'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80 ring-1 ring-emerald-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activePortal === 'FACULTY' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Faculty Portal</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activePortal === 'FACULTY' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
              }`}>
                Professor Access
              </span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Context Header banner based on active portal */}
            {activePortal === 'STUDENT' ? (
              <div className="mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>Student Sign In</span>
                      <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        Student Role
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      View coursework assignments, upload submissions, and inspect your internal assessment marks.
                    </p>
                  </div>
                  <School className="w-8 h-8 text-indigo-500/30 hidden sm:block" />
                </div>
              </div>
            ) : activePortal === 'FACULTY' ? (
              <div className="mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>Faculty & Evaluator Sign In</span>
                      <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Faculty Role
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Create assignments, grade student submissions with feedback, and input internal marks.
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-emerald-500/30 hidden sm:block" />
                </div>
              </div>
            ) : (
              <div className="mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>System Administrator Portal</span>
                      <span className="text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        Admin Role
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Institutional directory oversight, global course audits, and campus-wide accreditation reporting.
                    </p>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-purple-500/30 hidden sm:block" />
                </div>
              </div>
            )}

            {/* ERROR ALERT */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold">Authentication failed: </span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* OPTION 1: 5 FAKE STUDENTS QUICK LOGIN SECTION (STUDENT PORTAL) */}
            {/* ============================================================== */}
            {activePortal === 'STUDENT' && (
              <div className="mb-8 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-indigo-50/40 border border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800">
                      Pre-Configured Student Details (1-Click Login)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded font-semibold">
                    Instant Access
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Select any of the five pre-seeded students below to log in directly into their personalized dashboard:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_STUDENTS.map((student, idx) => {
                    const isLoggingIn = quickLoginEmail === student.email;
                    const isAbhishek = student.name === 'Abhishek Kumaran';
                    const isRahul = student.name === 'Rahul';

                    return (
                      <div
                        key={student.email}
                        className={`p-3 rounded-xl border bg-white transition-all shadow-xs hover:shadow-sm ${
                          isAbhishek || isRahul
                            ? 'border-indigo-300 ring-1 ring-indigo-200'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {student.name}
                              </span>
                              {(isAbhishek || isRahul) && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                                  Requested
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                              {student.email}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {student.rollNumber}
                              </span>
                              <span className="truncate">{student.year}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={loading || !!quickLoginEmail}
                            onClick={() => handleDirectDemoLogin(student.email, 'STUDENT')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50 shadow-xs"
                          >
                            {isLoggingIn ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <span>Log In</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            title="Autofill this student's email into the form below"
                            onClick={() => handleAutofill(student.email, 'password123')}
                            className="py-1.5 px-2 rounded-lg text-[10px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                          >
                            Autofill
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* OPTION 2: FACULTY DETAILS QUICK LOGIN SECTION (FACULTY PORTAL)  */}
            {/* ============================================================== */}
            {activePortal === 'FACULTY' && (
              <div className="mb-8 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-emerald-50/70 via-slate-50 to-emerald-50/40 border border-emerald-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800">
                      Pre-Configured Faculty Details (1-Click Login)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-semibold">
                    Evaluator Access
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Log in as a faculty professor to review submissions, grade coursework, and manage internal marks:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_FACULTY.map((faculty) => {
                    const isLoggingIn = quickLoginEmail === faculty.email;

                    return (
                      <div
                        key={faculty.email}
                        className="p-3.5 rounded-xl border border-emerald-200 bg-white transition-all shadow-xs hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-900 truncate block">
                              {faculty.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono truncate block mt-0.5">
                              {faculty.email}
                            </span>
                            <div className="mt-1 text-[10px] text-emerald-800 font-medium">
                              {faculty.designation} • {faculty.department}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={loading || !!quickLoginEmail}
                            onClick={() => handleDirectDemoLogin(faculty.email, 'FACULTY')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 shadow-xs"
                          >
                            {isLoggingIn ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <span>Log In as Faculty</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            title="Autofill this faculty email into the form"
                            onClick={() => handleAutofill(faculty.email, 'password123')}
                            className="py-1.5 px-2 rounded-lg text-[10px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                          >
                            Autofill
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* OPTION 3: ADMIN QUICK ACCESS SECTION (ADMIN PORTAL)            */}
            {/* ============================================================== */}
            {activePortal === 'ADMIN' && (
              <div className="mb-8 p-4 sm:p-5 rounded-xl bg-purple-50/70 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800">
                      Institutional Administrator Access
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Log in as Dean/Administrator to oversee campus-wide reports, manage users, and inspect college records:
                </p>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-200">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Prof. David Miller</div>
                    <div className="text-[11px] text-slate-500 font-mono">admin@college.edu</div>
                  </div>
                  <button
                    type="button"
                    disabled={loading || !!quickLoginEmail}
                    onClick={() => handleDirectDemoLogin('admin@college.edu', 'ADMIN')}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-50 shadow-xs"
                  >
                    <span>Log In as Admin</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="relative flex py-2 items-center mb-6">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] uppercase font-mono font-semibold tracking-wider text-slate-400">
                Or sign in with custom credentials
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      activePortal === 'STUDENT'
                        ? 'abhishek@college.edu / rahul@college.edu'
                        : activePortal === 'FACULTY'
                        ? 'faculty@college.edu / rajesh@college.edu'
                        : 'admin@college.edu'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-sm font-sans placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Default: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">password123</code>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-sm font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !!quickLoginEmail}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm tracking-wide transition shadow-md disabled:opacity-50 ${
                  activePortal === 'STUDENT'
                    ? 'bg-indigo-600 hover:bg-indigo-700 ring-2 ring-indigo-500/20'
                    : activePortal === 'FACULTY'
                    ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-500/20'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>
                      Sign In to {activePortal === 'STUDENT' ? 'Student Portal' : activePortal === 'FACULTY' ? 'Faculty Portal' : 'Admin Portal'}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Bottom Links & Admin portal switcher */}
            <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Do not have an account?{' '}
                <Link to="/register" className="font-bold text-slate-900 hover:underline">
                  Register as Student or Faculty
                </Link>
              </div>

              <div>
                {activePortal !== 'ADMIN' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActivePortal('ADMIN');
                      setError(null);
                    }}
                    className="text-slate-500 hover:text-slate-900 font-mono text-[11px] underline flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Switch to Administrator Login</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActivePortal('STUDENT');
                      setError(null);
                    }}
                    className="text-slate-500 hover:text-slate-900 font-mono text-[11px] underline"
                  >
                    ← Return to Student / Faculty Portals
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informative Security & RBAC badge */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400 font-mono">
            Protected by Stateless JWT • Strict Role-Based Access Control • BCrypt Hashed Credentials
          </p>
        </div>
      </div>
    </div>
  );
};
