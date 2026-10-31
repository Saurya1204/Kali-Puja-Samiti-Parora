import React from 'react';
import prisma from '@/lib/prisma';
import RegistrationManager from './RegistrationManager';

export const dynamic = 'force-dynamic';

export default async function AdminRegistrationsPage({
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

  const rawRegistrations = await prisma.eventRegistration.findMany({
    where: { festivalYearId: festivalYear?.id },
    include: {
      event: {
        select: { title: true, titleHindi: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const registrations = rawRegistrations.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <RegistrationManager
      initialRegistrations={registrations}
      festivalYear={festivalYear?.year || 2026}
    />
  );
}
