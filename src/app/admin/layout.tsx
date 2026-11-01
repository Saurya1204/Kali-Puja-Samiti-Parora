import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import YearSelector from '@/components/admin/YearSelector';
import Link from 'next/link';
import { Globe } from 'lucide-react';

import AdminHeader from '@/components/admin/AdminHeader';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  const years = await prisma.festivalYear.findMany({
    orderBy: { year: 'desc' },
    select: { id: true, year: true, name: true, isActive: true },
  });

  const activeYear = years.find((y) => y.isActive) || years[0];

  return (
    <div className="flex min-h-screen bg-[#0d0202] text-stone-100">
      {/* Sidebar - responsive desktop & mobile drawer */}
      <AdminSidebar userRole={user.role} userName={user.name} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - responsive with mobile hamburger and compact controls */}
        <AdminHeader
          years={years}
          activeYear={activeYear}
          userName={user.name}
          userRole={user.role}
        />

        {/* Child Pages */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
