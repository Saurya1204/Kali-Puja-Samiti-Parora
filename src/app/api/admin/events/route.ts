import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog, ROLES } from '@/lib/auth';
import { z } from 'zod';

const EventSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, 'श्रेणी आवश्यक है'),
  title: z.string().min(2, 'शीर्षक आवश्यक है'),
  titleHindi: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  date: z.string().min(1, 'दिनांक आवश्यक है'),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  organizerName: z.string().optional().nullable(),
  organizerContact: z.string().optional().nullable(),
  rules: z.string().optional().nullable(),
  prizeDetails: z.string().optional().nullable(),
  status: z.enum(['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED']).default('UPCOMING'),
  isPublished: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowed = [ROLES.SUPER_ADMIN, ROLES.PRESIDENT, ROLES.SECRETARY, ROLES.EVENT_MANAGER];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'आपको कार्यक्रम प्रबंधित करने की अनुमति नहीं है' }, { status: 403 });
    }

    const body = await req.json();
    const validated = EventSchema.parse(body);

    const activeYear = await prisma.festivalYear.findFirst({
      where: { isActive: true },
    });
    if (!activeYear) return NextResponse.json({ error: 'Active festival year not found' }, { status: 400 });

    let event;
    if (validated.id) {
      event = await prisma.event.update({
        where: { id: validated.id },
        data: {
          categoryId: validated.categoryId,
          title: validated.title,
          titleHindi: validated.titleHindi,
          description: validated.description,
          date: new Date(validated.date),
          startTime: validated.startTime,
          endTime: validated.endTime,
          venue: validated.venue,
          organizerName: validated.organizerName,
          organizerContact: validated.organizerContact,
          rules: validated.rules,
          prizeDetails: validated.prizeDetails,
          status: validated.status,
          isPublished: validated.isPublished,
        },
      });
    } else {
      event = await prisma.event.create({
        data: {
          festivalYearId: activeYear.id,
          categoryId: validated.categoryId,
          title: validated.title,
          titleHindi: validated.titleHindi,
          description: validated.description,
          date: new Date(validated.date),
          startTime: validated.startTime,
          endTime: validated.endTime,
          venue: validated.venue,
          organizerName: validated.organizerName,
          organizerContact: validated.organizerContact,
          rules: validated.rules,
          prizeDetails: validated.prizeDetails,
          status: validated.status,
          isPublished: validated.isPublished,
        },
      });
    }

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: validated.id ? 'UPDATE_EVENT' : 'CREATE_EVENT',
      module: 'EVENTS',
      recordId: event.id,
      details: `${user.name} saved event: "${event.title}"`,
    });

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.errors?.[0]?.message || err.message || 'कार्यक्रम सहेजने में त्रुटि' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowed = [ROLES.SUPER_ADMIN, ROLES.PRESIDENT, ROLES.SECRETARY, ROLES.EVENT_MANAGER];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'आपको कार्यक्रम हटाने की अनुमति नहीं है' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'कार्यक्रम ID आवश्यक है' }, { status: 400 });

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: 'कार्यक्रम नहीं मिला' }, { status: 404 });

    await prisma.event.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'DELETE_EVENT',
      module: 'EVENTS',
      recordId: id,
      details: `${user.name} deleted event: "${event.title}"`,
    });

    return NextResponse.json({ success: true, message: 'कार्यक्रम सफलतापूर्वक हटा दिया गया' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
