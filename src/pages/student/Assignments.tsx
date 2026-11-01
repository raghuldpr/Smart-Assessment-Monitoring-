import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api.js';
import { Assignment } from '../../types/index.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Modal } from '../../components/Modal.js';
import {
  Search,
  Calendar,
  Award,
  UploadCloud,
  FileText,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Paperclip,
  Check,
} from 'lucide-react';

export const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Submission Modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [fileName, setFileName] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assignments');
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSeedSampleData = async () => {
    try {
      setSeeding(true);
      setError(null);
      await api.post('/dashboard/seed-sample-data');
      await fetchAssignments();
    } catch (err: any) {
      setError(err.message || 'Failed to seed sample coursework');
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenSubmit = (assignment: Assignment) => {
    setActiveAssignment(assignment);
    setFileName('');
    setSubmissionNotes('');
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitModalOpen(true);
  };

  const handleFilesChosen = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFillSampleSubmission = () => {
    if (!activeAssignment) return;
    const sanitizedTitle = activeAssignment.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25);
    setFileName(`${sanitizedTitle}_Solution.pdf`);
    setSubmissionNotes('Completed all theoretical and lab implementation sections. Includes time complexity benchmarks and modular test suite.');
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await api.post('/submissions', {
        assignment_id: activeAssignment.id,
        file_name: fileName,
        submission_notes: submissionNotes,
      });

      if (res.data.success) {
        setSubmitSuccess('Assignment submitted successfully!');
        setTimeout(() => {
          setSubmitModalOpen(false);
          fetchAssignments();
        }, 1200);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & sort logic
  const subjects = Array.from(new Set(assignments.map((a) => a.subject)));
  const filtered = assignments
    .filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase());
      const matchesSubject = !selectedSubject || a.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      const timeA = new Date(a.due_date).getTime();
      const timeB = new Date(b.due_date).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assignments Portal</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View assigned coursework, track deadlines, submit files, and inspect faculty feedback
          </p>
        </div>

        {assignments.length === 0 && (
          <button
            onClick={handleSeedSampleData}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm bg-slate-900 text-white text-xs font-bold font-mono uppercase tracking-wider hover:bg-slate-800 transition shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{seeding ? 'Populating Courses...' : 'Load Sample Courses & Tasks'}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-sm bg-rose-50 border border-rose-200 text-xs text-rose-700 font-mono">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-sm border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-sm border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-white"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          <button
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="px-3 py-1.5 text-xs font-medium rounded-sm border border-slate-300 hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 shrink-0 font-mono"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Due Date: {sortOrder === 'asc' ? 'Earliest' : 'Latest'}</span>
          </button>
        </div>
      </div>

      {/* Assignment Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-sm border border-slate-200 p-8 text-center">
          <EmptyState
            title="No assignments available yet"
            description="Faculty members have not posted active assignments yet, or no assignments matched your search."
          />
          <div className="mt-4">
            <button
              onClick={handleSeedSampleData}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm bg-slate-900 text-white text-xs font-bold font-mono uppercase tracking-wider hover:bg-slate-800 transition shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{seeding ? 'Generating Sample Data...' : 'Load Sample College Coursework & Marks'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const status = item.student_status || 'Not Submitted';

            return (
              <div
                key={item.id}
                className="bg-white rounded-sm border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-400 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-mono">
                      {item.subject}
                    </span>
                    <StatusBadge status={status} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {item.description || 'No detailed instructions provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Due: {new Date(item.due_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                      <Award className="w-3.5 h-3.5 text-slate-500" />
                      Max: {item.maximum_marks} pts
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <User className="w-3.5 h-3.5" />
                      {item.faculty_name || 'Faculty'}
                    </span>
                  </div>

                  {status === 'Not Submitted' && (
                    <button
                      onClick={() => handleOpenSubmit(item)}
                      className="w-full mt-3 py-2 px-3 rounded-sm bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-2xs"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Submit Assignment</span>
                    </button>
                  )}

                  {status === 'Submitted' && (
                    <div className="mt-3 p-2 bg-slate-100 rounded-sm text-center text-xs font-mono font-medium text-slate-700 border border-slate-200 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                      <span>Submitted - Awaiting Evaluation</span>
                    </div>
                  )}

                  {status === 'Graded' && (
                    <div className="mt-3 p-2 bg-emerald-50 rounded-sm text-center text-xs font-mono font-semibold text-emerald-800 border border-emerald-200">
                      Graded: {item.submission?.marks} / {item.maximum_marks} pts
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Assignment Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title={`Submit: ${activeAssignment?.title || 'Assignment'}`}
      >
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          {submitError && (
            <div className="p-3 rounded-sm bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 rounded-sm bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          )}

          {/* Quick Helper Box on What to Give */}
          <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase font-mono tracking-wider text-slate-700">
                What to give for submission:
              </span>
              <button
                type="button"
                onClick={handleFillSampleSubmission}
                className="text-[10px] font-mono font-bold text-slate-900 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                Fill Sample Solution
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Upload your completed report or assignment code document (.pdf, .zip, .docx, .py). You can drag and drop a file or browse on your computer.
            </p>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
              Select or Drop File
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFilesChosen(e.target.files)}
              className="hidden"
            />
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 border-2 border-dashed rounded-sm text-center cursor-pointer transition ${
                dragActive ? 'border-slate-900 bg-slate-100' : 'border-slate-300 hover:border-slate-500 bg-slate-50/50'
              }`}
            >
              <UploadCloud className="w-7 h-7 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Click to browse or drag and drop your file here
              </p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                PDF, DOCX, ZIP, PY, or TXT up to 25MB
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
              File Name / Document Reference
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. data_structures_bst_solution.pdf"
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-sm border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
              Submission Notes / Answer Highlights (Optional)
            </label>
            <textarea
              rows={3}
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Provide a brief summary of your solution, methodology, or repository links..."
              className="w-full p-2.5 text-xs rounded-sm border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-sm transition font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !!submitSuccess || !fileName}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition shadow-xs disabled:opacity-50 flex items-center gap-1.5 font-mono"
            >
              {submitting ? 'Submitting...' : 'Confirm Submission'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
