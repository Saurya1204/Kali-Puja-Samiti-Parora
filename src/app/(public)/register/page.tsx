import React from 'react';
import prisma from '@/lib/prisma';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import RegistrationForm from './RegistrationForm';

export const dynamic = 'force-dynamic';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: { type?: string; eventId?: string };
}) {
  const activeYear = await prisma.festivalYear.findFirst({
    where: { isActive: true },
  });

  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      ...(activeYear ? { festivalYearId: activeYear.id } : {}),
    },
    include: {
      category: true,
    },
    orderBy: { date: 'asc' },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <DiyaAnimation size="sm" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            Official Registration Portal
          </span>
          <DiyaAnimation size="sm" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-amber-300 font-serif">
          ऑनलाइन प्रतियोगिता व सेवा पंजीकरण
        </h1>
        <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
          काली पूजा महोत्सव {activeYear?.year || 2026} में कबड्डी प्रतियोगिता, सांस्कृतिक गायन/नृत्य प्रस्तुति अथवा स्वयंसेवक (Volunteer) सेवा हेतु अपना पंजीकरण करें और डिजिटल पर्ची प्राप्त करें।
        </p>
      </div>

      <RegistrationForm
        events={events}
        initialType={searchParams?.type}
        initialEventId={searchParams?.eventId}
      />
    </div>
  );
}

