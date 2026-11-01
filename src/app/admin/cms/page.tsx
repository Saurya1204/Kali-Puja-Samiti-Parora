import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSessionUser, ROLES } from '@/lib/auth';
import CmsManager from './CmsManager';

export const dynamic = 'force-dynamic';

export default async function AdminCmsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.PRESIDENT) {
    redirect('/admin');
  }

  const rawBanners = await prisma.cmsBanner.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  const rawSections = await prisma.cmsContentSection.findMany({
    orderBy: { sectionKey: 'asc' },
  });

  const banners = rawBanners.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  const sections = rawSections.map((s) => ({
    ...s,
    updatedAt: s.updatedAt.toISOString(),
  }));

  return <CmsManager initialBanners={banners} initialSections={sections} />;
}

