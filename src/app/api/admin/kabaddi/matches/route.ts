import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog, ROLES } from '@/lib/auth';
import { z } from 'zod';

const MatchSchema = z.object({
  id: z.string().optional(),
  matchNumber: z.coerce.number().min(1, 'मैच संख्या आवश्यक है'),
  stage: z.enum(['GROUP_STAGE', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL']).default('GROUP_STAGE'),
  teamAId: z.string().min(1, 'टीम A का चयन करें'),
  teamBId: z.string().min(1, 'टीम B का चयन करें'),
  venue: z.string().optional().nullable(),
  scheduledTime: z.string().optional().nullable(),
  status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED']).default('SCHEDULED'),
  festivalYear: z.coerce.number().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get('festivalYear');

    let yearId: string | undefined;
    if (yearParam) {
      const fy = await prisma.festivalYear.findUnique({ where: { year: parseInt(yearParam) } });
      if (fy) yearId = fy.id;
    } else {
      const activeYear = await prisma.festivalYear.findFirst({ where: { isActive: true } });
      if (activeYear) yearId = activeYear.id;
    }

    const matches = await prisma.kabaddiMatch.findMany({
      where: yearId ? { festivalYearId: yearId } : {},
      include: { teamA: true, teamB: true },
      orderBy: { matchNumber: 'asc' },
    });

    return NextResponse.json({ success: true, matches });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowed = [ROLES.SUPER_ADMIN, ROLES.PRESIDENT, ROLES.SECRETARY, ROLES.KABADDI_ADMIN, ROLES.EVENT_MANAGER];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'आपको कबड्डी मैच प्रबंधित करने की अनुमति नहीं है' }, { status: 403 });
    }

    const body = await req.json();
    const validated = MatchSchema.parse(body);

    if (validated.teamAId === validated.teamBId) {
      return NextResponse.json({ error: 'टीम A और टीम B भिन्न होनी चाहिए' }, { status: 400 });
    }

    let yearId: string | undefined;
    if (validated.festivalYear) {
      const fy = await prisma.festivalYear.findUnique({ where: { year: validated.festivalYear } });
      if (fy) yearId = fy.id;
    }
    if (!yearId) {
      const activeYear = await prisma.festivalYear.findFirst({ where: { isActive: true } });
      if (activeYear) yearId = activeYear.id;
    }

    if (!yearId) {
      return NextResponse.json({ error: 'सक्रिय महोत्सव वर्ष नहीं मिला' }, { status: 400 });
    }

    let match;
    if (validated.id) {
      match = await prisma.kabaddiMatch.update({
        where: { id: validated.id },
        data: {
          matchNumber: validated.matchNumber,
          stage: validated.stage,
          teamAId: validated.teamAId,
          teamBId: validated.teamBId,
          venue: validated.venue || 'हाई स्कूल खेल मैदान, परोरा',
          scheduledTime: validated.scheduledTime ? new Date(validated.scheduledTime) : null,
          status: validated.status,
        },
        include: { teamA: true, teamB: true },
      });
    } else {
      match = await prisma.kabaddiMatch.create({
        data: {
          festivalYearId: yearId,
          matchNumber: validated.matchNumber,
          stage: validated.stage,
          teamAId: validated.teamAId,
          teamBId: validated.teamBId,
          venue: validated.venue || 'हाई स्कूल खेल मैदान, परोरा',
          scheduledTime: validated.scheduledTime ? new Date(validated.scheduledTime) : null,
          status: validated.status,
          teamAScore: 0,
          teamBScore: 0,
        },
        include: { teamA: true, teamB: true },
      });
    }

    const nameA = match?.teamA?.teamName || 'टीम A';
    const nameB = match?.teamB?.teamName || 'टीम B';

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: validated.id ? 'UPDATE_KABADDI_MATCH' : 'CREATE_KABADDI_MATCH',
      module: 'KABADDI',
      recordId: match.id,
      details: `${user.name} saved match #${match.matchNumber}: ${nameA} vs ${nameB}`,
    });

    return NextResponse.json({ success: true, match });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.errors?.[0]?.message || err.message || 'मैच सहेजने में त्रुटि' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowed = [ROLES.SUPER_ADMIN, ROLES.PRESIDENT, ROLES.KABADDI_ADMIN];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'आपको मैच हटाने की अनुमति नहीं है' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'मैच ID आवश्यक है' }, { status: 400 });

    const match = await prisma.kabaddiMatch.findUnique({
      where: { id },
      include: { teamA: true, teamB: true },
    });
    if (!match) return NextResponse.json({ error: 'मैच नहीं मिला' }, { status: 404 });

    await prisma.kabaddiMatch.delete({ where: { id } });

    const nameA = match?.teamA?.teamName || 'टीम A';
    const nameB = match?.teamB?.teamName || 'टीम B';

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'DELETE_KABADDI_MATCH',
      module: 'KABADDI',
      recordId: id,
      details: `${user.name} deleted match #${match.matchNumber}: ${nameA} vs ${nameB}`,
    });

    return NextResponse.json({ success: true, message: 'मैच सफलतापूर्वक हटा दिया गया' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

