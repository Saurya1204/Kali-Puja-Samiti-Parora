import React from 'react';
import prisma from '@/lib/prisma';
import EventManager from './EventManager';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams?: { festivalYear?: string };
}) {
  const reqYear = searchParams?.festivalYear ? parseInt(searchParams.festivalYear) : undefined;

  let festivalYear = reqYear
    ? await prisma.festivalYear.findUnique({ where: { year: reqYear } })
    : await prisma.festivalYear.findFirst({ where: { isActive: true } });

  if (!festivalYear) {
    festivalYear = await prisma.festivalYear.findFirst({ orderBy: { year: 'desc' } });
  }

  const categories = await prisma.eventCategory.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  const rawEvents = await prisma.event.findMany({
    where: { festivalYearId: festivalYear?.id },
    include: { category: true },
    orderBy: { date: 'asc' },
  });

  const events = rawEvents.map((ev) => ({
    ...ev,
    date: ev.date.toISOString(),
  }));

  return (
    <EventManager
      initialEvents={events}
      categories={categories}
      festivalYear={festivalYear?.year || 2026}
    />
  );
}
