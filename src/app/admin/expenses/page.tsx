import React from 'react';
import prisma from '@/lib/prisma';
import ExpenseManager from './ExpenseManager';

export const dynamic = 'force-dynamic';

export default async function AdminExpensesPage({
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

  const categories = await prisma.expenseCategory.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' },
  });

  const rawExpenses = await prisma.expense.findMany({
    where: { festivalYearId: festivalYear?.id },
    include: {
      category: true,
      vendor: true,
    },
    orderBy: { billDate: 'desc' },
  });

  // Serialize dates for Client Component
  const expenses = rawExpenses.map((e) => ({
    ...e,
    billDate: e.billDate.toISOString(),
    paymentDate: e.paymentDate ? e.paymentDate.toISOString() : null,
  }));

  return (
    <ExpenseManager
      initialExpenses={expenses}
      categories={categories}
      vendors={vendors}
      festivalYear={festivalYear?.year || 2026}
    />
  );
}

