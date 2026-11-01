import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { createAuditLog } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'ईमेल एवं पासवर्ड आवश्यक है' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'अमान्य क्रेडेंशियल अथवा खाता निष्क्रिय है' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'अमान्य पासवर्ड' }, { status: 401 });
    }

    // Set Session Cookie
    const sessionPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const encodedSession = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');

    // Set Session Cookie directly on the returned response
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

    // Record audit log
    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'LOGIN',
      module: 'AUTH',
      details: `User logged in with role ${user.role}`,
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'लॉगिन प्रक्रिया में त्रुटि' }, { status: 500 });
  }
}

