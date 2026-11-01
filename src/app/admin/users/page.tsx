import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSessionUser, ROLES } from '@/lib/auth';
import AdminUserManager from './AdminUserManager';

import { DEFAULT_ROLES, RoleConfig } from '@/lib/rolePermissions';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const currentUser = await getSessionUser();
  if (!currentUser) redirect('/login');

  if (currentUser.role !== ROLES.SUPER_ADMIN) {
    redirect('/admin');
  }

  const [users, setting] = await Promise.all([
    prisma.user.findMany({
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
    }),
    prisma.websiteSetting.findUnique({
      where: { key: 'ROLE_PERMISSIONS_CONFIG' },
    }),
  ]);

  let roles: RoleConfig[] = DEFAULT_ROLES;
  if (setting?.value) {
    try {
      roles = JSON.parse(setting.value);
    } catch {
      roles = DEFAULT_ROLES;
    }
  }

  const formatted = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <AdminUserManager
      initialUsers={formatted}
      currentUserId={currentUser.id}
      initialRoles={roles}
    />
  );
}

