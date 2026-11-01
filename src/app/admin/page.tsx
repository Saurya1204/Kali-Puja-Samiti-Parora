import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import DashboardCharts from './DashboardCharts';
import { formatINR, formatDate, formatDateTime } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Trophy,
  GraduationCap,
  ClipboardList,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: { festivalYear?: string };
}) {
  let festivalYear: any = null;
  let donations: any[] = [];
  let expenses: any[] = [];
  let recentExpenses: any[] = [];
  let recentDonations: any[] = [];
  let openingBalance = 0;
  let registrationsCount = 0;
  let pendingRegistrationsCount = 0;
  let studentCount = 0;
  let pendingStudentCount = 0;
  let kabaddiTeamsCount = 0;
  let eventsCount = 0;
  let sponsorsCount = 0;

  try {
    const reqYear = searchParams?.festivalYear ? parseInt(searchParams.festivalYear) : undefined;

    festivalYear = reqYear
      ? await prisma.festivalYear.findUnique({ where: { year: reqYear } })
      : await prisma.festivalYear.findFirst({ where: { isActive: true } });

    if (!festivalYear) {
      festivalYear = await prisma.festivalYear.findFirst({ orderBy: { year: 'desc' } });
    }

    const yearId = festivalYear?.id;

    // 1. Calculate Total Donations
    donations = await prisma.donation.findMany({
      where: { festivalYearId: yearId, status: 'CONFIRMED' },
    });

    // 2. Calculate Total Expenses
    expenses = await prisma.expense.findMany({
      where: { festivalYearId: yearId, approvalStatus: 'APPROVED' },
      include: { category: true, vendor: true },
    });

    // 3. Opening Balance
    const openingTxn = await prisma.financialTransaction.findFirst({
      where: { festivalYearId: yearId, referenceType: 'OPENING_BALANCE' },
    });
    openingBalance = openingTxn?.amount || 0;

    // 4. Counts
    registrationsCount = await prisma.eventRegistration.count({
      where: { festivalYearId: yearId },
    });
    pendingRegistrationsCount = await prisma.eventRegistration.count({
      where: { festivalYearId: yearId, status: 'PENDING' },
    });

    studentCount = await prisma.studentAchievement.count({
      where: { festivalYearId: yearId },
    });
    pendingStudentCount = await prisma.studentAchievement.count({
      where: { festivalYearId: yearId, status: 'PENDING' },
    });

    kabaddiTeamsCount = await prisma.kabaddiTeam.count({
      where: { festivalYearId: yearId },
    });

    eventsCount = await prisma.event.count({
      where: { festivalYearId: yearId },
    });

    sponsorsCount = await prisma.sponsor.count({
      where: { festivalYearId: yearId },
    });

    // 6. Recent expenses & bills
    recentExpenses = await prisma.expense.findMany({
      where: { festivalYearId: yearId },
      include: { category: true, vendor: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 7. Recent donations
    recentDonations = await prisma.donation.findMany({
      where: { festivalYearId: yearId },
      orderBy: { donationDate: 'desc' },
      take: 5,
    });
  } catch (err) {
    console.error('Error fetching admin dashboard data:', err);
  }

  const totalDonations = donations.reduce((sum: number, d: any) => sum + (d?.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e?.amount || 0), 0);
  const totalPaidExpenses = expenses.reduce((sum: number, e: any) => sum + (e?.paidAmount || 0), 0);
  const totalOutstandingExpenses = expenses.reduce((sum: number, e: any) => sum + (e?.outstandingAmount || 0), 0);

  const totalIncome = openingBalance + totalDonations;
  const availableBalance = totalIncome - totalPaidExpenses;

  // 5. Category-wise expense breakdown for chart
  const catMap: Record<string, number> = {};
  (expenses || []).forEach((e: any) => {
    const catName = e?.category?.nameHindi || e?.category?.name || 'सामान्य व्यय';
    catMap[catName] = (catMap[catName] || 0) + (e?.amount || 0);
  });
  const categoryChartData = Object.entries(catMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const incomeVsExpense = [
    {
      name: `Kali Puja ${festivalYear?.year || 2026}`,
      income: totalIncome,
      expense: totalExpenses,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner with Festival Context */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            Executive Summary & Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
            प्रशासनिक नियंत्रण कक्ष ({festivalYear?.name || '2026'})
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            सभी आंकड़े वास्तविक डेटाबेस लेजर से वास्तविक समय (Real-time) में सिंक हैं।
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/expenses?action=add"
            className="festive-btn-gold text-xs px-4 py-2 flex items-center gap-1.5 font-bold"
          >
            <PlusCircle className="w-3.5 h-3.5 text-maroon-950" />
            <span>व्यय दर्ज करें</span>
          </Link>
          <Link
            href="/admin/donations"
            className="bg-black/60 hover:bg-black/80 text-amber-300 border border-amber-600/40 px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
          >
            <span>दान रसीद</span>
          </Link>
          <Link
            href="/admin/reports"
            className="bg-maroon-900/60 hover:bg-maroon-800 text-stone-200 border border-amber-900 px-3.5 py-2 rounded-full text-xs font-semibold"
          >
            <span>वार्षिक रिपोर्ट</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Available Balance */}
        <div className="bg-gradient-to-br from-amber-950/70 via-black to-maroon-950/80 border border-amber-500/50 rounded-2xl p-5 shadow-glow-gold relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              अवशेष शेष (Balance)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-300 font-mono mt-3">
            {formatINR(availableBalance)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
            <span>प्रारंभिक शेष: {formatINR(openingBalance)}</span>
            <span className="text-emerald-400 font-semibold">सक्रिय लेजर</span>
          </div>
        </div>

        {/* Card 2: Total Income / Donations */}
        <div className="bg-black/50 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              कुल आय / दान (Income)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-300 font-mono mt-3">
            {formatINR(totalIncome)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            कुल दान रसीदें: <strong className="text-stone-200">{donations.length}</strong>
          </div>
        </div>

        {/* Card 3: Total Approved Expenses */}
        <div className="bg-black/50 border border-red-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              कुल स्वीकृत व्यय (Expenses)
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-red-300 font-mono mt-3">
            {formatINR(totalExpenses)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
            <span>भुगतान: {formatINR(totalPaidExpenses)}</span>
            <span className="text-amber-400">बाकी: {formatINR(totalOutstandingExpenses)}</span>
          </div>
        </div>

        {/* Card 4: Registrations & Pending Approvals */}
        <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              पंजीकरण व आवेदन
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-100 font-mono mt-3">
            {registrationsCount}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
            <span>लंबित सत्यापन:</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              {pendingRegistrationsCount + pendingStudentCount}
            </span>
          </div>
        </div>
      </div>

      {/* QUICK STATUS SUMMARY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <Link
          href="/admin/kabaddi"
          className="bg-black/40 border border-amber-900/50 hover:border-amber-500/50 p-3.5 rounded-xl flex items-center justify-between transition-colors"
        >
          <div>
            <span className="text-stone-400 block">कबड्डी टीमें (Teams)</span>
            <span className="text-lg font-bold text-amber-300 font-mono">{kabaddiTeamsCount}</span>
          </div>
          <Trophy className="w-5 h-5 text-amber-400" />
        </Link>

        <Link
          href="/admin/students"
          className="bg-black/40 border border-amber-900/50 hover:border-amber-500/50 p-3.5 rounded-xl flex items-center justify-between transition-colors"
        >
          <div>
            <span className="text-stone-400 block">मेधावी छात्र आवेदन</span>
            <span className="text-lg font-bold text-amber-300 font-mono">{studentCount}</span>
          </div>
          <GraduationCap className="w-5 h-5 text-amber-400" />
        </Link>

        <Link
          href="/admin/vendors"
          className="bg-black/40 border border-amber-900/50 hover:border-amber-500/50 p-3.5 rounded-xl flex items-center justify-between transition-colors"
        >
          <div>
            <span className="text-stone-400 block">वेंडर बकाया देयता</span>
            <span className="text-lg font-bold text-red-400 font-mono">{formatINR(totalOutstandingExpenses)}</span>
          </div>
          <AlertCircle className="w-5 h-5 text-red-400" />
        </Link>

        <Link
          href="/admin/events"
          className="bg-black/40 border border-amber-900/50 hover:border-amber-500/50 p-3.5 rounded-xl flex items-center justify-between transition-colors"
        >
          <div>
            <span className="text-stone-400 block">कुल कार्यक्रम (Events)</span>
            <span className="text-lg font-bold text-amber-300 font-mono">{eventsCount}</span>
          </div>
          <Clock className="w-5 h-5 text-amber-400" />
        </Link>
      </div>

      {/* RECHARTS DATA VISUALIZATION */}
      <DashboardCharts
        categoryData={categoryChartData}
        incomeVsExpense={incomeVsExpense}
        budgetData={[]}
      />

      {/* RECENT FINANCIAL ACTIVITY TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
            <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span>हालिया व्यय एवं बिल (Recent Expenses)</span>
            </h4>
            <Link
              href="/admin/expenses"
              className="text-xs text-amber-400 hover:text-amber-200 font-semibold"
            >
              सभी देखें →
            </Link>
          </div>

          <div className="space-y-3">
            {recentExpenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-maroon-950/60 border border-amber-900/40 p-3 rounded-xl flex items-center justify-between text-xs hover:border-amber-500/40 transition-colors"
              >
                <div>
                  <h5 className="font-bold text-stone-200">{exp.title}</h5>
                  <div className="text-[11px] text-stone-400">
                    {exp.category?.nameHindi || exp.category?.name || 'सामान्य व्यय'}
                    {exp.vendor?.name ? ` • ${exp.vendor.name}` : ''}
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {formatDate(exp.billDate)} • बिल #{exp.billNumber || 'N/A'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-red-400 font-mono block">
                    {formatINR(exp.amount)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      exp.paymentStatus === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {exp.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
            <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>हालिया दान एवं प्राप्ति (Recent Donations)</span>
            </h4>
            <Link
              href="/admin/donations"
              className="text-xs text-amber-400 hover:text-amber-200 font-semibold"
            >
              सभी देखें →
            </Link>
          </div>

          <div className="space-y-3">
            {recentDonations.map((don) => (
              <div
                key={don.id}
                className="bg-maroon-950/60 border border-amber-900/40 p-3 rounded-xl flex items-center justify-between text-xs hover:border-amber-500/40 transition-colors"
              >
                <div>
                  <h5 className="font-bold text-stone-200">{don.donorName}</h5>
                  <div className="text-[11px] text-stone-400">
                    {don.purpose || 'दान'} • {don.paymentMethod}
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-mono">
                    रसीद: {don.receiptNumber} • {formatDate(don.donationDate)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-400 font-mono block">
                    {formatINR(don.amount)}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {don.donorAddressOrVillage || 'परोरा'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

