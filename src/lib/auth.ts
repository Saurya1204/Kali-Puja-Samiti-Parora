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
  FINANCE_ADMIN: 'FINANCE_ADMIN',
  KABADDI_ADMIN: 'KABADDI_ADMIN',
  AWARDS_ADMIN: 'AWARDS_ADMIN',
  EVENT_MANAGER: 'EVENT_MANAGER',
  VOLUNTEER: 'VOLUNTEER',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES] | string;

/**
 * Check if a user role has permission to access a specific module
 */
export function canAccessModule(userRole: string, module: string): boolean {
  if (userRole === ROLES.SUPER_ADMIN) return true;

  // President and Secretary have executive visibility across operational modules
  if (userRole === ROLES.PRESIDENT || userRole === ROLES.SECRETARY) {
    if (module === 'users' || module === 'audit-logs' || module === 'settings') {
      return false;
    }
    return true;
  }

  switch (module) {
    case 'finance':
    case 'expenses':
    case 'budget':
    case 'ledger':
    case 'vendors':
    case 'donations':
    case 'reports':
      return [ROLES.TREASURER, ROLES.FINANCE_ADMIN].includes(userRole as any);

    case 'kabaddi':
      return [ROLES.KABADDI_ADMIN, ROLES.EVENT_MANAGER].includes(userRole as any);

    case 'awards':
    case 'students':
      return [ROLES.AWARDS_ADMIN].includes(userRole as any);

    case 'events':
      return [ROLES.EVENT_MANAGER].includes(userRole as any);

    case 'registrations':
      return [
        ROLES.KABADDI_ADMIN,
        ROLES.AWARDS_ADMIN,
        ROLES.EVENT_MANAGER,
        ROLES.VOLUNTEER,
      ].includes(userRole as any);

    case 'notices':
    case 'gallery':
      return [ROLES.EVENT_MANAGER].includes(userRole as any);

    case 'committee':
      return [ROLES.SUPER_ADMIN, ROLES.PRESIDENT, ROLES.SECRETARY].includes(userRole as any);

    case 'users':
    case 'settings':
    case 'audit-logs':
      return userRole === ROLES.SUPER_ADMIN;

    default:
      return false;
  }
}

/**
 * Check role permission against a list of permitted roles
 */
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
