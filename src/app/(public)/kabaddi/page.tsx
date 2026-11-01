import React from 'react';
import prisma from '@/lib/prisma';
import KabaddiArenaClient from './KabaddiArenaClient';

export const dynamic = 'force-dynamic';

export default async function KabaddiPage() {
  let activeYear: any = null;
  let rawTeams: any[] = [];
  let rawMatches: any[] = [];

  try {
    activeYear = await prisma.festivalYear.findFirst({
      where: { isActive: true },
    });

    rawTeams = await prisma.kabaddiTeam.findMany({
      where: activeYear ? { festivalYearId: activeYear.id } : {},
      include: {
        players: true,
      },
      orderBy: [{ points: 'desc' }, { matchesWon: 'desc' }],
    });

    rawMatches = await prisma.kabaddiMatch.findMany({
      where: activeYear ? { festivalYearId: activeYear.id } : {},
      include: {
        teamA: { select: { teamName: true } },
        teamB: { select: { teamName: true } },
      },
      orderBy: [{ status: 'asc' }, { matchNumber: 'asc' }],
    });
  } catch (error) {
    console.error('Error loading Kabaddi data:', error);
  }

  const formattedMatches = rawMatches.map((m) => ({
    ...m,
    scheduledTime: m.scheduledTime ? new Date(m.scheduledTime).toISOString() : null,
  }));

  return (
    <KabaddiArenaClient
      teams={rawTeams as any}
      matches={formattedMatches}
      festivalYear={activeYear?.year || 2026}
    />
  );
}
