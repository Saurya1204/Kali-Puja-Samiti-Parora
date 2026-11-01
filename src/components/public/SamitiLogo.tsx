'use client';

import React from 'react';
import Link from 'next/link';

interface SamitiLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  href?: string;
}

export default function SamitiLogo({
  size = 'md',
  showSubtitle = true,
  href = '/',
}: SamitiLogoProps) {
  // Sizing styles
  const iconDimensions = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12',
    lg: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16',
  }[size];

  const titleStyles = {
    sm: 'text-xs sm:text-sm font-bold',
    md: 'text-sm sm:text-base md:text-lg font-extrabold',
    lg: 'text-lg sm:text-xl md:text-2xl font-black',
  }[size];

  const subStyles = {
    sm: 'text-[9px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-xs',
  }[size];

  const content = (
    <div className="flex items-center gap-2 sm:gap-3 group select-none shrink-0">
      {/* Divine Festive Emblem SVG */}
      <div
        className={`${iconDimensions} shrink-0 relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-red-600 to-maroon-950 p-1 shadow-lg shadow-amber-500/20 group-hover:shadow-glow-gold transition-all duration-300 transform group-hover:scale-105 border border-amber-400/40`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Sun Rays / Aura */}
          <circle cx="50" cy="50" r="44" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
          <circle cx="50" cy="50" r="40" fill="#450a0a" stroke="#f59e0b" strokeWidth="2" />

          {/* Divine Kalash base */}
          <path
            d="M32 68 Q50 82 68 68 L64 56 Q50 62 36 56 Z"
            fill="url(#kalashGradLogo)"
            stroke="#fbbf24"
            strokeWidth="1.5"
          />

          {/* Sacred Trishul */}
          <path
            d="M50 20 L50 64 M50 20 L40 32 M50 20 L60 32 M38 34 Q50 42 62 34"
            stroke="#fef3c7"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Holy Flame / Diya Jyoti on Top */}
          <path
            d="M50 14 Q54 22 50 27 Q46 22 50 14 Z"
            fill="#f59e0b"
            className="animate-pulse"
          />
          <circle cx="50" cy="22" r="2.5" fill="#ef4444" />

          {/* Sacred Tilak / Chandrabindu */}
          <path
            d="M44 48 Q50 52 56 48"
            stroke="#dc2626"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="50" cy="45" r="2" fill="#facc15" />

          {/* Gradients */}
          <defs>
            <linearGradient id="kalashGradLogo" x1="32" y1="56" x2="68" y2="78" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b" />
              <stop offset="0.5" stopColor="#d97706" />
              <stop offset="1" stopColor="#b45309" />
            </linearGradient>
          </defs>
        </svg>

        {/* Subtle Live Diya Flicker dot */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-maroon-950 shadow-md animate-ping opacity-75" />
      </div>

      {/* Brand Typography - Guaranteed never to collide or overlap */}
      <div className="flex flex-col justify-center shrink-0">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span
            className={`${titleStyles} font-serif tracking-tight text-amber-200 group-hover:text-amber-300 transition-colors leading-tight whitespace-nowrap`}
          >
            काली पूजा समिति
          </span>
          <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-maroon-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-sans tracking-wide uppercase shadow shrink-0 whitespace-nowrap">
            परोरा
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
            <span
              className={`${subStyles} text-amber-300/85 font-mono tracking-wider uppercase font-semibold whitespace-nowrap`}
            >
              Kali Puja Samiti Parora
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-amber-500 shrink-0" />
            <span className="text-[10px] sm:text-[11px] text-amber-200/70 font-medium whitespace-nowrap">
              बेगूसराय (851217)
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none shrink-0 group">
        {content}
      </Link>
    );
  }

  return content;
}
