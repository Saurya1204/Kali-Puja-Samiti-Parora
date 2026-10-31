import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, memberData, volunteerData } = body;

    const activeYear = await prisma.festivalYear.findFirst({
      where: { isActive: true },
    });
    if (!activeYear) return NextResponse.json({ error: 'Active festival year not found' }, { status: 400 });

    if (action === 'ADD_MEMBER') {
      const member = await prisma.committeeMember.create({
        data: {
          festivalYearId: activeYear.id,
          name: memberData.name,
          nameHindi: memberData.nameHindi,
          designation: memberData.designation,
          designationHindi: memberData.designationHindi,
          roleCategory: memberData.roleCategory || 'OFFICE_BEARER',
          phone: memberData.phone,
          message: memberData.message,
        },
      });

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'ADD_COMMITTEE_MEMBER',
        module: 'COMMITTEE',
        recordId: member.id,
        details: `${user.name} added committee member: ${member.name}`,
      });

      return NextResponse.json({ success: true, member });
    }

    if (action === 'ASSIGN_VOLUNTEER') {
      const vol = await prisma.volunteer.update({
        where: { id: volunteerData.id },
        data: {
          status: volunteerData.status || 'ASSIGNED',
          assignedTask: volunteerData.assignedTask,
        },
      });

      return NextResponse.json({ success: true, volunteer: vol });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
