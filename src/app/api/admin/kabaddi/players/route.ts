import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog, ROLES } from '@/lib/auth';
import { z } from 'zod';

const PlayerSchema = z.object({
  id: z.string().optional(),
  teamId: z.string().min(1, 'टीम का चयन अनिवार्य है'),
  name: z.string().min(2, 'खिलाड़ी का नाम आवश्यक है'),
  jerseyNumber: z.coerce.number().min(1).max(99).optional().nullable(),
  role: z.enum(['RAIDER', 'DEFENDER', 'ALL_ROUNDER']).default('ALL_ROUNDER'),
  isCaptain: z.boolean().default(false),
  phone: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  villageOrDistrict: z.string().optional().nullable(),
  skills: z.string().optional().nullable(),
  achievements: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  height: z.string().optional().nullable(),
  age: z.coerce.number().optional().nullable(),
  matchesPlayed: z.coerce.number().default(0),
  raidPoints: z.coerce.number().default(0),
  tacklePoints: z.coerce.number().default(0),
  superRaids: z.coerce.number().default(0),
  superTackles: z.coerce.number().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');

    const players = await prisma.kabaddiPlayer.findMany({
      where: teamId ? { teamId } : {},
      include: { team: true },
      orderBy: [{ isCaptain: 'desc' }, { jerseyNumber: 'asc' }],
    });

    return NextResponse.json({ success: true, players });
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
      return NextResponse.json({ error: 'आपको कबड्डी खिलाड़ी प्रबंधित करने की अनुमति नहीं है' }, { status: 403 });
    }

    const body = await req.json();
    const validated = PlayerSchema.parse(body);

    let player;
    if (validated.id) {
      player = await prisma.kabaddiPlayer.update({
        where: { id: validated.id },
        data: {
          teamId: validated.teamId,
          name: validated.name,
          jerseyNumber: validated.jerseyNumber,
          role: validated.role,
          isCaptain: validated.isCaptain,
          phone: validated.phone,
          photoUrl: validated.photoUrl,
          villageOrDistrict: validated.villageOrDistrict,
          skills: validated.skills,
          achievements: validated.achievements,
          bio: validated.bio,
          weight: validated.weight,
          height: validated.height,
          age: validated.age,
          matchesPlayed: validated.matchesPlayed,
          raidPoints: validated.raidPoints,
          tacklePoints: validated.tacklePoints,
          superRaids: validated.superRaids,
          superTackles: validated.superTackles,
        },
        include: { team: true },
      });
    } else {
      player = await prisma.kabaddiPlayer.create({
        data: {
          teamId: validated.teamId,
          name: validated.name,
          jerseyNumber: validated.jerseyNumber,
          role: validated.role,
          isCaptain: validated.isCaptain,
          phone: validated.phone,
          photoUrl: validated.photoUrl,
          villageOrDistrict: validated.villageOrDistrict,
          skills: validated.skills,
          achievements: validated.achievements,
          bio: validated.bio,
          weight: validated.weight,
          height: validated.height,
          age: validated.age,
          matchesPlayed: validated.matchesPlayed,
          raidPoints: validated.raidPoints,
          tacklePoints: validated.tacklePoints,
          superRaids: validated.superRaids,
          superTackles: validated.superTackles,
        },
        include: { team: true },
      });
    }

    if (!player.team) {
      const foundTeam = await prisma.kabaddiTeam.findUnique({ where: { id: validated.teamId } });
      player.team = foundTeam || { teamName: 'टीम' };
    }

    const teamTitle = player?.team?.teamName || 'टीम';

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: validated.id ? 'UPDATE_KABADDI_PLAYER' : 'CREATE_KABADDI_PLAYER',
      module: 'KABADDI',
      recordId: player.id,
      details: `${user.name} saved player: "${player.name}" (#${player.jerseyNumber || 'N/A'}) for team "${teamTitle}"`,
    });

    return NextResponse.json({ success: true, player });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.errors?.[0]?.message || err.message || 'खिलाड़ी विवरण सहेजने में त्रुटि' },
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
      return NextResponse.json({ error: 'आपको खिलाड़ी हटाने की अनुमति नहीं है' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'खिलाड़ी ID आवश्यक है' }, { status: 400 });

    const player = await prisma.kabaddiPlayer.findUnique({
      where: { id },
      include: { team: true },
    });
    if (!player) return NextResponse.json({ error: 'खिलाड़ी नहीं मिला' }, { status: 404 });

    await prisma.kabaddiPlayer.delete({ where: { id } });

    const teamTitle = player?.team?.teamName || 'टीम';

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'DELETE_KABADDI_PLAYER',
      module: 'KABADDI',
      recordId: id,
      details: `${user.name} deleted player "${player.name}" from team "${teamTitle}"`,
    });

    return NextResponse.json({ success: true, message: 'खिलाड़ी सफलतापूर्वक हटा दिया गया' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

