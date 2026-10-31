import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog, ROLES } from '@/lib/auth';
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

    const allowed = [ROLES.SUPER_ADMIN, ROLES.PRESIDENT, ROLES.TREASURER, ROLES.FINANCE_ADMIN];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'आपको वेंडर प्रबंधित करने की अनुमति नहीं है' }, { status: 403 });
    }

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

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowed = [ROLES.SUPER_ADMIN, ROLES.TREASURER, ROLES.FINANCE_ADMIN];
    if (!allowed.includes(user.role as any)) {
      return NextResponse.json({ error: 'आपको वेंडर हटाने की अनुमति नहीं है' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'वेंडर ID आवश्यक है' }, { status: 400 });

    const vendor = await prisma.vendor.findUnique({ where: { id } });
    if (!vendor) return NextResponse.json({ error: 'वेंडर नहीं मिला' }, { status: 404 });

    await prisma.vendor.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'DELETE_VENDOR',
      module: 'VENDORS',
      recordId: id,
      details: `${user.name} deleted vendor "${vendor.name}"`,
    });

    return NextResponse.json({ success: true, message: 'वेंडर सफलतापूर्वक हटा दिया गया' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
