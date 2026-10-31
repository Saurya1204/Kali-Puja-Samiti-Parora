'use client';

import React, { useState } from 'react';
import { Settings, Calendar, Building, CreditCard, CheckCircle2, PlusCircle, Save } from 'lucide-react';

interface FestivalYearItem {
  id: string;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  theme?: string | null;
  isActive: boolean;
}

export default function SettingsManager({
  initialYears,
  initialSettings,
}: {
  initialYears: FestivalYearItem[];
  initialSettings: Record<string, string>;
}) {
  const [years, setYears] = useState<FestivalYearItem[]>(initialYears);
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Active Year Edit
  const activeYear = years.find((y) => y.isActive) || years[0];
  const [yearForm, setYearForm] = useState({
    id: activeYear?.id || '',
    year: activeYear?.year || 2026,
    name: activeYear?.name || 'Kali Puja Utsav 2026',
    startDate: activeYear ? new Date(activeYear.startDate).toISOString().split('T')[0] : '2026-11-09',
    endDate: activeYear ? new Date(activeYear.endDate).toISOString().split('T')[0] : '2026-11-10',
    venue: activeYear?.venue || 'Maa Kali Mandir Parisar & High School Ground, Parora',
    theme: activeYear?.theme || 'आस्था, एकता, खेल एवं युवा उत्थान',
    isActive: true,
  });

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SETTINGS',
          settingsData: settings,
        }),
      });

      if (!res.ok) throw new Error('सेटिंग्स सहेजने में विफल');
      setFeedback('समिति एवं बैंक सेटिंग्स सफलतापूर्वक सुरक्षित कर ली गईं।');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_OR_UPDATE_YEAR',
          festivalYearData: yearForm,
        }),
      });

      if (!res.ok) throw new Error('वर्ष सेटिंग्स सहेजने में विफल');
      setFeedback('महोत्सव वर्ष एवं तिथियां सफलतापूर्वक सुरक्षित कर ली गईं। होमपेज काउंटडाउन स्वतः अपडेट हो गया!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-amber-900/40 pb-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
          System Configuration & Master Controls
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
          वार्षिक सत्र एवं पोर्टल सेटिंग्स (Settings)
        </h1>
        <p className="text-xs text-stone-400 mt-0.5">
          काली पूजा महोत्सव की वार्षिक तिथियां, काउंटडाउन लक्ष्य, बैंक/UPI विवरण एवं संगठन प्रोफ़ाइल
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* SECTION 1: ANNUAL FESTIVAL YEAR & DATES CONFIG */}
      <div className="festive-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-amber-900/40 pb-3">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-amber-300 text-base">
            वार्षिक महोत्सव वर्ष एवं तिथियां (Annual Festival Config)
          </h3>
        </div>

        <form onSubmit={handleSaveYear} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-amber-200">सत्र / वर्ष (Year) *</label>
              <input
                type="number"
                required
                value={yearForm.year}
                onChange={(e) => setYearForm({ ...formDataSafe(yearForm), year: Number(e.target.value) })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-amber-200">महोत्सव नाम (Name) *</label>
              <input
                type="text"
                required
                value={yearForm.name}
                onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-amber-200">सक्रिय वर्ष (Active Year) *</label>
              <select
                value={yearForm.isActive ? 'true' : 'false'}
                onChange={(e) => setYearForm({ ...yearForm, isActive: e.target.value === 'true' })}
                className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
              >
                <option value="true">हाँ (सक्रिय - होमपेज इसी सत्र को दिखाएगा)</option>
                <option value="false">नहीं (पुरालेख / केवल ऐतिहासिक रिकॉर्ड)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-amber-200">
                महोत्सव प्रारंभ दिनांक (Start Date - CountDown Target) *
              </label>
              <input
                type="date"
                required
                value={yearForm.startDate}
                onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-amber-200">महोत्सव समापन दिनांक (End Date) *</label>
              <input
                type="date"
                required
                value={yearForm.endDate}
                onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-amber-200">आयोजन स्थल (Venue)</label>
            <input
              type="text"
              value={yearForm.venue}
              onChange={(e) => setYearForm({ ...yearForm, venue: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-amber-200">महोत्सव थीम / ध्येय वाक्य (Theme)</label>
            <input
              type="text"
              value={yearForm.theme || ''}
              onChange={(e) => setYearForm({ ...yearForm, theme: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
            />
          </div>

          <div className="text-right pt-2">
            <button
              type="submit"
              disabled={loading}
              className="festive-btn-gold text-xs px-6 py-2.5 font-bold flex items-center gap-1.5 ml-auto cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>महोत्सव वर्ष व तिथियां सुरक्षित करें</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: SAMITI PROFILE & BANK/UPI SETTINGS */}
      <div className="festive-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-amber-900/40 pb-3">
          <CreditCard className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-amber-300 text-base">
            समिति विवरण एवं आधिकारिक बैंक/UPI सेटिंग्स (Official Bank & UPI)
          </h3>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-amber-200">समिति का नाम (English)</label>
              <input
                type="text"
                value={settings['SAMITI_NAME'] || ''}
                onChange={(e) => setSettings({ ...settings, SAMITI_NAME: e.target.value })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-amber-200">समिति का नाम (हिंदी में)</label>
              <input
                type="text"
                value={settings['SAMITI_NAME_HINDI'] || ''}
                onChange={(e) => setSettings({ ...settings, SAMITI_NAME_HINDI: e.target.value })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-amber-200">आधिकारिक UPI VPA (QR Code)</label>
              <input
                type="text"
                value={settings['UPI_ID'] || ''}
                onChange={(e) => setSettings({ ...settings, UPI_ID: e.target.value })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-amber-200">खाता धारक का नाम (Account Name)</label>
              <input
                type="text"
                value={settings['UPI_NAME'] || ''}
                onChange={(e) => setSettings({ ...settings, UPI_NAME: e.target.value })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-amber-200">बैंक का नाम (Bank)</label>
              <input
                type="text"
                value={settings['BANK_NAME'] || ''}
                onChange={(e) => setSettings({ ...settings, BANK_NAME: e.target.value })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-amber-200">बैंक खाता संख्या (A/C No)</label>
              <input
                type="text"
                value={settings['BANK_ACCOUNT_NO'] || ''}
                onChange={(e) => setSettings({ ...settings, BANK_ACCOUNT_NO: e.target.value })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-amber-200">आईएफएससी कोड (IFSC)</label>
              <input
                type="text"
                value={settings['BANK_IFSC'] || ''}
                onChange={(e) => setSettings({ ...settings, BANK_IFSC: e.target.value })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-amber-200">बैंक शाखा (Branch)</label>
              <input
                type="text"
                value={settings['BANK_BRANCH'] || ''}
                onChange={(e) => setSettings({ ...settings, BANK_BRANCH: e.target.value })}
                className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="text-right pt-2">
            <button
              type="submit"
              disabled={loading}
              className="festive-btn-gold text-xs px-6 py-2.5 font-bold flex items-center gap-1.5 ml-auto cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>बैंक एवं संगठन विवरण सुरक्षित करें</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formDataSafe(obj: any) {
  return obj;
}

