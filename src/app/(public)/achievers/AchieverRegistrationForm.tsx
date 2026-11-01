'use client';

import React, { useState } from 'react';
import { GraduationCap, Send, CheckCircle2, AlertCircle, UploadCloud } from 'lucide-react';

export default function AchieverRegistrationForm() {
  const [formData, setFormData] = useState({
    studentName: '',
    guardianName: '',
    village: 'Parora',
    schoolOrCollege: '',
    courseOrClass: '',
    category: 'CLASS_10',
    examOrCompetitionName: '',
    marksPercentageOrRank: '',
    yearOfPassing: 2026,
    contactNumber: '',
    certificateUrl: '',
    remarks: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सबमिशन विफल रहा');

      setStatus({
        type: 'success',
        message: data.message || 'आपका आवेदन सफलतापूर्वक प्राप्त हो गया है!',
      });

      // Reset form
      setFormData({
        studentName: '',
        guardianName: '',
        village: 'Parora',
        schoolOrCollege: '',
        courseOrClass: '',
        category: 'CLASS_10',
        examOrCompetitionName: '',
        marksPercentageOrRank: '',
        yearOfPassing: 2026,
        contactNumber: '',
        certificateUrl: '',
        remarks: '',
      });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'त्रुटि उत्पन्न हुई।' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-maroon-950/90 to-[#120303] border-2 border-amber-600/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase border border-amber-500/30">
          <GraduationCap className="w-4 h-4" />
          <span>Apply For Pratibha Samman</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-serif">
          मेधावी छात्र सम्मान हेतु आवेदन फॉर्म
        </h2>
        <p className="text-xs sm:text-sm text-stone-300">
          यदि आपने या आपके परिवार के किसी छात्र ने हाल ही में कोई शैक्षणिक अथवा खेल उपलब्धि प्राप्त की है, तो कृपया नीचे विवरण दर्ज करें।
        </p>
      </div>

      {status && (
        <div
          className={`p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 ${
            status.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
              : 'bg-red-950/80 border border-red-500 text-red-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Student Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              विद्यार्थी का पूरा नाम (Student Name) *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. राहुल कुमार"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Guardian Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              माता/पिता/अभिभावक का नाम (Guardian Name)
            </label>
            <input
              type="text"
              placeholder="उदा. श्री सुरेश सिंह"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Village */}
          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              गांव / टोला का नाम (Village / Tola) *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. परोरा (पूरब टोला)"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Contact Number */}
          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              मोबाइल नंबर (10 Digit Mobile) *
            </label>
            <input
              type="tel"
              required
              pattern="[0-9]{10}"
              placeholder="उदा. 9876543210"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              उपलब्धि श्रेणी (Achievement Category) *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
            >
              <option value="CLASS_10">10वीं बोर्ड परीक्षा (Matric BSEB/CBSE)</option>
              <option value="CLASS_12">12वीं इंटरमीडिएट (Intermediate Science/Arts/Comm)</option>
              <option value="GRADUATION">स्नातक (Graduation BA/BSc/BCom/BTech)</option>
              <option value="POST_GRADUATION">स्नातकोत्तर (Post Graduation MA/MSc)</option>
              <option value="GOVT_JOB">सरकारी सेवा चयन (BPSC/UPSC/SSC/Railway/Police)</option>
              <option value="COMPETITIVE_EXAM">प्रतियोगी परीक्षा (JEE/NEET/CUET/NDA)</option>
              <option value="SPORTS">खेलकूद उपलब्धि (राज्य/राष्ट्रीय स्तर)</option>
              <option value="OTHER">अन्य विशिष्ट उपलब्धि</option>
            </select>
          </div>

          {/* Year of Passing */}
          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              उत्तीर्ण होने / चयन का वर्ष *
            </label>
            <input
              type="number"
              required
              min="2015"
              max="2030"
              value={formData.yearOfPassing}
              onChange={(e) => setFormData({ ...formData, yearOfPassing: Number(e.target.value) })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          {/* School/College */}
          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              विद्यालय / कॉलेज / संस्थान का नाम *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. जीडी कॉलेज बेगूसराय / बीपी स्कूल"
              value={formData.schoolOrCollege}
              onChange={(e) => setFormData({ ...formData, schoolOrCollege: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Class / Course */}
          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              कक्षा अथवा कोर्स का नाम *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. 10th / 12th Science / B.Tech"
              value={formData.courseOrClass}
              onChange={(e) => setFormData({ ...formData, courseOrClass: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Exam / Competition Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              परीक्षा अथवा प्रतियोगिता का नाम *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. बिहार बोर्ड मैट्रिक 2026 / BPSC 69th"
              value={formData.examOrCompetitionName}
              onChange={(e) => setFormData({ ...formData, examOrCompetitionName: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Marks / Rank */}
          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              प्राप्तांक, प्रतिशत अथवा रैंक *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. 468/500 (93.6%) अथवा रैंक 142"
              value={formData.marksPercentageOrRank}
              onChange={(e) => setFormData({ ...formData, marksPercentageOrRank: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Certificate link / details */}
        <div className="space-y-1.5">
          <label className="font-semibold text-amber-200 block">
            प्रमाणपत्र / अंकपत्र लिंक या विवरण (Google Drive / Cloudinary Link) (वैकल्पिक)
          </label>
          <input
            type="url"
            placeholder="https://drive.google.com/... या https://res.cloudinary.com/..."
            value={formData.certificateUrl}
            onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
            className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
          />
          <span className="text-[11px] text-stone-400 block">
            नोट: मूल अंकपत्र/प्रमाणपत्र पुरस्कार वितरण समारोह के समय साथ लाएं।
          </span>
        </div>

        {/* Remarks */}
        <div className="space-y-1.5">
          <label className="font-semibold text-amber-200 block">
            अन्य टिप्पणी या विशेष संदेश (वैकल्पिक)
          </label>
          <textarea
            rows={2}
            placeholder="कोई अन्य विशेष जानकारी जो आप समिति के साथ साझा करना चाहते हैं..."
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={loading}
            className="festive-btn-gold text-sm sm:text-base px-8 py-3.5 inline-flex items-center gap-2 font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>जमा हो रहा है...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>आवेदन सबमिट करें (Submit Application)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

