import React from 'react';
import prisma from '@/lib/prisma';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import { formatDate } from '@/lib/utils';
import { FileText, Bell, AlertTriangle, Download, Pin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NoticesPage() {
  const activeYear = await prisma.festivalYear.findFirst({
    where: { isActive: true },
  });

  const announcements = await prisma.announcement.findMany({
    where: {
      isActive: true,
      ...(activeYear ? { festivalYearId: activeYear.id } : {}),
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  });

  const notices = await prisma.notice.findMany({
    where: {
      isPublished: true,
      ...(activeYear ? { festivalYearId: activeYear.id } : {}),
    },
    orderBy: { publishDate: 'desc' },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <DiyaAnimation size="sm" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            Official Circulars & Alerts
          </span>
          <DiyaAnimation size="sm" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-amber-300 font-serif">
          आधिकारिक सूचनाएं एवं घोषणाएं
        </h1>
        <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
          श्री श्री 108 काली पूजा समिति परोरा द्वारा जारी आधिकारिक विज्ञप्तियां, खेल दिशा-निर्देश, वाहन पार्किंग योजना एवं आवश्यक घोषणाएं।
        </p>
      </div>

      {/* Announcements */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-amber-300 flex items-center gap-2 border-b border-amber-900/40 pb-2">
          <Bell className="w-5 h-5 text-amber-400" />
          <span>ताजा घोषणाएं एवं अलर्ट्स (Live Announcements)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((an) => (
            <div
              key={an.id}
              className={`p-5 rounded-2xl border transition-all ${
                an.isUrgent
                  ? 'bg-red-950/60 border-red-500/60 shadow-glow-red'
                  : 'festive-card'
              }`}
            >
              <div className="flex items-center justify-between text-xs pb-2 border-b border-amber-900/30">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    an.isUrgent
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {an.isUrgent ? 'अत्यंत आवश्यक (URGENT)' : an.category}
                </span>
                {an.isPinned && (
                  <span className="flex items-center gap-1 text-amber-400 font-bold text-[10px]">
                    <Pin className="w-3 h-3" />
                    <span>पिन किया गया</span>
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-stone-100 mt-2">
                {an.titleHindi || an.title}
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                {an.messageHindi || an.message}
              </p>
              <span className="text-[10px] text-stone-400 mt-3 block">
                जारी दिनांक: {formatDate(an.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Formal Notices & Circulars Table / List */}
      <div className="festive-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-amber-300 font-serif flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-400" />
              <span>समिति परिपत्र एवं अधिसूचनाएं (Official Circulars)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              हस्ताक्षरित एवं अधिकृत सार्वजनिक सूचनाएं
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {notices.map((n) => (
            <div
              key={n.id}
              className="bg-black/40 border border-amber-500/20 rounded-2xl p-5 hover:border-amber-400 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                    {n.circularNumber || 'KPS/NOT/2026'}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    दिनांक: {formatDate(n.publishDate)}
                  </span>
                </div>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-stone-100">
                {n.titleHindi || n.title}
              </h4>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {n.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

