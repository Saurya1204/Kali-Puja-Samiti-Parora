import React from 'react';
import prisma from '@/lib/prisma';
import KabaddiArenaClient from './KabaddiArenaClient';

export const dynamic = 'force-dynamic';

export default async function KabaddiPage() {
  const activeYear = await prisma.festivalYear.findFirst({
    where: { isActive: true },
  });

  const rawTeams = await prisma.kabaddiTeam.findMany({
    where: activeYear ? { festivalYearId: activeYear.id } : {},
    include: {
      players: true,
    },
    orderBy: [{ points: 'desc' }, { matchesWon: 'desc' }],
  });

  const rawMatches = await prisma.kabaddiMatch.findMany({
    where: activeYear ? { festivalYearId: activeYear.id } : {},
    include: {
      teamA: { select: { teamName: true } },
      teamB: { select: { teamName: true } },
    },
    orderBy: [{ status: 'asc' }, { matchNumber: 'asc' }],
  });

  const formattedMatches = rawMatches.map((m) => ({
    ...m,
    scheduledTime: m.scheduledTime ? m.scheduledTime.toISOString() : null,
  }));

  return (
    <KabaddiArenaClient
      teams={rawTeams as any}
      matches={formattedMatches}
      festivalYear={activeYear?.year || 2026}
    />
  );
}
