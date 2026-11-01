import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import YearSelector from '@/components/admin/YearSelector';
import Link from 'next/link';
import { Globe } from 'lucide-react';

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
        {/* Top Header */}
        <header className="h-16 bg-maroon-950/80 border-b border-amber-600/30 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <YearSelector years={years} currentYear={activeYear?.year || 2026} />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-100 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 sm:px-3 py-1.5 rounded-full transition-all"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">पब्लिक वेबसाइट देखें</span>
              <span className="sm:hidden">वेबसाइट</span>
            </Link>

            <div className="flex items-center gap-2 border-l border-amber-900/60 pl-2 sm:pl-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-maroon-950 font-bold flex items-center justify-center text-xs shadow">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block text-xs">
                <span className="font-bold text-stone-200 block leading-tight truncate max-w-[140px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-amber-400 font-mono uppercase">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Child Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
