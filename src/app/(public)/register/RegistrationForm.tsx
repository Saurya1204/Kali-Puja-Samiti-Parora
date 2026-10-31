'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Printer, FileText, Sparkles, Send } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  titleHindi?: string | null;
  category: {
    name: string;
    nameHindi?: string | null;
  };
}

export default function RegistrationForm({
  events,
  initialType,
  initialEventId,
}: {
  events: EventItem[];
  initialType?: string;
  initialEventId?: string;
}) {
  const [formData, setFormData] = useState({
    registrationType: (initialType || 'INDIVIDUAL') as 'INDIVIDUAL' | 'TEAM' | 'CULTURAL' | 'VOLUNTEER' | 'OTHER',
    eventId: initialEventId || (events[0]?.id || ''),
    applicantName: '',
    guardianName: '',
    phone: '',
    email: '',
    village: 'Parora',
    teamName: '',
    playersCount: 10,
    activityDetails: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    registrationNumber: string;
    applicantName: string;
    eventTitle: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'पंजीकरण विफल रहा');

      setReceipt({
        registrationNumber: data.registrationNumber,
        applicantName: data.applicantName,
        eventTitle: data.eventTitle,
      });
    } catch (err: any) {
      setError(err.message || 'त्रुटि उत्पन्न हुई।');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (receipt) {
    return (
      <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden printable-area">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
          पंजीकरण सफल (Registration Confirmed)
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif mt-1">
          काली पूजा समिति परोरा
        </h2>

        <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-6 my-6 text-left space-y-3">
          <div className="flex justify-between items-center border-b border-amber-900/50 pb-2">
            <span className="text-xs text-stone-400">पंजीकरण क्रमांक:</span>
            <span className="text-lg font-extrabold text-amber-300 font-mono tracking-wider">
              {receipt.registrationNumber}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-400">आवेदक / कप्तान:</span>
            <span className="font-bold text-stone-100">{receipt.applicantName}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-400">प्रतियोगिता / सेवा:</span>
            <span className="font-bold text-amber-200">{receipt.eventTitle}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-400">पंजीकरण तिथि:</span>
            <span className="text-stone-200 font-mono">{new Date().toLocaleDateString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-400">स्थिति:</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
              स्वीकृति हेतु विचाराधीन (Pending Verification)
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-300 max-w-md mx-auto mb-6">
          कृपया इस पंजीकरण क्रमांक को सुरक्षित रखें। आयोजन के दिन यह क्रमांक रिपोर्टिंग काउंटर पर प्रदर्शित करना अनिवार्य होगा।
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 no-print">
          <button
            onClick={handlePrint}
            className="festive-btn-gold text-xs sm:text-sm px-6 py-2.5 flex items-center gap-2 font-bold cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>पर्ची प्रिंट करें (Print Slip)</span>
          </button>
          <button
            onClick={() => setReceipt(null)}
            className="bg-black/60 hover:bg-black/80 text-stone-300 px-6 py-2.5 rounded-full border border-amber-700/50 text-xs font-semibold"
          >
            नया पंजीकरण करें
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-maroon-950/80 to-[#120303] border-2 border-amber-600/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {error && (
        <div className="p-4 rounded-2xl mb-6 bg-red-950/80 border border-red-500 text-red-200 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        {/* Registration Type Selector */}
        <div className="space-y-2">
          <label className="font-bold text-amber-300 block">
            पंजीकरण प्रकार चुनें (Registration Category) *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { type: 'INDIVIDUAL', label: 'व्यक्तिगत प्रतियोगिता' },
              { type: 'TEAM', label: 'कबड्डी टीम (Kabaddi Team)' },
              { type: 'CULTURAL', label: 'सांस्कृतिक प्रस्तुति' },
              { type: 'VOLUNTEER', label: 'स्वयंसेवक (Volunteer Seva)' },
            ].map((item) => (
              <button
                type="button"
                key={item.type}
                onClick={() =>
                  setFormData({
                    ...formData,
                    registrationType: item.type as any,
                  })
                }
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-semibold ${
                  formData.registrationType === item.type
                    ? 'bg-amber-500 text-maroon-950 border-amber-400 shadow-lg font-bold'
                    : 'bg-black/40 text-stone-300 border-amber-700/40 hover:border-amber-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event Selection */}
        <div className="space-y-1.5">
          <label className="font-semibold text-amber-200 block">
            संबंधित कार्यक्रम अथवा प्रतियोगिता *
          </label>
          <select
            value={formData.eventId}
            onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
            className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-4 py-3 text-stone-100 focus:outline-none focus:border-amber-400"
            required
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.titleHindi || ev.title} ({ev.category.nameHindi || ev.category.name})
              </option>
            ))}
          </select>
        </div>

        {/* If Team Registration */}
        {formData.registrationType === 'TEAM' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div className="space-y-1.5">
              <label className="font-semibold text-amber-200 block">टीम का नाम (Team Name) *</label>
              <input
                type="text"
                required
                placeholder="उदा. परोरा टाइगर्स / कस्बा वॉरियर्स"
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-amber-200 block">खिलाड़ियों की कुल संख्या *</label>
              <input
                type="number"
                min="7"
                max="12"
                value={formData.playersCount}
                onChange={(e) => setFormData({ ...formData, playersCount: Number(e.target.value) })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>
        )}

        {/* Applicant Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              {formData.registrationType === 'TEAM' ? 'टीम कप्तान का नाम *' : 'आवेदक / प्रतिभागी का नाम *'}
            </label>
            <input
              type="text"
              required
              placeholder="उदा. अमित कुमार सिंह"
              value={formData.applicantName}
              onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              पिता / संरक्षक का नाम
            </label>
            <input
              type="text"
              placeholder="उदा. श्री बी. एन. सिंह"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              मोबाइल नंबर (10 अंकों का फोन नंबर) *
            </label>
            <input
              type="tel"
              required
              pattern="[0-9]{10}"
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              गांव / पंचायत का नाम (Village / Panchayat) *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. परोरा / कस्बा / के नगर"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Activity Details or Experience */}
        <div className="space-y-1.5">
          <label className="font-semibold text-amber-200 block">
            प्रस्तुति अथवा सेवा से संबंधित अतिरिक्त विवरण
          </label>
          <textarea
            rows={2}
            placeholder="उदा. गायन में लोकगीत प्रस्तुति, अथवा कबड्डी में पूर्व खेलने का अनुभव, अथवा वालंटियर ड्यूटी पसंद..."
            value={formData.activityDetails}
            onChange={(e) => setFormData({ ...formData, activityDetails: e.target.value })}
            className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={loading}
            className="festive-btn-gold text-sm sm:text-base px-8 py-3.5 inline-flex items-center gap-2 font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>पंजीकरण दर्ज हो रहा है...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>पंजीकरण संपन्न करें (Complete Registration)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
