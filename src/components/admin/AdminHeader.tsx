'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Globe } from 'lucide-react';
import YearSelector from './YearSelector';

export default function AdminHeader({
  years,
  activeYear,
  userName,
  userRole,
}: {
  years: any[];
  activeYear: any;
  userName: string;
  userRole: string;
}) {
  const openMenu = () => {
    window.dispatchEvent(new CustomEvent('open-admin-menu'));
  };

  return (
    <header className="h-16 bg-maroon-950/90 border-b border-amber-600/30 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={openMenu}
          className="lg:hidden p-2 text-amber-300 hover:text-amber-100 bg-black/60 border border-amber-600/40 rounded-xl flex items-center justify-center shrink-0 active:scale-95 shadow"
          title="व्यवस्थापक मेनू खोलें"
          aria-label="मेनू खोलें"
        >
          <Menu className="w-4 h-4" />
        </button>

        <YearSelector years={years} currentYear={activeYear?.year || 2026} />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-100 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 sm:px-3 py-1.5 rounded-full transition-all shrink-0"
          title="पब्लिक वेबसाइट देखें"
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">पब्लिक वेबसाइट</span>
          <span className="sm:hidden text-[11px]">वेबसाइट</span>
        </Link>

        <div className="flex items-center gap-2 border-l border-amber-900/60 pl-2 sm:pl-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-maroon-950 font-bold flex items-center justify-center text-xs shadow shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="hidden md:block text-xs">
            <span className="font-bold text-stone-200 block leading-tight truncate max-w-[130px]">
              {userName}
            </span>
            <span className="text-[10px] text-amber-400 font-mono uppercase">
              {userRole.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

