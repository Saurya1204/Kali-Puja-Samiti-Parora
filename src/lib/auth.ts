import { cookies } from 'next/headers';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
}

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  PRESIDENT: 'PRESIDENT',
  SECRETARY: 'SECRETARY',
  TREASURER: 'TREASURER',
  EVENT_MANAGER: 'EVENT_MANAGER',
  VOLUNTEER: 'VOLUNTEER',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// Role hierarchy / permission checks
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  if (userRole === ROLES.SUPER_ADMIN) return true;
  return requiredRoles.includes(userRole);
}

/**
 * Get currently authenticated user from session cookie
 */
export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('kps_session');
    if (!sessionCookie?.value) return null;

    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
    if (!sessionData?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: sessionData.id },
      select: { id: true, name: true, email: true, role: true, phone: true, isActive: true },
    });

    if (!user || !user.isActive) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };
  } catch {
    return null;
  }
}

/**
 * Record an audit log entry in the database
 */
export async function createAuditLog({
  userId,
  userName,
  action,
  module,
  recordId,
  details,
  ipAddress,
}: {
  userId?: string;
  userName?: string;
  action: string;
  module: string;
  recordId?: string;
  details?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        userName: userName || 'Admin User',
        action,
        module,
        recordId,
        details,
        ipAddress,
      },
    });
  } catch (err) {
    console.error('Failed to log audit:', err);
  }
}
