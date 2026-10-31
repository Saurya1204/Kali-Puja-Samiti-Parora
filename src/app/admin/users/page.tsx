import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSessionUser, ROLES } from '@/lib/auth';
import AdminUserManager from './AdminUserManager';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const currentUser = await getSessionUser();
  if (!currentUser) redirect('/login');

  if (currentUser.role !== ROLES.SUPER_ADMIN) {
    redirect('/admin');
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

  const formatted = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return <AdminUserManager initialUsers={formatted} currentUserId={currentUser.id} />;
}

