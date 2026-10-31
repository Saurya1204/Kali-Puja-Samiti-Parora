import React from 'react';
import prisma from '@/lib/prisma';
import DonationManager from './DonationManager';

export const dynamic = 'force-dynamic';

export default async function AdminDonationsPage({
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

  const rawDonations = await prisma.donation.findMany({
    where: { festivalYearId: festivalYear?.id },
    orderBy: { donationDate: 'desc' },
  });

  const donations = rawDonations.map((d) => ({
    ...d,
    donationDate: d.donationDate.toISOString(),
  }));

  return (
    <DonationManager
      initialDonations={donations}
      festivalYear={festivalYear?.year || 2026}
    />
  );
}
