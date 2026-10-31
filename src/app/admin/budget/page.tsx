import React from 'react';
import prisma from '@/lib/prisma';
import BudgetManager from './BudgetManager';

export const dynamic = 'force-dynamic';

export default async function AdminBudgetPage({
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

  const categories = await prisma.expenseCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      budgetAllocations: {
        where: { budget: { festivalYearId: yearId } },
      },
      expenses: {
        where: { festivalYearId: yearId, approvalStatus: 'APPROVED' },
      },
    },
  });

  const allocations = categories.map((cat) => {
    const allocated = cat.budgetAllocations[0]?.allocatedAmount || 0;
    const spent = cat.expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      categoryNameHindi: cat.nameHindi,
      allocated,
      spent,
    };
  });

  return (
    <BudgetManager
      initialAllocations={allocations}
      festivalYear={festivalYear?.year || 2026}
    />
  );
}
