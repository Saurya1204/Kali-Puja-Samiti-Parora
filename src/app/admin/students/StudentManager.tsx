'use client';

import React, { useState } from 'react';
import { exportToExcel } from '@/lib/exportUtils';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Printer,
  Search,
  Trophy,
  Star,
  ExternalLink,
  Edit2,
  X,
} from 'lucide-react';

interface StudentItem {
  id: string;
  studentName: string;
  guardianName?: string | null;
  village: string;
  schoolOrCollege: string;
  courseOrClass: string;
  category: string;
  examOrCompetitionName: string;
  marksPercentageOrRank: string;
  yearOfPassing: number;
  contactNumber: string;
  certificateUrl?: string | null;
  status: string;
  prizeAssigned?: string | null;
  prizeGiven: boolean;
  isPublished: boolean;
  remarks?: string | null;
}

export default function StudentManager({
  initialStudents,
  festivalYear,
}: {
  initialStudents: StudentItem[];
  festivalYear: number;
}) {
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Edit fields
  const [status, setStatus] = useState('APPROVED');
  const [prizeAssigned, setPrizeAssigned] = useState('');
  const [prizeGiven, setPrizeGiven] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [remarks, setRemarks] = useState('');

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.village.toLowerCase().includes(search.toLowerCase()) ||
      s.examOrCompetitionName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openReviewModal = (s: StudentItem) => {
    setEditingStudent(s);
    setStatus(s.status);
    setPrizeAssigned(s.prizeAssigned || 'Gold Medal + Certificate');
    setPrizeGiven(s.prizeGiven);
    setIsPublished(s.isPublished);
    setRemarks(s.remarks || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStudent.id,
          status,
          prizeAssigned,
          prizeGiven,
          isPublished,
          remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सत्यापन सहेजने में त्रुटि');

      const updated = students.map((item) =>
        item.id === data.student.id ? { ...item, ...data.student } : item
      );
      setStudents(updated);
      setEditingStudent(null);
      setFeedback('विद्यार्थी का सत्यापन एवं पुरस्कार विवरण सफलतापूर्वक अपडेट किया गया।');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((s) => ({
      'विद्यार्थी का नाम (Student Name)': s.studentName,
      'अभिभावक (Guardian)': s.guardianName || '',
      'गांव (Village)': s.village,
      'श्रेणी (Category)': s.category,
      'संस्थान (School/College)': s.schoolOrCollege,
      'कक्षा / कोर्स (Class/Course)': s.courseOrClass,
      'परीक्षा / प्रतियोगिता (Exam)': s.examOrCompetitionName,
      'प्राप्तांक / रैंक (Marks/Rank)': s.marksPercentageOrRank,
      'वर्ष (Year)': s.yearOfPassing,
      'मोबाइल (Phone)': s.contactNumber,
      'सत्यापन स्थिति (Status)': s.status,
      'आवंटित पुरस्कार (Prize)': s.prizeAssigned || '',
      'पुरस्कार वितरण संपन्न (Given)': s.prizeGiven ? 'हाँ' : 'नहीं',
      'वेबसाइट पर प्रकाशित (Published)': s.isPublished ? 'हाँ' : 'नहीं',
    }));

    exportToExcel(exportData, `Kali_Puja_Parora_Awardees_${festivalYear}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            Merit Verification & Awardees List
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
            मेधावी छात्र सम्मान सत्यापन एवं पुरस्कार वितरण ({festivalYear})
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            विद्यार्थियों के आवेदनों की जांच, प्रमाणपत्र सत्यापन, पुरस्कार निर्धारण एवं सम्मान सूची
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>पुरस्कृत छात्र सूची (Excel)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-black/60 hover:bg-black/80 border border-amber-700/50 text-stone-300 px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>प्रिंट सूची</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="bg-black/40 border border-amber-900/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="विद्यार्थी का नाम, गांव अथवा परीक्षा खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-maroon-950 border border-amber-800/50 rounded-xl pl-9 pr-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-maroon-950 border border-amber-800/50 rounded-xl px-3 py-2 text-stone-200 focus:outline-none"
        >
          <option value="">सभी स्थिति (All Status)</option>
          <option value="APPROVED">स्वीकृत (APPROVED)</option>
          <option value="PENDING">लंबित (PENDING)</option>
          <option value="REJECTED">अस्वीकृत (REJECTED)</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-black/50 border border-amber-600/30 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-maroon-950/80 text-amber-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">विद्यार्थी का नाम व गांव</th>
                <th className="py-3.5 px-4">उपलब्धि श्रेणी</th>
                <th className="py-3.5 px-4">परीक्षा / संस्थान विवरण</th>
                <th className="py-3.5 px-4">प्राप्तांक / रैंक</th>
                <th className="py-3.5 px-4">आवंटित पुरस्कार</th>
                <th className="py-3.5 px-4 text-center">स्थिति</th>
                <th className="py-3.5 px-4 text-center">वेबसाइट</th>
                <th className="py-3.5 px-4 text-center no-print">सत्यापन</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60 text-stone-300">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-amber-500/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-100">{s.studentName}</div>
                    <span className="text-[11px] text-stone-400">
                      {s.village} • {s.contactNumber}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      {s.category.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-stone-200 font-semibold">{s.examOrCompetitionName}</div>
                    <span className="text-[11px] text-stone-400">
                      {s.schoolOrCollege} ({s.courseOrClass})
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                    {s.marksPercentageOrRank}
                  </td>

                  <td className="py-3.5 px-4">
                    {s.prizeAssigned ? (
                      <span className="text-amber-200 font-medium flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{s.prizeAssigned}</span>
                      </span>
                    ) : (
                      <span className="text-stone-500 italic">निर्धारित नहीं</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : s.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {s.isPublished ? (
                      <span className="text-emerald-400 font-bold text-[10px]">प्रकाशित</span>
                    ) : (
                      <span className="text-stone-500 text-[10px]">अप्रकाशित</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center no-print">
                    <button
                      onClick={() => openReviewModal(s)}
                      className="festive-btn-gold text-[10px] px-3 py-1 font-bold cursor-pointer"
                    >
                      समीक्षा / पुरस्कार
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW & PRIZE MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3 mb-4">
              <h3 className="text-xl font-bold text-amber-300 font-serif">
                छात्र आवेदन समीक्षा एवं पुरस्कार निर्धारण
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black/50 border border-amber-900/50 rounded-xl p-3 mb-4 text-xs space-y-1">
              <div>
                <strong>विद्यार्थी:</strong> {editingStudent.studentName} ({editingStudent.village})
              </div>
              <div>
                <strong>उपलब्धि:</strong> {editingStudent.examOrCompetitionName} - {editingStudent.marksPercentageOrRank}
              </div>
              {editingStudent.certificateUrl && (
                <div>
                  <strong>प्रमाणपत्र लिंक:</strong>{' '}
                  <a
                    href={editingStudent.certificateUrl}
                    target="_blank"
                    className="text-amber-400 underline font-mono text-[11px]"
                  >
                    देखें (Open Proof)
                  </a>
                </div>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-amber-200">सत्यापन स्थिति (Status) *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                >
                  <option value="APPROVED">स्वीकृत (APPROVED)</option>
                  <option value="PENDING">लंबित (PENDING)</option>
                  <option value="REJECTED">अस्वीकृत (REJECTED)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">
                  आवंटित पुरस्कार (Prize Details) *
                </label>
                <input
                  type="text"
                  placeholder="उदा. Gold Medal + Certificate of Honor + ₹2,100 Cash Award"
                  value={prizeAssigned}
                  onChange={(e) => setPrizeAssigned(e.target.value)}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">समीक्षा टिप्पणी / प्रशस्ति संदेश</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>पब्लिक वेबसाइट की "मेधावी छात्र दीवार" पर प्रकाशित करें</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prizeGiven}
                    onChange={(e) => setPrizeGiven(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>समारोह में पुरस्कार वितरण संपन्न हो चुका है</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-amber-900/50">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-stone-700 text-stone-300"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-6 py-2 font-bold cursor-pointer"
                >
                  {loading ? 'सहेजा जा रहा है...' : 'सत्यापन संपन्न करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
