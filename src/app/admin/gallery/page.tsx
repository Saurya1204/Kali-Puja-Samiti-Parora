import React from 'react';
import prisma from '@/lib/prisma';
import GalleryManager from './GalleryManager';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage({
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

  const galleries = await prisma.gallery.findMany({
    where: { festivalYearId: festivalYear?.id },
    include: {
      media: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <GalleryManager
      initialGalleries={galleries}
      festivalYear={festivalYear?.year || 2026}
    />
  );
}

