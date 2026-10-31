import React from 'react';
import prisma from '@/lib/prisma';
import KabaddiScoreManager from './KabaddiScoreManager';

export const dynamic = 'force-dynamic';

export default async function AdminKabaddiPage({
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

  const matches = await prisma.kabaddiMatch.findMany({
    where: { festivalYearId: festivalYear?.id },
    include: { teamA: true, teamB: true },
    orderBy: { matchNumber: 'asc' },
  });

  const teams = await prisma.kabaddiTeam.findMany({
    where: { festivalYearId: festivalYear?.id },
    orderBy: [{ points: 'desc' }, { matchesWon: 'desc' }],
  });

  return (
    <KabaddiScoreManager
      initialMatches={matches}
      teams={teams}
      festivalYear={festivalYear?.year || 2026}
    />
  );
}
