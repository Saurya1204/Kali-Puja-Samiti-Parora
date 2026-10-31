import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const StudentSchema = z.object({
  studentName: z.string().min(2, 'विद्यार्थी का नाम आवश्यक है'),
  guardianName: z.string().optional(),
  village: z.string().min(2, 'गांव/टोला का नाम आवश्यक है'),
  schoolOrCollege: z.string().min(2, 'विद्यालय या कॉलेज का नाम आवश्यक है'),
  courseOrClass: z.string().min(1, 'कक्षा या कोर्स आवश्यक है'),
  category: z.string().default('CLASS_10'),
  examOrCompetitionName: z.string().min(2, 'परीक्षा अथवा प्रतियोगिता का नाम आवश्यक है'),
  marksPercentageOrRank: z.string().min(1, 'अंक, प्रतिशत अथवा रैंक आवश्यक है'),
  yearOfPassing: z.coerce.number().min(2010).max(2030),
  contactNumber: z.string().min(10, 'मान्य 10 अंकों का मोबाइल नंबर आवश्यक है'),
  certificateUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  remarks: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = StudentSchema.parse(body);

    const activeYear = await prisma.festivalYear.findFirst({
      where: { isActive: true },
    });

    if (!activeYear) {
      return NextResponse.json({ error: 'Active festival year not found' }, { status: 400 });
    }

    const student = await prisma.studentAchievement.create({
      data: {
        festivalYearId: activeYear.id,
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
        remarks: validated.remarks,
        status: 'PENDING',
        isPublished: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'आवेदन सफलतापूर्वक जमा कर दिया गया है। समिति द्वारा सत्यापन उपरांत सूची में नाम प्रदर्शित किया जाएगा।',
      studentId: student.id,
    });
  } catch (error: any) {
    console.error('Student submission error:', error);
    return NextResponse.json(
      { error: error?.errors?.[0]?.message || 'आवेदन सबमिट करने में त्रुटि हुई।' },
      { status: 400 }
    );
  }
}

