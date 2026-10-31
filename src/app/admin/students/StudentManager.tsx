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
  Trash2,
  PlusCircle,
  X,
  Award,
  BookOpen,
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
  photoUrl?: string | null;
  status: string;
  prizeAssigned?: string | null;
  prizeGiven: boolean;
  isPublished: boolean;
  remarks?: string | null;
}

const CATEGORY_MAP: Record<string, string> = {
  CLASS_10: 'मैट्रिक (Class 10)',
  CLASS_12: 'इंटरमीडिएट (Class 12)',
  GRADUATION: 'स्नातक (Graduation)',
  POST_GRADUATION: 'स्नातकोत्तर (PG)',
  COMPETITIVE_EXAM: 'प्रतियोगी परीक्षा (JEE/NEET/UPSC/BPSC)',
  GOVT_JOB: 'सरकारी सेवा चयन (Govt Job)',
  SPORTS: 'राज्य/राष्ट्रीय खेल (Sports)',
  OTHER: 'अन्य विशेष उपलब्धि (Other)',
};

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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Review Modal (Quick verification)
  const [reviewingStudent, setReviewingStudent] = useState<StudentItem | null>(null);
  const [reviewForm, setReviewForm] = useState({
    status: 'APPROVED',
    prizeAssigned: 'Gold Medal + Certificate',
    prizeGiven: false,
    isPublished: true,
    remarks: '',
  });

  // Full Create / Edit Modal
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [fullForm, setFullForm] = useState({
    studentName: '',
    guardianName: '',
    village: 'परोरा',
    schoolOrCollege: '',
    courseOrClass: 'Class 10',
    category: 'CLASS_10',
    examOrCompetitionName: 'BSEB Bihar Board Matric Exam',
    marksPercentageOrRank: '',
    yearOfPassing: 2026,
    contactNumber: '',
    certificateUrl: '',
    prizeAssigned: 'Gold Medal + Certificate + नकद पुरस्कार',
    prizeGiven: false,
    isPublished: true,
    remarks: '',
  });

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.village.toLowerCase().includes(search.toLowerCase()) ||
      s.examOrCompetitionName.toLowerCase().includes(search.toLowerCase()) ||
      s.contactNumber.includes(search);

    const matchesStatus = !statusFilter || s.status === statusFilter;
    const matchesCategory = !categoryFilter || s.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Open Review Modal
  const openReviewModal = (s: StudentItem) => {
    setReviewingStudent(s);
    setReviewForm({
      status: s.status,
      prizeAssigned: s.prizeAssigned || 'Gold Medal + Certificate',
      prizeGiven: s.prizeGiven,
      isPublished: s.isPublished,
      remarks: s.remarks || '',
    });
  };

  const handleReviewSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingStudent) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reviewingStudent.id,
          ...reviewForm,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सत्यापन सहेजने में त्रुटि');

      setStudents(students.map((item) => (item.id === data.student.id ? { ...item, ...data.student } : item)));
      setReviewingStudent(null);
      setFeedback('विद्यार्थी का सत्यापन एवं पुरस्कार विवरण सफलतापूर्वक अपडेट किया गया।');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open Create / Edit Full Modal
  const openCreateModal = () => {
    setEditingStudent(null);
    setFullForm({
      studentName: '',
      guardianName: '',
      village: 'परोरा',
      schoolOrCollege: '',
      courseOrClass: 'Class 10',
      category: 'CLASS_10',
      examOrCompetitionName: 'BSEB Bihar Board Matric Exam',
      marksPercentageOrRank: '',
      yearOfPassing: 2026,
      contactNumber: '',
      certificateUrl: '',
      prizeAssigned: 'Gold Medal + Certificate + नकद पुरस्कार',
      prizeGiven: false,
      isPublished: true,
      remarks: '',
    });
    setIsFullModalOpen(true);
  };

  const openEditModal = (s: StudentItem) => {
    setEditingStudent(s);
    setFullForm({
      studentName: s.studentName,
      guardianName: s.guardianName || '',
      village: s.village,
      schoolOrCollege: s.schoolOrCollege,
      courseOrClass: s.courseOrClass,
      category: s.category,
      examOrCompetitionName: s.examOrCompetitionName,
      marksPercentageOrRank: s.marksPercentageOrRank,
      yearOfPassing: s.yearOfPassing,
      contactNumber: s.contactNumber,
      certificateUrl: s.certificateUrl || '',
      prizeAssigned: s.prizeAssigned || '',
      prizeGiven: s.prizeGiven,
      isPublished: s.isPublished,
      remarks: s.remarks || '',
    });
    setIsFullModalOpen(true);
  };

  const handleFullSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        ...fullForm,
        festivalYear,
      };
      if (editingStudent) payload.id = editingStudent.id;

      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सहेजने में त्रुटि');

      if (editingStudent) {
        setStudents(students.map((item) => (item.id === editingStudent.id ? data.student : item)));
        setFeedback('छात्र विवरण सफलतापूर्वक अपडेट किया गया!');
      } else {
        setStudents([data.student, ...students]);
        setFeedback('नया मेधावी छात्र रिकॉर्ड सफलतापूर्वक जोड़ा गया!');
      }

      setIsFullModalOpen(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (s: StudentItem) => {
    if (!confirm(`क्या आप "${s.studentName}" का रिकॉर्ड हटाना चाहते हैं?`)) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/students?id=${s.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'हटाने में विफल');

      setStudents(students.filter((item) => item.id !== s.id));
      setFeedback('छात्र रिकॉर्ड सफलतापूर्वक हटा दिया गया।');
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
      'श्रेणी (Category)': CATEGORY_MAP[s.category] || s.category,
      'विद्यालय/कॉलेज (Institute)': s.schoolOrCollege,
      'कक्षा/कोर्स (Class/Course)': s.courseOrClass,
      'परीक्षा का नाम (Exam Name)': s.examOrCompetitionName,
      'प्राप्तांक/रैंक (Marks/Rank)': s.marksPercentageOrRank,
      'उत्तीर्ण वर्ष (Year)': s.yearOfPassing,
      'मोबाइल (Mobile)': s.contactNumber,
      'सत्यापन स्थिति (Status)': s.status,
      'आवंटित पुरस्कार (Prize)': s.prizeAssigned || 'N/A',
      'पुरस्कार प्रदान किया गया (Prize Given)': s.prizeGiven ? 'हाँ' : 'नहीं',
      'पब्लिक वॉल पर प्रकाशित': s.isPublished ? 'हाँ' : 'नहीं',
    }));

    exportToExcel(exportData, `Parora_Pratibha_Samman_${festivalYear}`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            Annual Student Achievers & Felicitation Ceremony
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-amber-400" />
            परौरा प्रतिभा सम्मान व छात्र पुरस्कार (Awards Admin)
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            सत्र {festivalYear} | मेधावी छात्र आवेदन, प्रमाणपत्र सत्यापन, पुरस्कार निर्धारण एवं पब्लिक वॉल प्रबंधन
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreateModal}
            className="festive-btn-gold flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नया छात्र जोड़ें (Add Achiever)</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>एक्सेल डाउनलोड</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-black/60 hover:bg-stone-900 text-stone-300 border border-stone-800 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट सूची</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-maroon-950/70 border border-amber-600/30 rounded-xl p-3.5 shadow">
          <div className="text-[11px] text-amber-300/80 uppercase font-semibold">कुल छात्र प्रविष्टियां</div>
          <div className="text-2xl font-bold font-mono text-amber-200 mt-0.5">{students.length}</div>
        </div>
        <div className="bg-emerald-950/60 border border-emerald-600/30 rounded-xl p-3.5 shadow">
          <div className="text-[11px] text-emerald-300/80 uppercase font-semibold">स्वीकृत / पदक विजेता</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-0.5">
            {students.filter((s) => s.status === 'APPROVED').length}
          </div>
        </div>
        <div className="bg-amber-950/60 border border-amber-600/30 rounded-xl p-3.5 shadow">
          <div className="text-[11px] text-amber-300/80 uppercase font-semibold">लंबित आवेदन (Pending)</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-0.5">
            {students.filter((s) => s.status === 'PENDING').length}
          </div>
        </div>
        <div className="bg-purple-950/60 border border-purple-600/30 rounded-xl p-3.5 shadow">
          <div className="text-[11px] text-purple-300/80 uppercase font-semibold">पुरस्कृत छात्र (Prize Given)</div>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-0.5">
            {students.filter((s) => s.prizeGiven).length}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-black/40 p-3 rounded-xl border border-amber-900/30">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
          <input
            type="text"
            placeholder="छात्र नाम, गांव या परीक्षा खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-maroon-950/80 border border-amber-900/50 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-maroon-950/80 border border-amber-900/50 rounded-lg text-xs text-stone-200"
          >
            <option value="">समस्त श्रेणियां (All Categories)</option>
            {Object.entries(CATEGORY_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-maroon-950/80 border border-amber-900/50 rounded-lg text-xs text-stone-200"
          >
            <option value="">समस्त स्थितियां (All Status)</option>
            <option value="APPROVED">स्वीकृत (Approved)</option>
            <option value="PENDING">लंबित (Pending)</option>
            <option value="REJECTED">अस्वीकृत (Rejected)</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-maroon-950/40 border border-amber-600/30 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-maroon-950/80 text-amber-300 font-serif border-b border-amber-900/40 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">विद्यार्थी का नाम व पता</th>
                <th className="p-3">परीक्षा / श्रेणी (Category)</th>
                <th className="p-3 text-center">प्राप्तांक / रैंक</th>
                <th className="p-3">सत्यापन स्थिति</th>
                <th className="p-3">आवंटित पुरस्कार</th>
                <th className="p-3 text-right">कार्य (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/20 text-stone-200">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-amber-500/5 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-stone-100 flex items-center gap-1.5">
                      <span>{s.studentName}</span>
                      {s.isPublished && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/40">
                          पब्लिक
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {s.village} • {s.schoolOrCollege}
                    </div>
                    <div className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                      फोन: {s.contactNumber}
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {CATEGORY_MAP[s.category] || s.category}
                    </span>
                    <div className="text-[11px] text-stone-300 font-medium mt-0.5">
                      {s.examOrCompetitionName} ({s.yearOfPassing})
                    </div>
                  </td>

                  <td className="p-3 text-center font-mono font-extrabold text-amber-300 text-sm">
                    {s.marksPercentageOrRank}
                  </td>

                  <td className="p-3">
                    {s.status === 'APPROVED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5" /> स्वीकृत (Approved)
                      </span>
                    ) : s.status === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-950/80 text-red-300 border border-red-500/40">
                        <XCircle className="w-3.5 h-3.5" /> अस्वीकृत
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 animate-pulse">
                        लंबित (Pending)
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="font-semibold text-amber-200 flex items-center gap-1 text-[11px]">
                      <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{s.prizeAssigned || 'निर्णय बाकी'}</span>
                    </div>
                    {s.prizeGiven && (
                      <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                        ✓ मंच पर सम्मानित
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openReviewModal(s)}
                        className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-maroon-950 rounded text-[11px] font-bold transition-all"
                        title="सत्यापन व पुरस्कार समीक्षा"
                      >
                        सत्यापित करें
                      </button>
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded"
                        title="सम्पादित करें"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400 text-xs">
                    कोई छात्र रिकॉर्ड नहीं मिला।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- QUICK REVIEW MODAL --- */}
      {reviewingStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-maroon-950 border border-amber-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setReviewingStudent(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-amber-200 font-serif mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              छात्र सत्यापन एवं पुरस्कार निर्धारण
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              विद्यार्थी: <span className="font-bold text-amber-300">{reviewingStudent.studentName}</span> ({reviewingStudent.marksPercentageOrRank})
            </p>

            <form onSubmit={handleReviewSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">सत्यापन स्थिति (Status) *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['APPROVED', 'PENDING', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, status: st })}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        reviewForm.status === st
                          ? st === 'APPROVED'
                            ? 'bg-emerald-600 text-white border-emerald-400'
                            : st === 'REJECTED'
                            ? 'bg-red-600 text-white border-red-400'
                            : 'bg-amber-600 text-white border-amber-400'
                          : 'bg-black/40 border-stone-800 text-stone-400'
                      }`}
                    >
                      {st === 'APPROVED' ? '✓ स्वीकृत' : st === 'REJECTED' ? '✕ अस्वीकृत' : 'लंबित'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  आवंटित पुरस्कार / पदक विवरण (Assigned Prize)
                </label>
                <input
                  type="text"
                  value={reviewForm.prizeAssigned}
                  onChange={(e) => setReviewForm({ ...reviewForm, prizeAssigned: e.target.value })}
                  placeholder="उदा. Gold Medal + Certificate + ₹2,100 Cash Award"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewForm.prizeGiven}
                    onChange={(e) => setReviewForm({ ...reviewForm, prizeGiven: e.target.checked })}
                    className="rounded border-amber-600 text-amber-500"
                  />
                  <span className="text-stone-300">मंच पर पुरस्कार प्रदान कर दिया गया</span>
                </label>

                <label className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewForm.isPublished}
                    onChange={(e) => setReviewForm({ ...reviewForm, isPublished: e.target.checked })}
                    className="rounded border-amber-600 text-amber-500"
                  />
                  <span className="text-stone-300">पब्लिक वेबसाइट वॉल पर प्रकाशित करें</span>
                </label>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">समिति टिप्पणी (Remarks)</label>
                <textarea
                  rows={2}
                  value={reviewForm.remarks}
                  onChange={(e) => setReviewForm({ ...reviewForm, remarks: e.target.value })}
                  placeholder="सत्यापन विवरण अथवा विशेष टिप्पणी..."
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={() => setReviewingStudent(null)}
                  className="px-4 py-2 bg-black/50 text-stone-300 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-5 py-2"
                >
                  {loading ? 'सहेज रहे हैं...' : 'सत्यापन सुरक्षित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FULL CREATE / EDIT MODAL --- */}
      {isFullModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-maroon-950 border border-amber-500/40 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsFullModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-amber-200 font-serif mb-1">
              {editingStudent ? 'मेधावी छात्र विवरण संपादित करें' : 'नया मेधावी छात्र पंजीकृत करें'}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              परौरा अथवा पड़ोसी ग्राम के प्रतिभावान छात्र का पूर्ण विवरण दर्ज करें।
            </p>

            <form onSubmit={handleFullSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">विद्यार्थी का नाम *</label>
                  <input
                    type="text"
                    required
                    value={fullForm.studentName}
                    onChange={(e) => setFullForm({ ...fullForm, studentName: e.target.value })}
                    placeholder="उदा. राहुल कुमार"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">अभिभावक का नाम</label>
                  <input
                    type="text"
                    value={fullForm.guardianName}
                    onChange={(e) => setFullForm({ ...fullForm, guardianName: e.target.value })}
                    placeholder="उदा. श्री मनोज कुमार"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">गांव (Village) *</label>
                  <input
                    type="text"
                    required
                    value={fullForm.village}
                    onChange={(e) => setFullForm({ ...fullForm, village: e.target.value })}
                    placeholder="उदा. परोरा"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">मोबाइल नंबर *</label>
                  <input
                    type="text"
                    required
                    value={fullForm.contactNumber}
                    onChange={(e) => setFullForm({ ...fullForm, contactNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">उपलब्धि श्रेणी (Category) *</label>
                  <select
                    value={fullForm.category}
                    onChange={(e) => setFullForm({ ...fullForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  >
                    {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">कक्षा / कोर्स *</label>
                  <input
                    type="text"
                    required
                    value={fullForm.courseOrClass}
                    onChange={(e) => setFullForm({ ...fullForm, courseOrClass: e.target.value })}
                    placeholder="उदा. Class 10th / B.Tech / MBBS"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">विद्यालय / महाविद्यालय / संस्थान *</label>
                <input
                  type="text"
                  required
                  value={fullForm.schoolOrCollege}
                  onChange={(e) => setFullForm({ ...fullForm, schoolOrCollege: e.target.value })}
                  placeholder="उदा. राजकीय उच्च विद्यालय, परोरा"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-stone-300 font-semibold mb-1">परीक्षा / प्रतियोगिता का नाम *</label>
                  <input
                    type="text"
                    required
                    value={fullForm.examOrCompetitionName}
                    onChange={(e) => setFullForm({ ...fullForm, examOrCompetitionName: e.target.value })}
                    placeholder="उदा. BSEB Matric Exam / JEE Main"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">अंक / % / रैंक *</label>
                  <input
                    type="text"
                    required
                    value={fullForm.marksPercentageOrRank}
                    onChange={(e) => setFullForm({ ...fullForm, marksPercentageOrRank: e.target.value })}
                    placeholder="उदा. 468/500 (93.6%)"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-amber-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">आवंटित पुरस्कार (Prize Details)</label>
                <input
                  type="text"
                  value={fullForm.prizeAssigned}
                  onChange={(e) => setFullForm({ ...fullForm, prizeAssigned: e.target.value })}
                  placeholder="उदा. Gold Medal + Certificate + नकद ₹2,100"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={() => setIsFullModalOpen(false)}
                  className="px-4 py-2 bg-black/50 text-stone-300 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-5 py-2"
                >
                  {loading ? 'सहेज रहे हैं...' : editingStudent ? 'अपडेट सुरक्षित करें' : 'छात्र रिकॉर्ड जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
