import React from 'react';
import prisma from '@/lib/prisma';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import GalleryClient from './GalleryClient';

export const dynamic = 'force-dynamic';

export default async function GalleryPage({
  searchParams,
}: {
  searchParams?: { year?: string; category?: string };
}) {
  const years = await prisma.festivalYear.findMany({
    orderBy: { year: 'desc' },
  });

  const selectedYearInt = searchParams?.year ? parseInt(searchParams.year) : (years[0]?.year || 2026);
  const selectedCategory = searchParams?.category;

  const targetYear = years.find((y) => y.year === selectedYearInt) || years[0];

  const galleries = await prisma.gallery.findMany({
    where: {
      ...(targetYear ? { festivalYearId: targetYear.id } : {}),
      ...(selectedCategory ? { category: selectedCategory } : {}),
    },
    include: {
      media: {
        orderBy: { sortOrder: 'asc' },
      },
      festivalYear: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <DiyaAnimation size="sm" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            Festival Memories & Moments
          </span>
          <DiyaAnimation size="sm" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-amber-300 font-serif">
          काली पूजा एवं खेल महोत्सव गैलरी
        </h1>
        <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
          माँ काली की मनमोहक झांकियां, भव्य पंडाल, विद्युत सज्जा, कबड्डी के रोमांचक क्षण एवं मेधावी छात्र सम्मान समारोह की ऐतिहासिक तस्वीरें।
        </p>
      </div>

      <GalleryClient
        years={years.map((y) => y.year)}
        selectedYear={selectedYearInt}
        selectedCategory={selectedCategory}
        galleries={galleries}
      />
    </div>
  );
}
