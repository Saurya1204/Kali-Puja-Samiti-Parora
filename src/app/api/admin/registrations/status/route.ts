import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, status, adminRemarks } = await req.json();

    const reg = await prisma.eventRegistration.update({
      where: { id },
      data: {
        status,
        adminRemarks,
      },
    });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'UPDATE_REGISTRATION_STATUS',
      module: 'REGISTRATIONS',
      recordId: reg.id,
      details: `${user.name} changed status of Registration #${reg.registrationNumber} to ${status}`,
    });

    return NextResponse.json({ success: true, registration: reg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

