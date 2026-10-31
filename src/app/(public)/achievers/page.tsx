import React from 'react';
import prisma from '@/lib/prisma';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import AchieverRegistrationForm from './AchieverRegistrationForm';
import { Trophy, GraduationCap, Award, CheckCircle, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AchieversPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const selectedCategory = searchParams?.category;

  const activeYear = await prisma.festivalYear.findFirst({
    where: { isActive: true },
  });

  const achievers = await prisma.studentAchievement.findMany({
    where: {
      isPublished: true,
      status: 'APPROVED',
      ...(selectedCategory ? { category: selectedCategory } : {}),
    },
    orderBy: [{ yearOfPassing: 'desc' }, { createdAt: 'desc' }],
  });

  const categories = [
    { key: 'CLASS_10', label: '10वीं बोर्ड (Matric)' },
    { key: 'CLASS_12', label: '12वीं इंटर (Inter)' },
    { key: 'GRADUATION', label: 'स्नातक (Graduation)' },
    { key: 'GOVT_JOB', label: 'सरकारी सेवा चयन (Govt Job)' },
    { key: 'COMPETITIVE_EXAM', label: 'IIT / NEET / कॉम्पिटिशन' },
    { key: 'SPORTS', label: 'खेलकूद उपलब्धि (Sports)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <DiyaAnimation size="sm" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            Pratibha Samman Wall
          </span>
          <DiyaAnimation size="sm" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-amber-300 font-serif">
          परोरा प्रतिभा सम्मान दीवार
        </h1>
        <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
          हमारे गांव परोरा एवं समीपवर्ती क्षेत्रों के उन होनहार छात्र-छात्राओं की गौरव गाथा जिन्होंने अपनी कड़ी मेहनत से उत्कृष्ट सफलता हासिल कर समाज का मान बढ़ाया है।
        </p>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/achievers"
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            !selectedCategory
              ? 'bg-amber-500 text-maroon-950 shadow-md'
              : 'bg-maroon-900/60 text-stone-300 hover:bg-maroon-800 border border-amber-600/30'
          }`}
        >
          समस्त श्रेणियां (All Achievers)
        </Link>
        {categories.map((c) => (
          <Link
            key={c.key}
            href={`/achievers?category=${c.key}`}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === c.key
                ? 'bg-amber-500 text-maroon-950 shadow-md'
                : 'bg-maroon-900/60 text-stone-300 hover:bg-maroon-800 border border-amber-600/30'
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {/* Wall of Achievers Grid */}
      {achievers.length === 0 ? (
        <div className="bg-maroon-950/60 border border-amber-600/30 rounded-2xl p-12 text-center text-stone-400">
          <GraduationCap className="w-12 h-12 text-amber-500/50 mx-auto mb-3" />
          <p className="text-base">इस श्रेणी में अभी स्वीकृत रिकॉर्ड उपलब्ध नहीं है। नीचे दिए गए फॉर्म से अपना आवेदन दर्ज करें।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievers.map((ach) => (
            <div
              key={ach.id}
              className="festive-card p-6 flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {ach.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    वर्ष {ach.yearOfPassing}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-stone-100 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-current shrink-0" />
                    <span>{ach.studentName}</span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    {ach.guardianName ? `अभिभावक: ${ach.guardianName} | ` : ''}गांव: {ach.village}
                  </p>
                  <p className="text-xs text-amber-200/80 mt-1 font-medium">
                    {ach.schoolOrCollege} ({ach.courseOrClass})
                  </p>
                </div>

                <div className="bg-black/50 border border-amber-500/30 rounded-xl p-3 space-y-1 text-xs">
                  <div className="text-stone-300 font-semibold">{ach.examOrCompetitionName}</div>
                  <div className="text-amber-300 font-extrabold text-sm font-mono">
                    {ach.marksPercentageOrRank}
                  </div>
                </div>

                {ach.remarks && (
                  <p className="text-xs text-stone-400 italic">"{ach.remarks}"</p>
                )}
              </div>

              {ach.prizeAssigned && (
                <div className="pt-3 border-t border-amber-900/50 flex items-center gap-2 text-xs text-amber-300 font-semibold">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>पुरस्कार: {ach.prizeAssigned}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* STUDENT REGISTRATION FORM SECTION */}
      <div id="apply" className="pt-8">
        <AchieverRegistrationForm />
      </div>
    </div>
  );
}
