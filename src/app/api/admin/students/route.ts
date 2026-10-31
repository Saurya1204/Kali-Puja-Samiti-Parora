import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, status, prizeAssigned, prizeGiven, isPublished, remarks } = await req.json();

    const student = await prisma.studentAchievement.update({
      where: { id },
      data: {
        status,
        prizeAssigned,
        prizeGiven: Boolean(prizeGiven),
        isPublished: Boolean(isPublished),
        remarks,
      },
    });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'VERIFY_STUDENT_ACHIEVEMENT',
      module: 'STUDENTS',
      recordId: student.id,
      details: `${user.name} verified application for "${student.studentName}" - Status: ${status}, Prize: ${prizeAssigned || 'None'}`,
    });

    return NextResponse.json({ success: true, student });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
