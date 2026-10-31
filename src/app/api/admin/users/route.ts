import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog, ROLES } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const UserCreateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'नाम आवश्यक है'),
  email: z.string().email('मान्य ईमेल आवश्यक है'),
  password: z.string().min(6, 'पासवर्ड न्यूनतम 6 वर्णों का होना चाहिए').optional(),
  role: z.enum([
    'SUPER_ADMIN',
    'PRESIDENT',
    'SECRETARY',
    'TREASURER',
    'FINANCE_ADMIN',
    'KABADDI_ADMIN',
    'AWARDS_ADMIN',
    'EVENT_MANAGER',
    'VOLUNTEER',
  ]),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'केवल सुपर एडमिन ही उपयोगकर्ताओं को देख सकते हैं' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'केवल सुपर एडमिन ही व्यवस्थापक बना सकते हैं' }, { status: 403 });
    }

    const body = await req.json();
    const validated = UserCreateSchema.parse(body);

    let targetUser;
    if (validated.id) {
      const updateData: any = {
        name: validated.name,
        email: validated.email,
        role: validated.role,
        phone: validated.phone,
        isActive: validated.isActive,
      };

      if (validated.password && validated.password.length >= 6) {
        updateData.passwordHash = await bcrypt.hash(validated.password, 10);
      }

      targetUser = await prisma.user.update({
        where: { id: validated.id },
        data: updateData,
        select: { id: true, name: true, email: true, role: true, phone: true, isActive: true },
      });

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'UPDATE_ADMIN_USER',
        module: 'USERS',
        recordId: targetUser.id,
        details: `${user.name} updated admin user "${targetUser.name}" (${targetUser.role})`,
      });
    } else {
      if (!validated.password) {
        return NextResponse.json({ error: 'नए उपयोगकर्ता हेतु पासवर्ड आवश्यक है' }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({ where: { email: validated.email } });
      if (existing) {
        return NextResponse.json({ error: 'इस ईमेल से पहले ही उपयोगकर्ता मौजूद है' }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(validated.password, 10);
      targetUser = await prisma.user.create({
        data: {
          name: validated.name,
          email: validated.email,
          passwordHash,
          role: validated.role,
          phone: validated.phone,
          isActive: validated.isActive,
        },
        select: { id: true, name: true, email: true, role: true, phone: true, isActive: true },
      });

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'CREATE_ADMIN_USER',
        module: 'USERS',
        recordId: targetUser.id,
        details: `${user.name} created new admin: "${targetUser.name}" with role ${targetUser.role}`,
      });
    }

    return NextResponse.json({ success: true, user: targetUser });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.errors?.[0]?.message || err.message || 'उपयोगकर्ता सहेजने में त्रुटि' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'केवल सुपर एडमिन ही व्यवस्थापक हटा सकते हैं' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'उपयोगकर्ता ID आवश्यक है' }, { status: 400 });

    if (id === user.id) {
      return NextResponse.json({ error: 'आप अपना स्वयं का खाता नहीं हटा सकते' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: 'उपयोगकर्ता नहीं मिला' }, { status: 404 });

    await prisma.user.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'DELETE_ADMIN_USER',
      module: 'USERS',
      recordId: id,
      details: `${user.name} removed admin user: "${target.name}" (${target.role})`,
    });

    return NextResponse.json({ success: true, message: 'उपयोगकर्ता सफलतापूर्वक हटा दिया गया' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

