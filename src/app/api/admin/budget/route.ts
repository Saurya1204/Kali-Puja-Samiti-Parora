import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog } from '@/lib/auth';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { categoryId, allocatedAmount, festivalYear } = await req.json();

    const fy = await prisma.festivalYear.findFirst({
      where: festivalYear ? { year: parseInt(festivalYear) } : { isActive: true },
    });
    if (!fy) return NextResponse.json({ error: 'Festival year not found' }, { status: 400 });

    let budget = await prisma.budget.findUnique({
      where: { festivalYearId: fy.id },
    });

    if (!budget) {
      budget = await prisma.budget.create({
        data: { festivalYearId: fy.id, totalAllocated: 0 },
      });
    }

    await prisma.budgetAllocation.upsert({
      where: {
        budgetId_categoryId: {
          budgetId: budget.id,
          categoryId,
        },
      },
      update: { allocatedAmount: Number(allocatedAmount) },
      create: {
        budgetId: budget.id,
        categoryId,
        allocatedAmount: Number(allocatedAmount),
      },
    });

    // Recalculate total allocated
    const allAllocations = await prisma.budgetAllocation.findMany({
      where: { budgetId: budget.id },
    });
    const newTotal = allAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0);

    await prisma.budget.update({
      where: { id: budget.id },
      data: { totalAllocated: newTotal },
    });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'UPDATE_BUDGET',
      module: 'BUDGET',
      details: `${user.name} updated budget allocation for category to ₹${allocatedAmount}`,
    });

    return NextResponse.json({ success: true, totalAllocated: newTotal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

