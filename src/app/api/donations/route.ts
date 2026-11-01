import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateReceiptNumber } from '@/lib/utils';
import { z } from 'zod';

const DonationSchema = z.object({
  donorName: z.string().min(2, 'कृपया मान्य नाम दर्ज करें'),
  donorPhone: z.string().optional(),
  donorEmail: z.string().email().optional().or(z.literal('')),
  donorAddressOrVillage: z.string().optional(),
  amount: z.coerce.number().min(11, 'न्यूनतम सहयोग राशि ₹11 है'),
  paymentMethod: z.enum(['UPI', 'BANK_TRANSFER', 'CASH', 'CHEQUE', 'OTHER']).default('UPI'),
  transactionRef: z.string().optional(),
  purpose: z.string().default('Kali Puja Utsav Seva'),
  remarks: z.string().optional(),
  isPubliclyVisible: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = DonationSchema.parse(body);

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

    const receiptNumber = generateReceiptNumber();

    const donation = await prisma.donation.create({
      data: {
        festivalYearId: activeYear.id,
        donorName: validated.donorName,
        donorPhone: validated.donorPhone,
        donorEmail: validated.donorEmail || null,
        donorAddressOrVillage: validated.donorAddressOrVillage || 'Parora',
        amount: validated.amount,
        paymentMethod: validated.paymentMethod,
        transactionRef: validated.transactionRef,
        receiptNumber,
        purpose: validated.purpose,
        remarks: validated.remarks,
        isPubliclyVisible: validated.isPubliclyVisible,
        status: 'CONFIRMED',
      },
    });

    // Create corresponding Financial Transaction entry for ledger tracking
    await prisma.financialTransaction.create({
      data: {
        festivalYearId: activeYear.id,
        type: 'INCOME',
        referenceType: 'DONATION',
        referenceId: donation.id,
        amount: validated.amount,
        paymentMethod: validated.paymentMethod,
        description: `Devotee donation by ${validated.donorName} (${receiptNumber})`,
      },
    });

    // Update Ledger Entry for transparency
    const accountType = validated.paymentMethod === 'CASH' ? 'CASH' : 'BANK_UPI';
    await prisma.ledgerEntry.create({
      data: {
        festivalYearId: activeYear.id,
        accountType,
        debit: 0,
        credit: validated.amount,
        balance: validated.amount, // incremental
        description: `Donation received - ${validated.donorName}`,
        referenceId: donation.id,
      },
    });

    return NextResponse.json({
      success: true,
      receiptNumber: donation.receiptNumber,
      donorName: donation.donorName,
      amount: donation.amount,
      donationDate: donation.donationDate,
      purpose: donation.purpose,
      message: 'सहयोग राशि का विवरण सफलतापूर्वक दर्ज कर लिया गया है। माँ काली आपकी समस्त मनोकामनाएं पूर्ण करें!',
    });
  } catch (err: any) {
    console.error('Donation submission error:', err);
    return NextResponse.json(
      { error: err?.errors?.[0]?.message || 'सहयोग विवरण दर्ज करने में त्रुटि हुई।' },
      { status: 400 }
    );
  }
}

