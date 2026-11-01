import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog, ROLES } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get('festivalYear');

    let yearId: string | undefined;
    if (yearParam) {
      const fy = await prisma.festivalYear.findUnique({ where: { year: parseInt(yearParam) } });
      if (fy) yearId = fy.id;
    }
    if (!yearId) {
      const activeYear = await prisma.festivalYear.findFirst({ where: { isActive: true } });
      if (activeYear) yearId = activeYear.id;
    }

    const members = await prisma.committeeMember.findMany({
      where: yearId ? { festivalYearId: yearId } : {},
      orderBy: { sortOrder: 'asc' },
    });

    const volunteers = await prisma.volunteer.findMany({
      where: yearId ? { festivalYearId: yearId } : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, members, volunteers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowed = [ROLES.SUPER_ADMIN, ROLES.PRESIDENT, ROLES.SECRETARY];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'आपको समिति सदस्य प्रबंधित करने की अनुमति नहीं है' }, { status: 403 });
    }

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
          nameHindi: memberData.nameHindi || memberData.name,
          designation: memberData.designation,
          designationHindi: memberData.designationHindi || memberData.designation,
          roleCategory: memberData.roleCategory || 'OFFICE_BEARER',
          phone: memberData.phone || null,
          photoUrl: memberData.photoUrl || null,
          message: memberData.message || null,
          sortOrder: Number(memberData.sortOrder || 0),
        },
      });

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'ADD_COMMITTEE_MEMBER',
        module: 'COMMITTEE',
        recordId: member.id,
        details: `${user.name} added committee member: ${member.name} (${member.designation})`,
      });

      return NextResponse.json({ success: true, member });
    }

    if (action === 'UPDATE_MEMBER') {
      if (!memberData?.id) {
        return NextResponse.json({ error: 'सदस्य ID आवश्यक है' }, { status: 400 });
      }

      const member = await prisma.committeeMember.update({
        where: { id: memberData.id },
        data: {
          name: memberData.name,
          nameHindi: memberData.nameHindi || memberData.name,
          designation: memberData.designation,
          designationHindi: memberData.designationHindi || memberData.designation,
          roleCategory: memberData.roleCategory || 'OFFICE_BEARER',
          phone: memberData.phone || null,
          photoUrl: memberData.photoUrl || null,
          message: memberData.message || null,
          sortOrder: Number(memberData.sortOrder || 0),
        },
      });

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'UPDATE_COMMITTEE_MEMBER',
        module: 'COMMITTEE',
        recordId: member.id,
        details: `${user.name} updated committee member: ${member.name} (${member.designation})`,
      });

      return NextResponse.json({ success: true, member });
    }

    if (action === 'DELETE_MEMBER') {
      const memberId = memberData?.id;
      if (!memberId) {
        return NextResponse.json({ error: 'सदस्य ID आवश्यक है' }, { status: 400 });
      }

      const existing = await prisma.committeeMember.findUnique({ where: { id: memberId } });
      if (!existing) {
        return NextResponse.json({ error: 'सदस्य नहीं मिला' }, { status: 404 });
      }

      await prisma.committeeMember.delete({ where: { id: memberId } });

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'DELETE_COMMITTEE_MEMBER',
        module: 'COMMITTEE',
        recordId: memberId,
        details: `${user.name} deleted committee member: ${existing.name}`,
      });

      return NextResponse.json({ success: true, message: 'सदस्य हटा दिया गया' });
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

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowed = [ROLES.SUPER_ADMIN, ROLES.PRESIDENT, ROLES.SECRETARY];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'अनुमति नहीं है' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'सदस्य ID आवश्यक है' }, { status: 400 });

    const existing = await prisma.committeeMember.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'सदस्य नहीं मिला' }, { status: 404 });

    await prisma.committeeMember.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'DELETE_COMMITTEE_MEMBER',
      module: 'COMMITTEE',
      recordId: id,
      details: `${user.name} deleted committee member: ${existing.name}`,
    });

    return NextResponse.json({ success: true, message: 'सदस्य हटा दिया गया' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
