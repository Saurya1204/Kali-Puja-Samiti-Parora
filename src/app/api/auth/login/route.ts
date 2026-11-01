import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAuditLog } from '@/lib/auth';

const DEFAULT_ACCOUNTS: Record<string, { name: string; role: string; phone: string }> = {
  'admin@kalipujaparora.org': {
    name: 'Amarnath Prasad',
    role: 'SUPER_ADMIN',
    phone: '6203510983',
  },
  'president@kalipujaparora.org': {
    name: 'Sillu Kumar',
    role: 'PRESIDENT',
    phone: '94312 00001',
  },
  'secretary@kalipujaparora.org': {
    name: 'Er. Gaurav Singh',
    role: 'SECRETARY',
    phone: '98765 43210',
  },
  'treasurer@kalipujaparora.org': {
    name: 'Shri Manoj Sharma',
    role: 'TREASURER',
    phone: '94312 44321',
  },
  'finance@kalipujaparora.org': {
    name: 'Rajesh Kumar Mehta',
    role: 'FINANCE_ADMIN',
    phone: '98350 12345',
  },
  'kabaddi@kalipujaparora.org': {
    name: 'Shri Amarjeet Singh (Kabaddi Chief)',
    role: 'KABADDI_ADMIN',
    phone: '98765 11223',
  },
  'awards@kalipujaparora.org': {
    name: 'Dr. Rameshwar Prasad Singh',
    role: 'AWARDS_ADMIN',
    phone: '94312 88491',
  },
  'volunteer@kalipujaparora.org': {
    name: 'Vikash Kumar (Volunteer Lead)',
    role: 'VOLUNTEER',
    phone: '91228 33412',
  },
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'ईमेल एवं पासवर्ड आवश्यक है' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // If default role user does not exist in MongoDB yet, provision dynamically
    if (!user && DEFAULT_ACCOUNTS[normalizedEmail]) {
      const defaultAcc = DEFAULT_ACCOUNTS[normalizedEmail];
      const passwordHash = await bcrypt.hash('admin123', 10);
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: defaultAcc.name,
          role: defaultAcc.role,
          phone: defaultAcc.phone,
          passwordHash,
          isActive: true,
        },
      });
      console.log(`Dynamically provisioned administrative user in MongoDB: ${normalizedEmail}`);
    }

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'अमान्य क्रेडेंशियल अथवा खाता निष्क्रिय है' },
        { status: 401 }
      );
    }

    let isMatch = await bcrypt.compare(password, user.passwordHash);

    // Fallback: If password is 'admin123' for default administrative accounts, update hash & accept
    if (!isMatch && password === 'admin123' && DEFAULT_ACCOUNTS[normalizedEmail]) {
      const newHash = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
      isMatch = true;
    }

    if (!isMatch) {
      return NextResponse.json({ error: 'अमान्य पासवर्ड (Invalid Password)' }, { status: 401 });
    }

    // Set Session Cookie
    const sessionPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const encodedSession = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');

    // Return response with Set-Cookie header
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set('kps_session', encodedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Record audit log safely (does not block login if logging fails)
    try {
      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'LOGIN',
        module: 'AUTH',
        details: `User logged in with role ${user.role}`,
      });
    } catch (auditErr) {
      console.warn('Non-critical: Audit log write error during login:', auditErr);
    }

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: err?.message || 'लॉगिन प्रक्रिया में त्रुटि' },
      { status: 500 }
    );
  }
}

