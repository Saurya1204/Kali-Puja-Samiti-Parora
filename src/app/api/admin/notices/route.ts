import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, titleHindi, message, messageHindi, category, isPinned, isUrgent } = body;

    const activeYear = await prisma.festivalYear.findFirst({
      where: { isActive: true },
    });
    if (!activeYear) return NextResponse.json({ error: 'Active festival year not found' }, { status: 400 });

    const announcement = await prisma.announcement.create({
      data: {
        festivalYearId: activeYear.id,
        title,
        titleHindi,
        message,
        messageHindi,
        category: category || 'GENERAL',
        isPinned: Boolean(isPinned),
        isUrgent: Boolean(isUrgent),
      },
    });

    // If pinned, also update website marquee setting so homepage ticker updates immediately!
    if (isPinned) {
      await prisma.websiteSetting.upsert({
        where: { key: 'MARQUEE_ANNOUNCEMENT' },
        update: { value: messageHindi || message || title },
        create: {
          key: 'MARQUEE_ANNOUNCEMENT',
          value: messageHindi || message || title,
          description: 'Live top marquee announcement',
        },
      });
    }

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'CREATE_ANNOUNCEMENT',
      module: 'NOTICES',
      recordId: announcement.id,
      details: `${user.name} published announcement: "${title}"`,
    });

    return NextResponse.json({ success: true, announcement });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
