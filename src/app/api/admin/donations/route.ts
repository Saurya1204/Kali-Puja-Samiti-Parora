import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog, ROLES } from '@/lib/auth';
import { generateReceiptNumber } from '@/lib/utils';
import { z } from 'zod';

const AdminDonationSchema = z.object({
  id: z.string().optional(),
  donorName: z.string().min(2, 'दाता का नाम आवश्यक है'),
  donorPhone: z.string().optional().nullable(),
  donorEmail: z.string().optional().nullable(),
  donorAddressOrVillage: z.string().optional().nullable(),
  amount: z.coerce.number().min(1, 'मान्य राशि दर्ज करें'),
  paymentMethod: z.enum(['UPI', 'BANK_TRANSFER', 'CASH', 'CHEQUE', 'OTHER']).default('CASH'),
  transactionRef: z.string().optional().nullable(),
  purpose: z.string().default('Kali Puja Utsav Seva'),
  remarks: z.string().optional().nullable(),
  isPubliclyVisible: z.boolean().default(true),
  status: z.enum(['CONFIRMED', 'PENDING', 'REVERSED']).default('CONFIRMED'),
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

    const donations = await prisma.donation.findMany({
      where: yearId ? { festivalYearId: yearId } : {},
      orderBy: { donationDate: 'desc' },
    });

    return NextResponse.json({ success: true, donations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowed = [ROLES.SUPER_ADMIN, ROLES.PRESIDENT, ROLES.TREASURER, ROLES.FINANCE_ADMIN];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'आपको दान रिकॉर्ड प्रबंधित करने की अनुमति नहीं है' }, { status: 403 });
    }

    const body = await req.json();
    const validated = AdminDonationSchema.parse(body);

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

    let donation;
    if (validated.id) {
      donation = await prisma.donation.update({
        where: { id: validated.id },
        data: {
          donorName: validated.donorName,
          donorPhone: validated.donorPhone,
          donorEmail: validated.donorEmail,
          donorAddressOrVillage: validated.donorAddressOrVillage || 'Parora',
          amount: validated.amount,
          paymentMethod: validated.paymentMethod,
          transactionRef: validated.transactionRef,
          purpose: validated.purpose,
          remarks: validated.remarks,
          isPubliclyVisible: validated.isPubliclyVisible,
          status: validated.status,
        },
      });
    } else {
      const receiptNumber = generateReceiptNumber();
      donation = await prisma.donation.create({
        data: {
          festivalYearId: yearId,
          donorName: validated.donorName,
          donorPhone: validated.donorPhone,
          donorEmail: validated.donorEmail,
          donorAddressOrVillage: validated.donorAddressOrVillage || 'Parora',
          amount: validated.amount,
          paymentMethod: validated.paymentMethod,
          transactionRef: validated.transactionRef,
          receiptNumber,
          purpose: validated.purpose,
          remarks: validated.remarks,
          isPubliclyVisible: validated.isPubliclyVisible,
          status: validated.status,
        },
      });

      // Transaction entry for ledger
      await prisma.financialTransaction.create({
        data: {
          festivalYearId: yearId,
          type: 'INCOME',
          referenceType: 'DONATION',
          referenceId: donation.id,
          amount: validated.amount,
          paymentMethod: validated.paymentMethod,
          description: `Donation by ${validated.donorName} (${receiptNumber})`,
        },
      });
    }

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: validated.id ? 'UPDATE_DONATION' : 'CREATE_DONATION',
      module: 'DONATIONS',
      recordId: donation.id,
      details: `${user.name} recorded donation: "${donation.donorName}" of ₹${donation.amount}`,
    });

    return NextResponse.json({ success: true, donation });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.errors?.[0]?.message || err.message || 'दान सहेजने में त्रुटि' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowed = [ROLES.SUPER_ADMIN, ROLES.TREASURER, ROLES.FINANCE_ADMIN];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'आपको दान रिकॉर्ड हटाने की अनुमति नहीं है' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'दान ID आवश्यक है' }, { status: 400 });

    const donation = await prisma.donation.findUnique({ where: { id } });
    if (!donation) return NextResponse.json({ error: 'दान रिकॉर्ड नहीं मिला' }, { status: 404 });

    await prisma.donation.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'DELETE_DONATION',
      module: 'DONATIONS',
      recordId: id,
      details: `${user.name} deleted donation of ₹${donation.amount} from "${donation.donorName}"`,
    });

    return NextResponse.json({ success: true, message: 'दान रिकॉर्ड सफलतापूर्वक हटा दिया गया' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

