'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Maximize2,
  X,
  Flame,
  Share2,
  Eye,
} from 'lucide-react';

export interface CmsBannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  badgeText?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  buttonText?: string | null;
  sortOrder: number;
}

interface HeroBannerSliderProps {
  banners: CmsBannerItem[];
}

export default function HeroBannerSlider({ banners }: HeroBannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto rotation every 6 seconds (pauses when user interacts)
  useEffect(() => {
    if (banners.length <= 1 || isPaused || isFullscreen) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length, isPaused, isFullscreen]);

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // Touch Swipe Handlers for mobile users
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  return (
    <>
      <div
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.2)] bg-black/95 select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* ENLARGED HERO CANVAS - Tall and majestic for real deity Darshan */}
        <div className="relative h-[480px] sm:h-[560px] md:h-[640px] lg:h-[700px] w-full overflow-hidden">
          {/* Main Photo: High Clarity, Uncropped Deity Headroom */}
          <img
            key={current.id}
            src={current.imageUrl}
            alt={current.title}
            className="w-full h-full object-cover object-center sm:object-top transition-transform duration-1000 ease-out filter contrast-105"
            loading="eager"
          />

          {/* Decorative Toran Arch Border Aura (Festive Temple Feeling) */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 shadow-glow-gold pointer-events-none" />

          {/* Bottom Gradient Scrim - Keeps deity 70% visible while making bottom text 100% readable */}
          <div className="absolute inset-x-0 bottom-0 h-[65%] sm:h-[55%] bg-gradient-to-t from-maroon-950 via-maroon-950/80 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* Top Controls: Live Badge, Slide Counter, Full Darshan Button */}
          <div className="absolute top-4 inset-x-4 sm:inset-x-6 flex items-center justify-between z-20">
            {/* Live Counter / Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white font-mono text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-lg border border-red-400/50 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>{current.badgeText || '🔴 दिव्य दर्शन'}</span>
              </span>

              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-mono font-bold border border-amber-500/40">
                {currentIndex + 1} / {banners.length}
              </span>
            </div>

            {/* Tap to Fullscreen Darshan Lightbox */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-amber-500 hover:text-maroon-950 text-amber-200 border border-amber-500/50 text-xs font-bold transition-all backdrop-blur-md shadow-lg"
              title="भव्य पूर्ण दर्शन (Full View)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">पूर्ण दर्शन (Full View)</span>
              <span className="sm:hidden">दर्शन</span>
            </button>
          </div>

          {/* Tap-on-Image Prompt for Mobile Devotees */}
          <div
            onClick={() => setIsFullscreen(true)}
            className="absolute top-1/4 inset-x-0 mx-auto w-fit px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-[11px] text-amber-200/80 cursor-pointer sm:hidden z-10"
          >
            👆 फोटो छूकर पूरा दर्शन करें
          </div>

          {/* Bottom Content Area: Title, Subtitle, CTA Actions */}
          <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 md:p-12 flex flex-col justify-end text-left z-20">
            <div className="max-w-3xl space-y-3 sm:space-y-4">
              {/* Deity / Festival Headline */}
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-amber-100 font-serif leading-tight drop-shadow-md">
                {current.title}
              </h2>

              {/* Subtitle / Description */}
              {current.subtitle && (
                <p className="text-xs sm:text-base md:text-lg text-stone-200 line-clamp-2 sm:line-clamp-3 leading-relaxed font-medium drop-shadow">
                  {current.subtitle}
                </p>
              )}

              {/* CTA Action Buttons & Quick Interaction */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {current.linkUrl ? (
                  <Link
                    href={current.linkUrl}
                    className="festive-btn-gold text-xs sm:text-sm px-6 py-3 flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-transform"
                  >
                    <span>{current.buttonText || 'अधिक जानें'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="festive-btn-gold text-xs sm:text-sm px-6 py-3 flex items-center gap-2 shadow-xl"
                  >
                    <Eye className="w-4 h-4" />
                    <span>दिव्य दर्शन करें</span>
                  </button>
                )}

                <button
                  onClick={() => setIsFullscreen(true)}
                  className="px-4 py-3 rounded-xl bg-black/60 hover:bg-black/80 text-amber-300 font-bold text-xs sm:text-sm border border-amber-500/50 flex items-center gap-1.5 transition-all backdrop-blur-sm shadow"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>बड़ी स्क्रीन पर देखें</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Arrows for Desktop & Tablets */}
          {banners.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-black/70 hover:bg-amber-500 hover:text-maroon-950 text-white items-center justify-center border border-amber-500/50 transition-all backdrop-blur-sm z-20 shadow-xl group/btn"
              >
                <ChevronLeft className="w-6 h-6 group-hover/btn:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Slide"
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-black/70 hover:bg-amber-500 hover:text-maroon-950 text-white items-center justify-center border border-amber-500/50 transition-all backdrop-blur-sm z-20 shadow-xl group/btn"
              >
                <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>

              {/* Progress Dots Indicator - Large & Touch Friendly */}
              <div className="absolute bottom-4 right-4 sm:right-8 flex items-center gap-2 z-20 bg-black/50 px-3 py-1.5 rounded-full border border-amber-500/30 backdrop-blur-md">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all rounded-full ${
                      currentIndex === idx
                        ? 'w-7 sm:w-8 h-2.5 bg-gradient-to-r from-amber-400 to-amber-500 shadow-glow-gold'
                        : 'w-2.5 h-2.5 bg-stone-500/60 hover:bg-stone-300'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* FULLSCREEN REALTIME MAA KALI DARSHAN LIGHTBOX (100% UNRESTRICTED HOLY VIEW) */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200">
          {/* Lightbox Top Header */}
          <div className="flex items-center justify-between z-10 bg-black/60 p-3 rounded-2xl border border-amber-500/30">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-amber-200 font-serif truncate">
                  {current.title}
                </h3>
                <span className="text-[10px] sm:text-xs text-stone-400">
                  परौरा, बेगूसराय – माँ काली पावन दर्शन (HD Realtime View)
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-full bg-maroon-900/80 hover:bg-amber-500 hover:text-maroon-950 text-white border border-amber-500/40 transition-colors shrink-0"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Full High-Resolution Uncropped Deity Image */}
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden relative">
            <img
              src={current.imageUrl}
              alt={current.title}
              className="max-h-[78vh] max-w-full object-contain rounded-2xl shadow-2xl border border-amber-500/30"
            />
          </div>

          {/* Lightbox Bottom Footer with Sacred Prayer & Navigation */}
          <div className="bg-black/70 border border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left z-10">
            <div>
              <p className="text-xs sm:text-sm text-amber-100 font-serif">
                || ॐ जयन्ती मङ्गला काली भद्रकाली कपालिनी। दुर्गा क्षमा शिवा धात्री स्वाहा स्वधा नमोऽस्तु ते॥ ||
              </p>
              <p className="text-[11px] text-stone-400">
                श्री श्री 108 काली पूजा समिति परोरा (बेगूसराय, बिहार - 851217)
              </p>
            </div>

            <div className="flex items-center gap-2">
              {banners.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="p-2 rounded-xl bg-maroon-950 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-maroon-950 text-xs font-bold"
                  >
                    ◀ पिछला दर्शन
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2 rounded-xl bg-maroon-950 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-maroon-950 text-xs font-bold"
                  >
                    अगला दर्शन ▶
                  </button>
                </>
              )}
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-maroon-950 font-bold text-xs shadow-md"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
