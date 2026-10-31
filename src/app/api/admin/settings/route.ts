import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, settingsData, festivalYearData } = body;

    if (action === 'UPDATE_SETTINGS' && settingsData) {
      for (const [key, value] of Object.entries(settingsData)) {
        await prisma.websiteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'UPDATE_WEBSITE_SETTINGS',
        module: 'SETTINGS',
        details: `${user.name} updated organization settings`,
      });
    }

    if (action === 'CREATE_OR_UPDATE_YEAR' && festivalYearData) {
      const { id, year, name, startDate, endDate, venue, theme, isActive } = festivalYearData;

      if (isActive) {
        // Deactivate all other years
        await prisma.festivalYear.updateMany({
          data: { isActive: false },
        });
      }

      if (id) {
        await prisma.festivalYear.update({
          where: { id },
          data: {
            year: Number(year),
            name,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            venue,
            theme,
            isActive: Boolean(isActive),
          },
        });
      } else {
        await prisma.festivalYear.create({
          data: {
            year: Number(year),
            name,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            venue,
            theme,
            isActive: Boolean(isActive),
          },
        });
      }

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'UPDATE_FESTIVAL_YEAR',
        module: 'SETTINGS',
        details: `${user.name} saved festival year ${year} (Active: ${isActive})`,
      });
    }

    return NextResponse.json({ success: true, message: 'सेटिंग्स सफलतापूर्वक अद्यतन की गईं।' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
