'use client';

import React, { useState } from 'react';
import { formatDate } from '@/lib/utils';
import {
  Calendar,
  PlusCircle,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  Trophy,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  nameHindi?: string | null;
}

interface EventItem {
  id: string;
  title: string;
  titleHindi?: string | null;
  categoryId: string;
  description?: string | null;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  venue?: string | null;
  organizerName?: string | null;
  organizerContact?: string | null;
  rules?: string | null;
  prizeDetails?: string | null;
  status: string;
  isPublished: boolean;
  category: Category;
}

export default function EventManager({
  initialEvents,
  categories,
  festivalYear,
}: {
  initialEvents: EventItem[];
  categories: Category[];
  festivalYear: number;
}) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    titleHindi: '',
    categoryId: categories[0]?.id || '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '06:00 PM',
    endTime: '10:00 PM',
    venue: 'माँ काली मंदिर प्रांगण, परोरा',
    organizerName: '',
    organizerContact: '',
    rules: '',
    prizeDetails: '',
    status: 'UPCOMING',
    isPublished: true,
  });

  const openAdd = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      titleHindi: '',
      categoryId: categories[0]?.id || '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '06:00 PM',
      endTime: '10:00 PM',
      venue: 'माँ काली मंदिर प्रांगण, परोरा',
      organizerName: '',
      organizerContact: '',
      rules: '',
      prizeDetails: '',
      status: 'UPCOMING',
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (ev: EventItem) => {
    setEditingEvent(ev);
    setFormData({
      title: ev.title,
      titleHindi: ev.titleHindi || '',
      categoryId: ev.categoryId,
      description: ev.description || '',
      date: new Date(ev.date).toISOString().split('T')[0],
      startTime: ev.startTime || '',
      endTime: ev.endTime || '',
      venue: ev.venue || '',
      organizerName: ev.organizerName || '',
      organizerContact: ev.organizerContact || '',
      rules: ev.rules || '',
      prizeDetails: ev.prizeDetails || '',
      status: ev.status,
      isPublished: ev.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...(editingEvent ? { id: editingEvent.id } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सहेजने में विफल');

      const updated = editingEvent
        ? events.map((item) => (item.id === data.event.id ? { ...item, ...data.event } : item))
        : [data.event, ...events];

      setEvents(updated);
      setIsModalOpen(false);
      setFeedback('कार्यक्रम विवरण सफलतापूर्वक अद्यतन किया गया।');
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
            Festival Program Schedule Manager
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
            कार्यक्रम प्रबंधन (Events Schedule - {festivalYear})
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            धार्मिक निशा पूजा, कबड्डी महाकुंभ, सांस्कृतिक संध्या, भंडारा एवं मेधावी छात्र सम्मान कार्यक्रम
          </p>
        </div>

        <button
          onClick={openAdd}
          className="festive-btn-gold text-xs px-4 py-2 flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-maroon-950" />
          <span>नया कार्यक्रम जोड़ें</span>
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
        {events.map((ev) => (
          <div
            key={ev.id}
            className="festive-card p-5 flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  {ev.category?.nameHindi || ev.category?.name || 'सामान्य'}
                </span>
                <span className="text-xs text-stone-400 font-mono">{formatDate(ev.date)}</span>
              </div>

              <div>
                <h3 className="font-bold text-stone-100 text-base">
                  {ev.titleHindi || ev.title}
                </h3>
                {ev.titleHindi && ev.title && (
                  <span className="text-xs text-stone-400 block">{ev.title}</span>
                )}
              </div>

              <div className="text-xs text-stone-300 space-y-1 bg-black/40 p-2.5 rounded-xl">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{ev.startTime} - {ev.endTime || 'समाप्ति तक'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{ev.venue || 'परोरा'}</span>
                </div>
              </div>

              {ev.prizeDetails && (
                <div className="text-xs text-amber-200 bg-amber-500/10 p-2 rounded-lg flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{ev.prizeDetails}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-amber-900/40 flex items-center justify-between text-xs">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ev.status === 'LIVE'
                    ? 'bg-red-600 text-white animate-pulse'
                    : ev.status === 'COMPLETED'
                    ? 'bg-stone-800 text-stone-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {ev.status}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEdit(ev)}
                  className="festive-btn-gold text-[10px] px-3 py-1 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>संपादित करें</span>
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(`क्या आप कार्यक्रम "${ev.title}" को हटाना चाहते हैं?`)) return;
                    try {
                      const res = await fetch(`/api/admin/events?id=${ev.id}`, { method: 'DELETE' });
                      if (!res.ok) throw new Error('हटाने में विफल');
                      setEvents(events.filter((item) => item.id !== ev.id));
                      setFeedback('कार्यक्रम सफलतापूर्वक हटा दिया गया।');
                      setTimeout(() => setFeedback(null), 3000);
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }}
                  className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded cursor-pointer transition-all"
                  title="कार्यक्रम हटाएं"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3 mb-4">
              <h3 className="text-xl font-bold text-amber-300 font-serif">
                {editingEvent ? 'कार्यक्रम विवरण संपादित करें' : 'नया कार्यक्रम जोड़ें'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">कार्यक्रम शीर्षक (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">कार्यक्रम शीर्षक (हिंदी में) *</label>
                  <input
                    type="text"
                    required
                    value={formData.titleHindi}
                    onChange={(e) => setFormData({ ...formData, titleHindi: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">कार्यक्रम श्रेणी *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameHindi || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">आयोजन दिनांक *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">प्रारंभ समय</label>
                  <input
                    type="text"
                    placeholder="06:00 PM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">समापन समय</label>
                  <input
                    type="text"
                    placeholder="10:00 PM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">आयोजन स्थल (Venue)</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">विस्तृत विवरण</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">पुरस्कार विवरण</label>
                  <input
                    type="text"
                    placeholder="उदा. प्रथम: ₹25,000 + शील्ड"
                    value={formData.prizeDetails}
                    onChange={(e) => setFormData({ ...formData, prizeDetails: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">स्थिति *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="LIVE">LIVE (महोत्सव जारी)</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
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
                  {loading ? 'सहेजा जा रहा है...' : 'कार्यक्रम सुरक्षित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

