import React from 'react';
import prisma from '@/lib/prisma';
import NoticeManager from './NoticeManager';

export const dynamic = 'force-dynamic';

export default async function AdminNoticesPage({
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

  const rawAnnouncements = await prisma.announcement.findMany({
    where: { festivalYearId: festivalYear?.id },
    orderBy: { createdAt: 'desc' },
  });

  const announcements = rawAnnouncements.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <NoticeManager
      initialAnnouncements={announcements}
      festivalYear={festivalYear?.year || 2026}
    />
  );
}
