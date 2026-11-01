import React from 'react';
import prisma from '@/lib/prisma';
import ReportsClient from './ReportsClient';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams?: { festivalYear?: string };
}) {
  const reqYear = searchParams?.festivalYear ? parseInt(searchParams.festivalYear) : undefined;

  let festivalYear = reqYear
    ? await prisma.festivalYear.findUnique({ where: { year: reqYear } })
    : await prisma.festivalYear.findFirst({ where: { isActive: true } });

  if (!festivalYear) {
    festivalYear = await prisma.festivalYear.findFirst({ orderBy: { year: 'desc' } });
  }

  const yearId = festivalYear?.id;

  // 1. Total Income
  const openingTxn = await prisma.financialTransaction.findFirst({
    where: { festivalYearId: yearId, referenceType: 'OPENING_BALANCE' },
  });
  const openingBalance = openingTxn?.amount || 0;

  const rawDonations = await prisma.donation.findMany({
    where: { festivalYearId: yearId, status: 'CONFIRMED' },
    orderBy: { donationDate: 'desc' },
  });
  const totalDonations = rawDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalIncome = openingBalance + totalDonations;

  // 2. Expenses
  const rawExpenses = await prisma.expense.findMany({
    where: { festivalYearId: yearId, approvalStatus: 'APPROVED' },
    include: { category: true, vendor: true },
  });
  const totalExpenses = rawExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = rawExpenses.reduce((sum, e) => sum + e.paidAmount, 0);
  const totalDue = rawExpenses.reduce((sum, e) => sum + e.outstandingAmount, 0);
  const closingBalance = totalIncome - totalPaid;

  // 3. Category Expenses
  const catMap: Record<string, { amount: number; count: number }> = {};
  (rawExpenses || []).forEach((e: any) => {
    const name = e?.category?.nameHindi || e?.category?.name || 'अन्य व्यय';
    if (!catMap[name]) catMap[name] = { amount: 0, count: 0 };
    catMap[name].amount += e?.amount || 0;
    catMap[name].count += 1;
  });
  const categoryExpenses = Object.entries(catMap).map(([name, val]) => ({
    name,
    amount: val.amount,
    count: val.count,
  }));

  // 4. Vendors
  const rawVendors = await prisma.vendor.findMany({
    orderBy: { totalBilled: 'desc' },
  });
  const vendorBalances = rawVendors.map((v) => ({
    name: v.name,
    category: v.serviceCategory,
    billed: v.totalBilled,
    paid: v.totalPaid,
    due: v.outstandingBalance,
  }));

  // 5. Donations
  const donations = rawDonations.map((d) => ({
    receiptNumber: d.receiptNumber,
    donorName: d.donorName,
    amount: d.amount,
    method: d.paymentMethod,
    date: d.donationDate.toISOString(),
  }));

  // 6. Achievers
  const rawAchievers = await prisma.studentAchievement.findMany({
    where: { festivalYearId: yearId, status: 'APPROVED' },
    orderBy: { yearOfPassing: 'desc' },
  });
  const achievers = rawAchievers.map((a) => ({
    name: a.studentName,
    category: a.category,
    marks: a.marksPercentageOrRank,
    prize: a.prizeAssigned || 'Trophy & Certificate',
  }));

  // 7. Registrations
  const rawRegs = await prisma.eventRegistration.findMany({
    where: { festivalYearId: yearId },
    include: { event: true },
    orderBy: { createdAt: 'desc' },
  });
  const registrations = rawRegs.map((r) => ({
    regNo: r.registrationNumber,
    name: r.applicantName,
    type: r.registrationType,
    status: r.status,
    event: r.event.titleHindi || r.event.title,
  }));

  const reportData = {
    festivalYear: festivalYear?.year || 2026,
    totalIncome,
    totalExpenses,
    totalPaid,
    totalDue,
    closingBalance,
    categoryExpenses,
    vendorBalances,
    donations,
    achievers,
    registrations,
  };

  return <ReportsClient data={reportData} />;
}

