import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog, ROLES } from '@/lib/auth';
import { z } from 'zod';

const TeamSchema = z.object({
  id: z.string().optional(),
  teamName: z.string().min(2, 'टीम का नाम आवश्यक है'),
  villageOrClub: z.string().optional().nullable(),
  captainName: z.string().min(2, 'कप्तान का नाम आवश्यक है'),
  captainPhone: z.string().min(10, 'मान्य 10 अंकों का फोन आवश्यक है'),
  coachName: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  status: z.enum(['REGISTERED', 'CONFIRMED', 'ELIMINATED', 'RUNNER_UP', 'WINNER']).default('CONFIRMED'),
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

    const teams = await prisma.kabaddiTeam.findMany({
      where: yearId ? { festivalYearId: yearId } : {},
      include: { players: true },
      orderBy: [{ points: 'desc' }, { matchesWon: 'desc' }],
    });

    return NextResponse.json({ success: true, teams });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Role check: Super Admin, President, Secretary, Kabaddi Admin, Event Manager
    const allowed = [ROLES.SUPER_ADMIN, ROLES.PRESIDENT, ROLES.SECRETARY, ROLES.KABADDI_ADMIN, ROLES.EVENT_MANAGER];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'आपको कबड्डी टीम प्रबंधित करने की अनुमति नहीं है' }, { status: 403 });
    }

    const body = await req.json();
    const validated = TeamSchema.parse(body);

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

    let team;
    if (validated.id) {
      team = await prisma.kabaddiTeam.update({
        where: { id: validated.id },
        data: {
          teamName: validated.teamName,
          villageOrClub: validated.villageOrClub,
          captainName: validated.captainName,
          captainPhone: validated.captainPhone,
          coachName: validated.coachName,
          logoUrl: validated.logoUrl,
          status: validated.status,
        },
      });
    } else {
      team = await prisma.kabaddiTeam.create({
        data: {
          festivalYearId: yearId,
          teamName: validated.teamName,
          villageOrClub: validated.villageOrClub,
          captainName: validated.captainName,
          captainPhone: validated.captainPhone,
          coachName: validated.coachName,
          logoUrl: validated.logoUrl,
          status: validated.status,
          points: 0,
          matchesPlayed: 0,
          matchesWon: 0,
          matchesLost: 0,
        },
      });
    }

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: validated.id ? 'UPDATE_KABADDI_TEAM' : 'CREATE_KABADDI_TEAM',
      module: 'KABADDI',
      recordId: team.id,
      details: `${user.name} saved Kabaddi team: "${team.teamName}"`,
    });

    return NextResponse.json({ success: true, team });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.errors?.[0]?.message || err.message || 'टीम सहेजने में त्रुटि' },
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
      return NextResponse.json({ error: 'आपको कबड्डी टीम हटाने की अनुमति नहीं है' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'टीम ID आवश्यक है' }, { status: 400 });

    const team = await prisma.kabaddiTeam.findUnique({ where: { id } });
    if (!team) return NextResponse.json({ error: 'टीम नहीं मिली' }, { status: 404 });

    await prisma.kabaddiTeam.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'DELETE_KABADDI_TEAM',
      module: 'KABADDI',
      recordId: id,
      details: `${user.name} deleted Kabaddi team: "${team.teamName}"`,
    });

    return NextResponse.json({ success: true, message: 'टीम सफलतापूर्वक हटा दी गई' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

