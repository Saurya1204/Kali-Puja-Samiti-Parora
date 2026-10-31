'use client';

import React from 'react';

export default function DiyaAnimation({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.3 : 1;

  return (
    <div
      className="inline-flex flex-col items-center justify-center relative select-none"
      style={{ transform: `scale(${scale})` }}
      aria-hidden="true"
    >
      {/* Flame */}
      <div className="relative -mb-1 z-10">
        <div className="diya-flame w-4 h-7 bg-gradient-to-t from-amber-500 via-amber-300 to-yellow-100 rounded-full blur-[0.5px] shadow-[0_0_15px_#f59e0b]" />
        <div className="absolute inset-0 w-2 h-4 mx-auto my-auto bg-white/80 rounded-full blur-[1px]" />
      </div>

      {/* Clay Diya Body */}
      <svg width="38" height="18" viewBox="0 0 38 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1 4C5 14 33 14 37 4C34 16 4 16 1 4Z"
          fill="url(#diyaGradient)"
          stroke="#b45309"
          strokeWidth="1.2"
        />
        <ellipse cx="19" cy="4" rx="18" ry="3" fill="#78350f" />
        <ellipse cx="19" cy="4" rx="14" ry="2" fill="#d97706" />
        <defs>
          <linearGradient id="diyaGradient" x1="1" y1="4" x2="37" y2="16" gradientUnits="userSpaceOnUse">
            <stop stopColor="#b45309" />
            <stop offset="0.5" stopColor="#78350f" />
            <stop offset="1" stopColor="#92400e" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

