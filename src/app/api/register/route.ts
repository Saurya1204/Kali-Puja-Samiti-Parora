import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateRegistrationNumber } from '@/lib/utils';
import { z } from 'zod';

const RegistrationSchema = z.object({
  eventId: z.string().min(1, 'कृपया कार्यक्रम का चयन करें'),
  applicantName: z.string().min(2, 'आवेदक का नाम आवश्यक है'),
  guardianName: z.string().optional(),
  phone: z.string().min(10, 'मान्य 10 अंकों का फोन नंबर आवश्यक है'),
  email: z.string().email().optional().or(z.literal('')),
  village: z.string().min(2, 'गांव का नाम आवश्यक है'),
  registrationType: z.enum(['INDIVIDUAL', 'TEAM', 'CULTURAL', 'VOLUNTEER', 'OTHER']),
  teamName: z.string().optional(),
  playersCount: z.coerce.number().optional(),
  activityDetails: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RegistrationSchema.parse(body);

    let activeYear = await prisma.festivalYear.findFirst({
      where: { isActive: true },
    });

    if (!activeYear) {
      activeYear = await prisma.festivalYear.findFirst({
        orderBy: { year: 'desc' },
      });
    }

    if (!activeYear) {
      activeYear = await prisma.festivalYear.create({
        data: {
          year: 2026,
          name: 'Kali Puja Utsav 2026',
          startDate: new Date('2026-11-09T08:00:00Z'),
          endDate: new Date('2026-11-10T23:59:59Z'),
          venue: 'Maa Kali Mandir Parisar, Parora, Begusarai - 851217',
          isActive: true,
        },
      });
    }

    const regNumber = generateRegistrationNumber(
      validated.registrationType === 'TEAM'
        ? 'TEAM'
        : validated.registrationType === 'VOLUNTEER'
        ? 'VOL'
        : 'REG'
    );

    const detailsJson = JSON.stringify({
      teamName: validated.teamName,
      playersCount: validated.playersCount,
      activityDetails: validated.activityDetails,
    });

    const registration = await prisma.eventRegistration.create({
      data: {
        festivalYearId: activeYear.id,
        eventId: validated.eventId,
        registrationNumber: regNumber,
        applicantName: validated.applicantName,
        guardianName: validated.guardianName,
        phone: validated.phone,
        email: validated.email || null,
        village: validated.village,
        registrationType: validated.registrationType,
        detailsJson,
        status: 'PENDING',
      },
      include: {
        event: true,
      },
    });

    // If it is a Kabaddi Team, also create in KabaddiTeam table
    if (validated.registrationType === 'TEAM' && validated.teamName) {
      await prisma.kabaddiTeam.create({
        data: {
          festivalYearId: activeYear.id,
          teamName: validated.teamName,
          villageOrClub: validated.village,
          captainName: validated.applicantName,
          captainPhone: validated.phone,
          status: 'REGISTERED',
        },
      });
    }

    // If it is a Volunteer, also create in Volunteer table
    if (validated.registrationType === 'VOLUNTEER') {
      await prisma.volunteer.create({
        data: {
          festivalYearId: activeYear.id,
          name: validated.applicantName,
          phone: validated.phone,
          email: validated.email || null,
          village: validated.village,
          preferredRole: validated.activityDetails || 'General Assistance',
          status: 'REGISTERED',
        },
      });
    }

    return NextResponse.json({
      success: true,
      registrationNumber: regNumber,
      applicantName: registration.applicantName,
      eventTitle: registration.event.titleHindi || registration.event.title,
      message: 'पंजीकरण सफलतापूर्वक दर्ज कर लिया गया है। आपका पंजीकरण क्रमांक नीचे प्रदर्शित है।',
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: err?.errors?.[0]?.message || 'पंजीकरण में त्रुटि हुई।' },
      { status: 400 }
    );
  }
}

