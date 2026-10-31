'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Share2, Calendar } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  titleHindi?: string | null;
  category: string;
  coverImageUrl: string;
  media: {
    id: string;
    mediaType: string;
    mediaUrl: string;
    caption?: string | null;
  }[];
}

export default function GalleryClient({
  years,
  selectedYear,
  selectedCategory,
  galleries,
}: {
  years: number[];
  selectedYear: number;
  selectedCategory?: string;
  galleries: GalleryItem[];
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Flatten media items for smooth lightbox viewing
  const allMedia = galleries.flatMap((g) =>
    g.media.map((m) => ({
      ...m,
      albumTitle: g.titleHindi || g.title,
    }))
  );

  const categories = [
    { key: 'PUJA', label: 'माँ काली पूजा व पंडाल' },
    { key: 'KABADDI', label: 'कबड्डी मैच व खिलाड़ी' },
    { key: 'CULTURAL', label: 'सांस्कृतिक संध्या व जागरण' },
    { key: 'PRIZE_DISTRIBUTION', label: 'पुरस्कार व सम्मान' },
  ];

  const handleNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % allMedia.length);
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + allMedia.length) % allMedia.length);
    }
  };

  return (
    <div className="space-y-8">
      {/* Filters bar: Year & Category */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-900/40 pb-6">
        {/* Year Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider mr-1">
            वर्ष चुनें:
          </span>
          {years.map((y) => (
            <Link
              key={y}
              href={`/gallery?year=${y}${selectedCategory ? `&category=${selectedCategory}` : ''}`}
              className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono transition-all ${
                selectedYear === y
                  ? 'bg-amber-500 text-maroon-950 shadow-md font-extrabold'
                  : 'bg-black/50 text-stone-300 hover:bg-maroon-900 border border-amber-700/40'
              }`}
            >
              {y}
            </Link>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/gallery?year=${selectedYear}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              !selectedCategory
                ? 'bg-amber-500 text-maroon-950 shadow'
                : 'bg-black/40 text-stone-300 hover:bg-maroon-900 border border-amber-800/40'
            }`}
          >
            सभी (All)
          </Link>
          {categories.map((c) => (
            <Link
              key={c.key}
              href={`/gallery?year=${selectedYear}&category=${c.key}`}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === c.key
                  ? 'bg-amber-500 text-maroon-950 shadow'
                  : 'bg-black/40 text-stone-300 hover:bg-maroon-900 border border-amber-800/40'
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {allMedia.length === 0 ? (
        <div className="bg-maroon-950/60 border border-amber-600/30 rounded-2xl p-12 text-center text-stone-400">
          <ImageIcon className="w-12 h-12 text-amber-500/50 mx-auto mb-3" />
          <p className="text-base">इस वर्ष/श्रेणी की तस्वीरें शीघ्र अपलोड की जाएंगी।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allMedia.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setLightboxIndex(idx)}
              className="festive-card overflow-hidden group cursor-pointer relative aspect-4/3 flex flex-col justify-end"
            >
              <img
                src={item.mediaUrl}
                alt={item.caption || item.albumTitle}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="relative p-4 z-10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                  {item.albumTitle}
                </span>
                {item.caption && (
                  <p className="text-xs text-stone-200 line-clamp-1">{item.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && allMedia[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 text-stone-300 hover:text-white p-2 rounded-full bg-black/50 hover:bg-stone-800 transition-colors z-50 cursor-pointer"
          >
            <X className="w-7 h-7" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-white p-3 rounded-full bg-black/60 hover:bg-stone-800 transition-colors z-50 cursor-pointer"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-white p-3 rounded-full bg-black/60 hover:bg-stone-800 transition-colors z-50 cursor-pointer"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img
              src={allMedia[lightboxIndex].mediaUrl}
              alt={allMedia[lightboxIndex].caption || 'Gallery Image'}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-amber-600/30"
            />
            <div className="mt-4 text-center space-y-1 text-white">
              <span className="text-xs text-amber-400 font-bold block">
                {allMedia[lightboxIndex].albumTitle} ({lightboxIndex + 1} / {allMedia.length})
              </span>
              {allMedia[lightboxIndex].caption && (
                <p className="text-sm text-stone-300">{allMedia[lightboxIndex].caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

