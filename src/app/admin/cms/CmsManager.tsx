'use client';

import React, { useState } from 'react';
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Trophy,
  X,
  Save,
} from 'lucide-react';

interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  page: string;
  bannerType: string;
  imageUrl: string;
  linkUrl?: string | null;
  buttonText?: string | null;
  badgeText?: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface SectionItem {
  id: string;
  sectionKey: string;
  title: string;
  subtitle?: string | null;
  content: string;
  mediaUrl?: string | null;
  isPublished: boolean;
}

export default function CmsManager({
  initialBanners,
  initialSections,
}: {
  initialBanners: BannerItem[];
  initialSections: SectionItem[];
}) {
  const [activeTab, setActiveTab] = useState<'BANNERS' | 'SECTIONS'>('BANNERS');
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [sections, setSections] = useState<SectionItem[]>(initialSections);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Banner Modal
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    page: 'HOMEPAGE',
    bannerType: 'HERO_SLIDER',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '/kabaddi',
    buttonText: 'कबड्डी लाइव स्कोर देखें',
    badgeText: 'बिहार का सबसे बड़ा खेल महाकुंभ',
    isActive: true,
    sortOrder: 1,
  });

  // Section Edit State
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    sectionKey: '',
    title: '',
    subtitle: '',
    content: '',
    mediaUrl: '',
    isPublished: true,
  });

  // --- BANNER HANDLERS ---
  const openCreateBanner = () => {
    setEditingBanner(null);
    setBannerForm({
      title: '',
      subtitle: '',
      page: 'HOMEPAGE',
      bannerType: 'HERO_SLIDER',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/kabaddi',
      buttonText: 'कबड्डी लाइव स्कोर देखें',
      badgeText: 'बिहार का सबसे बड़ा खेल महाकुंभ',
      isActive: true,
      sortOrder: banners.length + 1,
    });
    setIsBannerModalOpen(true);
  };

  const openEditBanner = (b: BannerItem) => {
    setEditingBanner(b);
    setBannerForm({
      title: b.title,
      subtitle: b.subtitle || '',
      page: b.page,
      bannerType: b.bannerType,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl || '',
      buttonText: b.buttonText || '',
      badgeText: b.badgeText || '',
      isActive: b.isActive,
      sortOrder: b.sortOrder,
    });
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = { ...bannerForm };
      if (editingBanner) payload.id = editingBanner.id;

      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'बैनर सहेजने में विफल');

      if (editingBanner) {
        setBanners(banners.map((b) => (b.id === editingBanner.id ? data.banner : b)));
        setFeedback('बैनर विवरण सफलतापूर्वक अपडेट किया गया!');
      } else {
        setBanners([...banners, data.banner]);
        setFeedback('नया CMS बैनर सफलतापूर्वक प्रकाशित किया गया!');
      }

      setIsBannerModalOpen(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (b: BannerItem) => {
    if (!confirm(`क्या आप बैनर "${b.title}" को हटाना चाहते हैं?`)) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/cms?id=${b.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'हटाने में विफल');

      setBanners(banners.filter((item) => item.id !== b.id));
      setFeedback('बैनर सफलतापूर्वक हटा दिया गया।');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- SECTION HANDLERS ---
  const openCreateSection = (presetKey?: string) => {
    setIsCreatingSection(true);
    const initialKey = presetKey || `ABOUT_${Date.now()}`;
    setEditingSection({
      id: '',
      sectionKey: initialKey,
      title: '',
      subtitle: '',
      content: '',
      mediaUrl: '',
      isPublished: true,
    });
    setSectionForm({
      sectionKey: initialKey,
      title: '',
      subtitle: '',
      content: '',
      mediaUrl: '',
      isPublished: true,
    });
  };

  const openEditSection = (s: SectionItem) => {
    setIsCreatingSection(false);
    setEditingSection(s);
    setSectionForm({
      sectionKey: s.sectionKey,
      title: s.title,
      subtitle: s.subtitle || '',
      content: s.content,
      mediaUrl: s.mediaUrl || '',
      isPublished: s.isPublished,
    });
  };

  const handleDeleteSection = async (sec: SectionItem) => {
    if (!confirm(`क्या आप वाकई सेक्शन "${sec.title || sec.sectionKey}" को हटाना चाहते हैं?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cms?sectionKey=${encodeURIComponent(sec.sectionKey)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सेक्शन हटाने में विफल');
      setSections(sections.filter((s) => s.sectionKey !== sec.sectionKey));
      setFeedback(`सेक्शन "${sec.sectionKey}" सफलतापूर्वक हटा दिया गया!`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_SECTION',
          ...sectionForm,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सेक्शन सहेजने में विफल');

      if (isCreatingSection) {
        setSections([...sections.filter((s) => s.sectionKey !== data.section.sectionKey), data.section]);
        setFeedback('नया सामग्री सेक्शन सफलतापूर्वक जोड़ा गया!');
      } else {
        setSections(sections.map((s) => (s.sectionKey === data.section.sectionKey ? data.section : s)));
        setFeedback('वेबसाइट सामग्री सेक्शन सफलतापूर्वक अपडेट किया गया!');
      }
      setEditingSection(null);
      setIsCreatingSection(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            Content Management System (Super Admin CMS)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif flex items-center gap-2">
            <Layers className="w-7 h-7 text-amber-400" />
            वेबसाइट बैनर व सामग्री प्रबंधन (CMS Studio)
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            होमपेज हीरो स्लाइडर, कबड्डी महोत्सव स्पॉटलाइट एवं समिति नेतृत्व संदेशों का पूर्ण गतिशील नियंत्रण
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-amber-500/30 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('BANNERS')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'BANNERS'
                ? 'bg-amber-500 text-maroon-950 shadow'
                : 'text-stone-300 hover:text-amber-300'
            }`}
          >
            🖼️ वेबसाइट बैनर्स ({banners.length})
          </button>
          <button
            onClick={() => setActiveTab('SECTIONS')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'SECTIONS'
                ? 'bg-amber-500 text-maroon-950 shadow'
                : 'text-stone-300 hover:text-amber-300'
            }`}
          >
            📝 पेज सामग्री सेक्शन्स ({sections.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* --- TAB 1: BANNERS CRUD --- */}
      {activeTab === 'BANNERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-amber-200 font-serif">
              सक्रिय बैनर्स व प्रोमो डिस्प्ले (Active Banners)
            </h3>
            <button
              onClick={openCreateBanner}
              className="festive-btn-gold text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>नया बैनर जोड़ें (Add Banner)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {banners.map((b) => (
              <div
                key={b.id}
                className="bg-maroon-950/60 border border-amber-600/30 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-amber-400 transition-all"
              >
                {/* Banner Image Preview */}
                <div className="relative h-44 w-full bg-black/60 overflow-hidden">
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-950 via-transparent to-black/60" />

                  {/* Badge */}
                  {b.badgeText && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-maroon-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                      {b.badgeText}
                    </span>
                  )}

                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.isActive
                        ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-900/80 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {b.isActive ? 'सक्रिय (Live)' : 'निष्क्रिय'}
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] text-amber-400 font-mono font-bold">
                      <span>पेज: {b.page}</span>
                      <span>•</span>
                      <span>प्रकार: {b.bannerType}</span>
                    </div>

                    <h4 className="font-bold text-stone-100 text-base line-clamp-1 mt-1">
                      {b.title}
                    </h4>

                    {b.subtitle && (
                      <p className="text-xs text-stone-300 line-clamp-2 mt-0.5 leading-snug">
                        {b.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-amber-900/40 flex items-center justify-between text-xs">
                    {b.buttonText ? (
                      <span className="text-[11px] text-amber-300 font-semibold bg-black/40 px-2 py-1 rounded">
                        बटन: {b.buttonText}
                      </span>
                    ) : (
                      <span className="text-stone-500 text-[11px]">कोई बटन नहीं</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditBanner(b)}
                        className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded"
                        title="संपादित करें"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b)}
                        className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: SECTIONS CMS --- */}
      {activeTab === 'SECTIONS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-amber-200 font-serif">
                पेज सामग्री व About Us सेक्शन्स (Customizable Sections)
              </h3>
              <p className="text-xs text-stone-400">यहाँ से समिति परिचय, मंदिर इतिहास एवं होमपेज के सेक्शन्स व चित्र प्रबंधित करें</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openCreateSection('ABOUT_CHANDIKA_ASTHAN')}
                className="bg-black/60 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-3 py-1.5 rounded-xl font-bold"
              >
                + चंडिका स्थान
              </button>
              <button
                type="button"
                onClick={() => openCreateSection('ABOUT_HISTORY')}
                className="bg-black/60 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-3 py-1.5 rounded-xl font-bold"
              >
                + इतिहास (1984)
              </button>
              <button
                type="button"
                onClick={() => openCreateSection()}
                className="festive-btn-gold text-xs px-3.5 py-2 flex items-center gap-1.5 font-bold shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>नया सेक्शन जोड़ें</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((sec) => (
              <div
                key={sec.sectionKey}
                className="bg-maroon-950/50 border border-amber-600/30 rounded-2xl p-5 space-y-3 hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold px-2 py-0.5 rounded bg-black/40 border border-amber-500/30">
                      KEY: {sec.sectionKey}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold">
                      {sec.isPublished ? '✓ प्रकाशित' : 'अप्रकाशित'}
                    </span>
                  </div>

                  <h4 className="font-bold text-stone-100 text-lg mt-2 font-serif">
                    {sec.title}
                  </h4>
                  {sec.subtitle && (
                    <p className="text-xs text-amber-300/80 font-medium">{sec.subtitle}</p>
                  )}

                  {sec.mediaUrl && (
                    <div className="h-32 rounded-xl overflow-hidden border border-amber-900/60 mt-2 bg-black">
                      <img src={sec.mediaUrl} alt={sec.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <p className="text-xs text-stone-300 line-clamp-4 mt-2 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-stone-800">
                    {sec.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-amber-900/40 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(sec)}
                    className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded flex items-center gap-1 text-[11px] font-semibold transition-colors"
                    title="सेक्शन हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हटाएं</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditSection(sec)}
                    className="festive-btn-gold text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>संपादित करें</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- BANNER CREATE / EDIT MODAL --- */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-6">
            <button
              onClick={() => setIsBannerModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-amber-200 font-serif mb-1">
              {editingBanner ? 'CMS बैनर संपादित करें' : 'नया CMS बैनर जोड़ें'}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              वेबसाइट के होमपेज अथवा संबंधित पेज पर दिखने वाला आकर्षक इमेज बैनर निर्धारित करें।
            </p>

            <form onSubmit={handleSaveBanner} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">बैनर मुख्य शीर्षक *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="उदा. अखिल बिहार राज्यस्तरीय कबड्डी महाकुंभ 2026"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">उपशीर्षक / विवरण</label>
                <textarea
                  rows={2}
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="उदा. परोरा की पावन धरा पर 16 शीर्ष आमंत्रित टीमों का रोमांचक खिताबी मुकाबला"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">इमेज URL (Image URL) *</label>
                <input
                  type="url"
                  required
                  value={bannerForm.imageUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... अथवा इमेज लिंक"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
                {/* Presets for Realtime Images */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-stone-400">त्वरित प्रीसेट:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setBannerForm({
                        ...bannerForm,
                        title: 'श्री श्री 108 माँ काली दिव्य दर्शन – परोरा',
                        subtitle: 'परौरा, बेगूसराय (बिहार - 851217) – पावन वार्षिक काली पूजा महोत्सव एवं दिव्य आरती दर्शन',
                        badgeText: '🔴 दिव्य पावन दर्शन 2026',
                        imageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1600&q=80',
                        buttonText: 'दिव्य दर्शन व आरती',
                        linkUrl: '/events',
                      })
                    }
                    className="px-2 py-0.5 rounded text-[10px] bg-red-950/80 border border-red-500/40 text-red-200 hover:bg-red-900 cursor-pointer"
                  >
                    🙏 माँ काली दिव्य दर्शन
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBannerForm({
                        ...bannerForm,
                        title: 'अखिल बिहार राज्य स्तरीय कबड्डी महासंग्राम',
                        subtitle: 'मुख्य संरक्षक व मार्गदर्शक: श्री अमरनाथ प्रसाद (6203510983) | अत्याधुनिक मैट व डे-नाईट फ्लडलाइट्स कोर्ट',
                        badgeText: 'कबड्डी - परोरा महोत्सव की धड़कन',
                        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1600&q=80',
                        buttonText: 'कबड्डी एरिना व खिलाड़ी प्रोफाइल देखें',
                        linkUrl: '/kabaddi',
                      })
                    }
                    className="px-2 py-0.5 rounded text-[10px] bg-amber-950/80 border border-amber-500/40 text-amber-200 hover:bg-amber-900 cursor-pointer"
                  >
                    🏆 कबड्डी महाकुंभ
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">प्रदर्शित पेज (Target Page) *</label>
                  <select
                    value={bannerForm.page}
                    onChange={(e) => setBannerForm({ ...bannerForm, page: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 font-bold"
                  >
                    <option value="HOMEPAGE">मुख्य पृष्ठ (Homepage)</option>
                    <option value="KABADDI">कबड्डी पेज (Kabaddi)</option>
                    <option value="EVENTS">कार्यक्रम (Events)</option>
                    <option value="ABOUT">समिति परिचय (About)</option>
                    <option value="GALLERY">फोटो गैलरी (Gallery)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">बैनर प्रकार (Banner Type) *</label>
                  <select
                    value={bannerForm.bannerType}
                    onChange={(e) => setBannerForm({ ...bannerForm, bannerType: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  >
                    <option value="HERO_SLIDER">हीरो स्लाइडर (Hero Slider)</option>
                    <option value="SPOTLIGHT">स्पॉटलाइट हाइलाइट (Spotlight)</option>
                    <option value="PROMO_BANNER">प्रमोशनल रिबन (Promo Banner)</option>
                    <option value="POPUP_ALERT">पॉपअप अलर्ट (Popup Alert)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">बटन टेक्स्ट (CTA Button)</label>
                  <input
                    type="text"
                    value={bannerForm.buttonText}
                    onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                    placeholder="उदा. कबड्डी लाइव स्कोर देखें"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">क्लिक लिंक (Redirect URL)</label>
                  <input
                    type="text"
                    value={bannerForm.linkUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                    placeholder="/kabaddi अथवा /register"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">बैज टेक्स्ट (Badge Text)</label>
                  <input
                    type="text"
                    value={bannerForm.badgeText}
                    onChange={(e) => setBannerForm({ ...bannerForm, badgeText: e.target.value })}
                    placeholder="उदा. बिहार का गौरव"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">क्रम संख्या (Sort Order)</label>
                  <input
                    type="number"
                    value={bannerForm.sortOrder}
                    onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bannerActiveCheck"
                  checked={bannerForm.isActive}
                  onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                  className="rounded border-amber-600 text-amber-500"
                />
                <label htmlFor="bannerActiveCheck" className="text-stone-300 font-semibold cursor-pointer">
                  वेबसाइट पर लाइव प्रदर्शित करें (Active)
                </label>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 bg-black/70 border border-amber-500/40 rounded-xl space-y-1.5">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  👁️ रीयल-टाइम पूर्वावलोकन (Live Preview)
                </span>
                <div className="relative h-44 rounded-xl overflow-hidden border border-amber-500/30 bg-black">
                  <img
                    src={bannerForm.imageUrl || 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=80'}
                    alt="Preview"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-950 via-maroon-950/40 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-red-600 text-white font-bold">
                      {bannerForm.badgeText || '🔴 दिव्य दर्शन'}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <h4 className="text-xs font-bold text-amber-200 truncate font-serif">
                      {bannerForm.title || 'बैनर मुख्य शीर्षक यहाँ दिखेगा'}
                    </h4>
                    <p className="text-[10px] text-stone-300 truncate">
                      {bannerForm.subtitle || 'उपशीर्षक एवं विवरण'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 bg-black/50 text-stone-300 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-5 py-2"
                >
                  {loading ? 'सहेज रहे हैं...' : editingBanner ? 'अपडेट सुरक्षित करें' : 'बैनर प्रकाशित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SECTION EDIT / CREATE MODAL --- */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-6">
            <button
              type="button"
              onClick={() => setEditingSection(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-amber-200 font-serif mb-1">
              {isCreatingSection ? 'नया पेज सामग्री सेक्शन जोड़ें' : 'पेज सामग्री सेक्शन संपादित करें'}
            </h3>
            <p className="text-xs text-stone-400 mb-4 font-mono">
              Key: {sectionForm.sectionKey}
            </p>

            <form onSubmit={handleSaveSection} className="space-y-3.5 text-xs">
              {isCreatingSection && (
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">सेक्शन की (Unique Section Key) *</label>
                  <input
                    type="text"
                    required
                    value={sectionForm.sectionKey}
                    onChange={(e) =>
                      setSectionForm({
                        ...sectionForm,
                        sectionKey: e.target.value.toUpperCase().replace(/\s+/g, '_'),
                      })
                    }
                    placeholder="उदा. ABOUT_HISTORY, ABOUT_CHANDIKA_ASTHAN"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 font-mono"
                  />
                  <span className="text-[10px] text-amber-400/80">
                    सुझाव: About Page के लिए "ABOUT_" से शुरू होने वाली Key रखें।
                  </span>
                </div>
              )}

              <div>
                <label className="block text-stone-300 font-semibold mb-1">सेक्शन शीर्षक (Title) *</label>
                <input
                  type="text"
                  required
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  placeholder="उदा. माँ चंडिका स्थान, परोरा का इतिहास"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">उपशीर्षक (Subtitle)</label>
                <input
                  type="text"
                  value={sectionForm.subtitle}
                  onChange={(e) => setSectionForm({ ...sectionForm, subtitle: e.target.value })}
                  placeholder="उदा. स्थापना वर्ष 1984 से अविरल"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">चित्र URL (Image Link - Optional)</label>
                <input
                  type="url"
                  value={sectionForm.mediaUrl}
                  onChange={(e) => setSectionForm({ ...sectionForm, mediaUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... अथवा इमेज लिंक"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">पूर्ण सामग्री पाठ (Content) *</label>
                <textarea
                  rows={5}
                  required
                  value={sectionForm.content}
                  onChange={(e) => setSectionForm({ ...sectionForm, content: e.target.value })}
                  placeholder="यहाँ विस्तृत इतिहास, परंपरा एवं विवरण लिखें..."
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sectionPublishedCheck"
                  checked={sectionForm.isPublished}
                  onChange={(e) => setSectionForm({ ...sectionForm, isPublished: e.target.checked })}
                  className="rounded border-amber-600 text-amber-500"
                />
                <label htmlFor="sectionPublishedCheck" className="text-stone-300 font-semibold cursor-pointer">
                  वेबसाइट पर प्रकाशित रखें (Published)
                </label>
              </div>

              {/* Live Preview Box */}
              {sectionForm.mediaUrl && (
                <div className="p-3 bg-black/70 border border-amber-500/40 rounded-xl space-y-1.5">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                    👁️ चित्र पूर्वावलोकन (Image Preview)
                  </span>
                  <div className="relative h-40 rounded-xl overflow-hidden border border-amber-500/30 bg-black">
                    <img
                      src={sectionForm.mediaUrl}
                      alt="Section preview"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-maroon-950 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <h4 className="text-xs font-bold text-amber-200 truncate font-serif">
                        {sectionForm.title || 'सेक्शन शीर्षक'}
                      </h4>
                      <p className="text-[10px] text-stone-300 truncate">
                        {sectionForm.subtitle || 'उपशीर्षक'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 bg-black/50 text-stone-300 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-5 py-2 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? 'सहेज रहे हैं...' : 'सुरक्षित करें'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

