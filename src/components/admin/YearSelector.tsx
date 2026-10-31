'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';

export default function YearSelector({
  years,
  currentYear,
}: {
  years: { id: string; year: number; name: string; isActive: boolean }[];
  currentYear: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleYearChange = (newYear: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('festivalYear', String(newYear));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 bg-black/60 border border-amber-600/40 rounded-xl px-3 py-1.5 text-xs">
      <Calendar className="w-3.5 h-3.5 text-amber-400" />
      <span className="text-stone-400 font-medium">महोत्सव वर्ष:</span>
      <select
        value={currentYear}
        onChange={(e) => handleYearChange(Number(e.target.value))}
        className="bg-transparent text-amber-300 font-bold font-mono focus:outline-none cursor-pointer"
      >
        {years.map((y) => (
          <option key={y.id} value={y.year} className="bg-maroon-950 text-stone-200">
            {y.year} {y.isActive ? '(सक्रिय / Active)' : '(पुरालेख / Archive)'}
          </option>
        ))}
      </select>
    </div>
  );
}
