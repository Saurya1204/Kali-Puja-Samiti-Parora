'use client';

import React, { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { Bell, PlusCircle, Pin, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface AnnouncementItem {
  id: string;
  title: string;
  titleHindi?: string | null;
  message: string;
  messageHindi?: string | null;
  category: string;
  isPinned: boolean;
  isUrgent: boolean;
  createdAt: string;
}

export default function NoticeManager({
  initialAnnouncements,
  festivalYear,
}: {
  initialAnnouncements: AnnouncementItem[];
  festivalYear: number;
}) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    titleHindi: '',
    message: '',
    messageHindi: '',
    category: 'GENERAL',
    isPinned: true,
    isUrgent: false,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सहेजने में विफल');

      setAnnouncements([data.announcement, ...announcements]);
      setIsModalOpen(false);
      setFeedback('घोषणा सफलतापूर्वक प्रकाशित की गई एवं होमपेज टिकर में अपडेट हो गई!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            Public Notifications & Circulars
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
            सूचना एवं घोषणा प्रबंधन (Notices & Alerts)
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            वेबसाइट के शीर्ष टिकर, आवश्यक सूचनाएं, आपातकालीन अलर्ट एवं प्रेस विज्ञप्तियां
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="festive-btn-gold text-xs px-4 py-2 flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-maroon-950" />
          <span>नई घोषणा / नोटिस जारी करें</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {announcements.map((an) => (
          <div
            key={an.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              an.isUrgent
                ? 'bg-red-950/60 border-red-500/80 shadow-glow-red'
                : 'festive-card'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    an.isUrgent
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {an.isUrgent ? 'URGENT ALERT' : an.category}
                </span>
                {an.isPinned && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-black/40 px-2 py-0.5 rounded border border-amber-900/60">
                    <Pin className="w-3 h-3" />
                    <span>होमपेज पर पिन</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-stone-100 text-base">{an.titleHindi || an.title}</h3>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  {an.messageHindi || an.message}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-amber-900/40 text-[10px] text-stone-400 font-mono">
              जारी: {formatDate(an.createdAt)}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3 mb-4">
              <h3 className="text-xl font-bold text-amber-300 font-serif">
                नई सूचना अथवा घोषणा प्रकाशित करें
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-amber-200">शीर्षक (Hindi Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. कबड्डी प्रतियोगिता ऑनलाइन पंजीकरण की अंतिम तिथि बढ़ी"
                  value={formData.titleHindi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      titleHindi: e.target.value,
                      title: e.target.value,
                    })
                  }
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">सूचना श्रेणी *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                >
                  <option value="GENERAL">सामान्य सूचना (GENERAL)</option>
                  <option value="URGENT">अत्यंत आवश्यक (URGENT ALERT)</option>
                  <option value="EVENT_UPDATE">कार्यक्रम अपडेट (EVENT UPDATE)</option>
                  <option value="SCHEDULE_CHANGE">समय-सारणी परिवर्तन</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">घोषणा संदेश (Ticker Text) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="होमपेज के टिकर और नोटिफिकेशन बोर्ड पर प्रदर्शित होने वाला संदेश..."
                  value={formData.messageHindi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      messageHindi: e.target.value,
                      message: e.target.value,
                    })
                  }
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>होमपेज के शीर्ष स्क्रॉलिंग टिकर में पिन करें</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isUrgent}
                    onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>आपातकालीन लाल अलर्ट (Urgent Red Banner) के रूप में दिखाएं</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-amber-900/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-700 text-stone-300"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-6 py-2 font-bold cursor-pointer"
                >
                  {loading ? 'प्रकाशित हो रहा है...' : 'अभी प्रकाशित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

