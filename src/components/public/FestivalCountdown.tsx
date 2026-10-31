'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/languageContext';
import DiyaAnimation from './DiyaAnimation';
import { Sparkles, Calendar, Clock } from 'lucide-react';

interface CountdownProps {
  startDate?: string | Date;
  endDate?: string | Date;
}

export default function FestivalCountdown({
  startDate = '2026-11-09T08:00:00Z',
  endDate = '2026-11-10T23:59:59Z',
}: CountdownProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    status: 'UPCOMING' as 'UPCOMING' | 'LIVE' | 'COMPLETED',
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      if (now < start) {
        const diff = start - now;
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
          status: 'UPCOMING',
        });
      } else if (now >= start && now <= end) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          status: 'LIVE',
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          status: 'COMPLETED',
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  if (timeLeft.status === 'LIVE') {
    return (
      <div className="bg-gradient-to-r from-red-900/90 via-amber-950/90 to-red-900/90 border border-amber-500/50 rounded-2xl p-6 shadow-glow-gold text-center relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-center gap-4 mb-2">
          <DiyaAnimation size="md" />
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600 text-white animate-pulse">
            🔴 Live Festival Ongoing
          </span>
          <DiyaAnimation size="md" />
        </div>
        <h3 className="text-2xl md:text-3xl font-extrabold text-amber-300 font-serif mb-2">
          {t('Kali Puja Utsav In Progress!', 'श्री श्री काली पूजा महोत्सव जारी है!')}
        </h3>
        <p className="text-amber-100 text-sm md:text-base max-w-xl mx-auto">
          {t(
            'Welcome to Parora! Join the grand festivities, cultural programs, and kabaddi matches today.',
            'परोरा की पावन धरा पर आप सभी श्रद्धालुओं का हार्दिक अभिनंदन! आज के धार्मिक अनुष्ठान एवं खेल कार्यक्रमों में सादर आमंत्रित हैं।'
          )}
        </p>
      </div>
    );
  }

  if (timeLeft.status === 'COMPLETED') {
    return (
      <div className="bg-maroon-950/80 border border-amber-600/30 rounded-2xl p-6 text-center shadow-lg">
        <h3 className="text-2xl font-bold text-amber-300 font-serif mb-2">
          {t('Kali Puja Utsav Concluded Successfully', 'काली पूजा महोत्सव सानंद संपन्न')}
        </h3>
        <p className="text-stone-300 text-sm max-w-lg mx-auto">
          {t(
            'Heartfelt gratitude to all villagers, donors, participants, and volunteers. Explore event highlights & photo gallery.',
            'समस्त ग्रामवासियों, दानदाताओं, खिलाड़ियों एवं स्वयंसेवकों का कोटिशः धन्यवाद। महोत्सव के मुख्य आकर्षण एवं तस्वीरें गैलरी में देखें।'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 mb-3">
        <DiyaAnimation size="sm" />
        <span className="text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {t('Grand Celebration Begins In', 'महोत्सव शुभारंभ में शेष समय')}
        </span>
        <DiyaAnimation size="sm" />
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto">
        {[
          { label: t('Days', 'दिन'), value: timeLeft.days },
          { label: t('Hours', 'घंटे'), value: timeLeft.hours },
          { label: t('Minutes', 'मिनट'), value: timeLeft.minutes },
          { label: t('Seconds', 'सेकंड'), value: timeLeft.seconds },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-b from-maroon-900/90 to-maroon-950/95 border border-amber-500/40 rounded-xl p-2.5 sm:p-4 text-center shadow-md relative overflow-hidden group hover:border-amber-400 transition-all"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 opacity-80" />
            <div className="text-2xl sm:text-4xl font-extrabold text-amber-300 font-mono tracking-tight drop-shadow">
              {String(item.value).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-amber-200/80 uppercase tracking-wider mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
