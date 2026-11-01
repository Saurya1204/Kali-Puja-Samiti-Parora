import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog, ROLES } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowed = [ROLES.SUPER_ADMIN, ROLES.PRESIDENT, ROLES.SECRETARY, ROLES.KABADDI_ADMIN, ROLES.EVENT_MANAGER];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'आपको कबड्डी स्कोर अपडेट करने की अनुमति नहीं है' }, { status: 403 });
    }

    const { matchId, teamAScore, teamBScore, status, commentary, winnerId } = await req.json();

    const match = await prisma.kabaddiMatch.update({
      where: { id: matchId },
      data: {
        teamAScore: Number(teamAScore),
        teamBScore: Number(teamBScore),
        status,
        commentary,
        winnerId: winnerId || null,
      },
      include: { teamA: true, teamB: true },
    });

    // If match is marked COMPLETED, update points table for Team A and Team B
    if (status === 'COMPLETED') {
      const isTeamAWinner = match.teamAScore > match.teamBScore;
      const isTeamBWinner = match.teamBScore > match.teamAScore;
      const isTie = match.teamAScore === match.teamBScore;

      // Update Team A
      await prisma.kabaddiTeam.update({
        where: { id: match.teamAId },
        data: {
          matchesPlayed: { increment: 1 },
          matchesWon: isTeamAWinner ? { increment: 1 } : undefined,
          matchesLost: isTeamBWinner ? { increment: 1 } : undefined,
          matchesTied: isTie ? { increment: 1 } : undefined,
          points: isTeamAWinner ? { increment: 2 } : isTie ? { increment: 1 } : undefined,
          scoreDiff: { increment: match.teamAScore - match.teamBScore },
        },
      });

      // Update Team B
      await prisma.kabaddiTeam.update({
        where: { id: match.teamBId },
        data: {
          matchesPlayed: { increment: 1 },
          matchesWon: isTeamBWinner ? { increment: 1 } : undefined,
          matchesLost: isTeamAWinner ? { increment: 1 } : undefined,
          matchesTied: isTie ? { increment: 1 } : undefined,
          points: isTeamBWinner ? { increment: 2 } : isTie ? { increment: 1 } : undefined,
          scoreDiff: { increment: match.teamBScore - match.teamAScore },
        },
      });
    }

    const teamAName = match?.teamA?.teamName || 'टीम A';
    const teamBName = match?.teamB?.teamName || 'टीम B';

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'UPDATE_KABADDI_SCORE',
      module: 'KABADDI',
      recordId: match.id,
      details: `${user.name} updated score for Match #${match.matchNumber}: ${teamAName} (${match.teamAScore}) vs ${teamBName} (${match.teamBScore})`,
    });

    return NextResponse.json({ success: true, match });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
