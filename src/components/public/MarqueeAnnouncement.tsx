'use client';

import React from 'react';
import { Megaphone, Bell } from 'lucide-react';
import Link from 'next/link';

interface MarqueeProps {
  announcementText?: string;
  urgentText?: string;
}

export default function MarqueeAnnouncement({
  announcementText = 'श्री श्री 108 काली पूजा महोत्सव 2026: 9 एवं 10 नवंबर को भव्य आयोजन! कबड्डी प्रतियोगिता एवं मेधावी छात्र सम्मान हेतु ऑनलाइन पंजीकरण प्रारंभ।',
  urgentText,
}: MarqueeProps) {
  return (
    <div className="bg-gradient-to-r from-red-950 via-maroon-900 to-red-950 border-b border-amber-500/30 text-amber-100 text-xs sm:text-sm py-2 px-3 relative overflow-hidden flex items-center shadow-inner z-30">
      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-maroon-950 px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[11px] shrink-0 shadow-md">
        <Bell className="w-3.5 h-3.5 animate-bounce" />
        <span>Live Updates</span>
      </div>

      <div className="flex-1 overflow-hidden ml-3 whitespace-nowrap">
        <div className="inline-block animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] cursor-pointer">
          <span className="font-medium mx-4 text-amber-200">
            {urgentText ? `🚨 ${urgentText} | ` : ''}
            {announcementText}
          </span>
          <span className="mx-6 text-amber-500/60 font-serif">✦ ✦ ✦</span>
          <span className="font-medium mx-4 text-amber-200">
            जय माँ काली! परोरा के समस्त ग्रामवासियों एवं आगंतुकों का हार्दिक अभिनंदन।
          </span>
        </div>
      </div>

      <Link
        href="/notices"
        className="hidden md:inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-200 underline shrink-0 ml-3 font-medium transition-colors"
      >
        <span>सभी सूचनाएं देखें</span>
      </Link>
    </div>
  );
}

