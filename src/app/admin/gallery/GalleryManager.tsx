'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, PlusCircle, CheckCircle2, X, ExternalLink } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  titleHindi?: string | null;
  category: string;
  coverImageUrl: string;
  media: {
    id: string;
    mediaUrl: string;
    caption?: string | null;
  }[];
}

export default function GalleryManager({
  initialGalleries,
  festivalYear,
}: {
  initialGalleries: GalleryItem[];
  festivalYear: number;
}) {
  const [galleries, setGalleries] = useState<GalleryItem[]>(initialGalleries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [albumForm, setAlbumForm] = useState({
    title: '',
    titleHindi: '',
    category: 'PUJA',
    coverImageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=80',
  });

  const [mediaForm, setMediaForm] = useState({
    mediaUrl: '',
    caption: '',
  });

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_ALBUM',
          albumData: albumForm,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सहेजने में विफल');

      setGalleries([{ ...data.gallery, media: [] }, ...galleries]);
      setIsModalOpen(false);
      setFeedback('नया फोटो एल्बम सफलतापूर्वक बनाया गया!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_MEDIA',
          mediaData: {
            galleryId: selectedGalleryId,
            mediaUrl: mediaForm.mediaUrl,
            caption: mediaForm.caption,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'तस्वीर जोड़ने में विफल');

      setGalleries(
        galleries.map((g) =>
          g.id === selectedGalleryId ? { ...g, media: [...g.media, data.media] } : g
        )
      );
      setIsMediaModalOpen(false);
      setFeedback('तस्वीर सफलतापूर्वक एल्बम में जोड़ दी गई!');
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
            Media & Photo Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
            फोटो एवं वीडियो गैलरी प्रबंधन ({festivalYear})
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            वार्षिक एल्बम निर्माण, फोटो अपलोड, कैप्शन संपादन एवं पब्लिक गैलरी सिंक
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="festive-btn-gold text-xs px-4 py-2 flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-maroon-950" />
          <span>नया एल्बम बनाएं</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid of Albums */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((album) => (
          <div key={album.id} className="festive-card overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-video">
              <img
                src={album.coverImageUrl}
                alt={album.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                {album.category}
              </span>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <h3 className="font-bold text-stone-100 text-base">{album.titleHindi || album.title}</h3>
                <span className="text-xs text-stone-400">कुल तस्वीरें: {album.media.length}</span>
              </div>

              <div className="pt-2 border-t border-amber-900/40 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedGalleryId(album.id);
                    setIsMediaModalOpen(true);
                  }}
                  className="festive-btn-gold text-[10px] px-3 py-1 font-bold cursor-pointer"
                >
                  + तस्वीर जोड़ें
                </button>

                <a
                  href="/gallery"
                  target="_blank"
                  className="text-xs text-amber-400 hover:text-amber-200 flex items-center gap-1"
                >
                  <span>गैलरी देखें</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ALBUM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3 mb-4">
              <h3 className="text-xl font-bold text-amber-300 font-serif">नया फोटो एल्बम बनाएं</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-amber-200">एल्बम का नाम (हिंदी) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. माँ काली निशा पूजा एवं दीपदान 2026"
                  value={albumForm.titleHindi}
                  onChange={(e) =>
                    setAlbumForm({
                      ...albumForm,
                      titleHindi: e.target.value,
                      title: e.target.value,
                    })
                  }
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">श्रेणी (Category) *</label>
                <select
                  value={albumForm.category}
                  onChange={(e) => setAlbumForm({ ...albumForm, category: e.target.value })}
                  className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                >
                  <option value="PUJA">माँ काली पूजा व मंडप</option>
                  <option value="KABADDI">कबड्डी महाकुंभ मैच</option>
                  <option value="CULTURAL">सांस्कृतिक संध्या</option>
                  <option value="PRIZE_DISTRIBUTION">पुरस्कार एवं सम्मान</option>
                  <option value="PREPARATION">तैयारी व पंडाल निर्माण</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">कवर फोटो URL (Cloudinary / Web)</label>
                <input
                  type="url"
                  required
                  value={albumForm.coverImageUrl}
                  onChange={(e) => setAlbumForm({ ...albumForm, coverImageUrl: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none"
                />
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
                  {loading ? 'सहेजा जा रहा है...' : 'एल्बम बनाएं'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PHOTO MODAL */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3 mb-4">
              <h3 className="text-xl font-bold text-amber-300 font-serif">एल्बम में तस्वीर जोड़ें</h3>
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-amber-200">फोटो URL (Cloudinary / Image Link) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/... या https://res.cloudinary.com/..."
                  value={mediaForm.mediaUrl}
                  onChange={(e) => setMediaForm({ ...mediaForm, mediaUrl: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">कैप्शन (विवरण)</label>
                <input
                  type="text"
                  placeholder="उदा. मुख्य मंडप में माँ काली का दिव्य स्वरूप"
                  value={mediaForm.caption}
                  onChange={(e) => setMediaForm({ ...mediaForm, caption: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-amber-900/50">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-700 text-stone-300"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-6 py-2 font-bold cursor-pointer"
                >
                  {loading ? 'अपलोड हो रहा है...' : 'तस्वीर जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
