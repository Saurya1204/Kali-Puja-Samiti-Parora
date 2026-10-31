import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog } from '@/lib/auth';
import { z } from 'zod';

const VendorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'वेंडर का नाम आवश्यक है'),
  businessName: z.string().optional().nullable(),
  phone: z.string().min(10, 'मान्य 10 अंकों का फोन आवश्यक है'),
  altPhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  serviceCategory: z.string().min(2, 'सेवा श्रेणी आवश्यक है'),
  upiId: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  ifscCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validated = VendorSchema.parse(body);

    let vendor;
    if (validated.id) {
      vendor = await prisma.vendor.update({
        where: { id: validated.id },
        data: validated,
      });
    } else {
      vendor = await prisma.vendor.create({
        data: validated,
      });
    }

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: validated.id ? 'UPDATE_VENDOR' : 'CREATE_VENDOR',
      module: 'VENDORS',
      recordId: vendor.id,
      details: `${user.name} saved vendor "${vendor.name}" (${vendor.serviceCategory})`,
    });

    return NextResponse.json({ success: true, vendor });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.errors?.[0]?.message || err.message || 'वेंडर सहेजने में त्रुटि' },
      { status: 400 }
    );
  }
}
