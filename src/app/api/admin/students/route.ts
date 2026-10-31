import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog, ROLES } from '@/lib/auth';
import { z } from 'zod';

const StudentSchema = z.object({
  id: z.string().optional(),
  studentName: z.string().min(2, 'विद्यार्थी का नाम आवश्यक है'),
  guardianName: z.string().optional().nullable(),
  village: z.string().min(2, 'गांव का नाम आवश्यक है'),
  schoolOrCollege: z.string().min(2, 'विद्यालय / महाविद्यालय आवश्यक है'),
  courseOrClass: z.string().min(1, 'कक्षा / कोर्स आवश्यक है'),
  category: z.string().min(1, 'श्रेणी आवश्यक है'),
  examOrCompetitionName: z.string().min(2, 'परीक्षा का नाम आवश्यक है'),
  marksPercentageOrRank: z.string().min(1, 'अंक / प्रतिशत / रैंक आवश्यक है'),
  yearOfPassing: z.coerce.number().min(2000).max(2030),
  contactNumber: z.string().min(10, 'मान्य 10 अंकों का मोबाइल नंबर दर्ज करें'),
  certificateUrl: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('APPROVED'),
  prizeAssigned: z.string().optional().nullable(),
  prizeGiven: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  remarks: z.string().optional().nullable(),
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

    const students = await prisma.studentAchievement.findMany({
      where: yearId ? { festivalYearId: yearId } : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, students });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowed = [ROLES.SUPER_ADMIN, ROLES.PRESIDENT, ROLES.SECRETARY, ROLES.AWARDS_ADMIN];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'आपको मेधावी छात्र पुरस्कार प्रबंधित करने की अनुमति नहीं है' }, { status: 403 });
    }

    const body = await req.json();

    // Check if partial update (status / prize only from table action)
    if (body.id && Object.keys(body).length <= 7 && (body.status || body.prizeAssigned !== undefined)) {
      const student = await prisma.studentAchievement.update({
        where: { id: body.id },
        data: {
          status: body.status,
          prizeAssigned: body.prizeAssigned,
          prizeGiven: Boolean(body.prizeGiven),
          isPublished: Boolean(body.isPublished),
          remarks: body.remarks,
        },
      });

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'VERIFY_STUDENT_ACHIEVEMENT',
        module: 'AWARDS',
        recordId: student.id,
        details: `${user.name} updated verification for "${student.studentName}": Status=${body.status}, Prize=${body.prizeAssigned || 'None'}`,
      });

      return NextResponse.json({ success: true, student });
    }

    // Full Create / Update
    const validated = StudentSchema.parse(body);

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

    let student;
    if (validated.id) {
      student = await prisma.studentAchievement.update({
        where: { id: validated.id },
        data: {
          studentName: validated.studentName,
          guardianName: validated.guardianName,
          village: validated.village,
          schoolOrCollege: validated.schoolOrCollege,
          courseOrClass: validated.courseOrClass,
          category: validated.category,
          examOrCompetitionName: validated.examOrCompetitionName,
          marksPercentageOrRank: validated.marksPercentageOrRank,
          yearOfPassing: validated.yearOfPassing,
          contactNumber: validated.contactNumber,
          certificateUrl: validated.certificateUrl,
          photoUrl: validated.photoUrl,
          status: validated.status,
          prizeAssigned: validated.prizeAssigned,
          prizeGiven: validated.prizeGiven,
          isPublished: validated.isPublished,
          remarks: validated.remarks,
        },
      });
    } else {
      student = await prisma.studentAchievement.create({
        data: {
          festivalYearId: yearId,
          studentName: validated.studentName,
          guardianName: validated.guardianName,
          village: validated.village,
          schoolOrCollege: validated.schoolOrCollege,
          courseOrClass: validated.courseOrClass,
          category: validated.category,
          examOrCompetitionName: validated.examOrCompetitionName,
          marksPercentageOrRank: validated.marksPercentageOrRank,
          yearOfPassing: validated.yearOfPassing,
          contactNumber: validated.contactNumber,
          certificateUrl: validated.certificateUrl,
          photoUrl: validated.photoUrl,
          status: validated.status,
          prizeAssigned: validated.prizeAssigned || 'Gold Medal + Certificate',
          prizeGiven: validated.prizeGiven,
          isPublished: validated.isPublished,
          remarks: validated.remarks,
        },
      });
    }

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: validated.id ? 'UPDATE_STUDENT_ACHIEVEMENT' : 'CREATE_STUDENT_ACHIEVEMENT',
      module: 'AWARDS',
      recordId: student.id,
      details: `${user.name} saved student achiever record: "${student.studentName}" (${student.marksPercentageOrRank})`,
    });

    return NextResponse.json({ success: true, student });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.errors?.[0]?.message || err.message || 'छात्र विवरण सहेजने में त्रुटि' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowed = [ROLES.SUPER_ADMIN, ROLES.PRESIDENT, ROLES.AWARDS_ADMIN];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'आपको छात्र विवरण हटाने की अनुमति नहीं है' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'छात्र ID आवश्यक है' }, { status: 400 });

    const student = await prisma.studentAchievement.findUnique({ where: { id } });
    if (!student) return NextResponse.json({ error: 'छात्र रिकॉर्ड नहीं मिला' }, { status: 404 });

    await prisma.studentAchievement.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'DELETE_STUDENT_ACHIEVEMENT',
      module: 'AWARDS',
      recordId: id,
      details: `${user.name} deleted student achiever record: "${student.studentName}"`,
    });

    return NextResponse.json({ success: true, message: 'छात्र रिकॉर्ड सफलतापूर्वक हटा दिया गया' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
