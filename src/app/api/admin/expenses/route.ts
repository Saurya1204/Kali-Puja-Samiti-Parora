import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog } from '@/lib/auth';
import { z } from 'zod';

const ExpenseInputSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, 'व्यय श्रेणी आवश्यक है'),
  vendorId: z.string().optional().nullable(),
  eventId: z.string().optional().nullable(),
  title: z.string().min(2, 'व्यय शीर्षक आवश्यक है'),
  billNumber: z.string().optional().nullable(),
  billDate: z.string().min(1, 'बिल दिनांक आवश्यक है'),
  paymentDate: z.string().optional().nullable(),
  amount: z.coerce.number().min(1, 'मान्य राशि दर्ज करें'),
  paidAmount: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'OTHER']).default('CASH'),
  paymentStatus: z.enum(['PAID', 'PARTIAL', 'UNPAID']).default('PAID'),
  description: z.string().optional().nullable(),
  billFileUrl: z.string().optional().nullable(),
  receiptFileUrl: z.string().optional().nullable(),
  approvalStatus: z.enum(['APPROVED', 'PENDING', 'REJECTED']).default('APPROVED'),
});

// GET: Fetch expenses with filters
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const vendorId = searchParams.get('vendorId');
    const paymentStatus = searchParams.get('paymentStatus');
    const festivalYear = searchParams.get('festivalYear');

    let yearId: string | undefined = undefined;
    if (festivalYear) {
      const fy = await prisma.festivalYear.findUnique({
        where: { year: parseInt(festivalYear) },
      });
      if (fy) yearId = fy.id;
    } else {
      const activeYear = await prisma.festivalYear.findFirst({
        where: { isActive: true },
      });
      if (activeYear) yearId = activeYear.id;
    }

    const expenses = await prisma.expense.findMany({
      where: {
        ...(yearId ? { festivalYearId: yearId } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(vendorId ? { vendorId } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
      },
      include: {
        category: true,
        vendor: true,
        event: true,
        bills: true,
        payments: true,
      },
      orderBy: { billDate: 'desc' },
    });

    return NextResponse.json({ success: true, expenses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create or Update Expense
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validated = ExpenseInputSchema.parse(body);

    const activeYear = await prisma.festivalYear.findFirst({
      where: { isActive: true },
    });
    if (!activeYear) return NextResponse.json({ error: 'Active festival year not found' }, { status: 400 });

    const outstanding = Math.max(0, validated.amount - validated.paidAmount);
    const status = validated.paidAmount >= validated.amount ? 'PAID' : validated.paidAmount > 0 ? 'PARTIAL' : 'UNPAID';

    // Transaction to update Expense, Bill, Payment, and Vendor Outstanding Balance atomically
    const result = await prisma.$transaction(async (tx) => {
      let expense;
      if (validated.id) {
        // Update existing expense
        expense = await tx.expense.update({
          where: { id: validated.id },
          data: {
            categoryId: validated.categoryId,
            vendorId: validated.vendorId || null,
            eventId: validated.eventId || null,
            title: validated.title,
            billNumber: validated.billNumber || null,
            billDate: new Date(validated.billDate),
            paymentDate: validated.paymentDate ? new Date(validated.paymentDate) : null,
            amount: validated.amount,
            paidAmount: validated.paidAmount,
            outstandingAmount: outstanding,
            paymentMethod: validated.paymentMethod,
            paymentStatus: status,
            description: validated.description || null,
            billFileUrl: validated.billFileUrl || null,
            receiptFileUrl: validated.receiptFileUrl || null,
            approvalStatus: validated.approvalStatus,
          },
        });
      } else {
        // Create new expense
        expense = await tx.expense.create({
          data: {
            festivalYearId: activeYear.id,
            categoryId: validated.categoryId,
            vendorId: validated.vendorId || null,
            eventId: validated.eventId || null,
            title: validated.title,
            billNumber: validated.billNumber || null,
            billDate: new Date(validated.billDate),
            paymentDate: validated.paymentDate ? new Date(validated.paymentDate) : null,
            amount: validated.amount,
            advanceAmount: validated.paidAmount,
            paidAmount: validated.paidAmount,
            outstandingAmount: outstanding,
            paymentMethod: validated.paymentMethod,
            paymentStatus: status,
            description: validated.description || null,
            billFileUrl: validated.billFileUrl || null,
            receiptFileUrl: validated.receiptFileUrl || null,
            addedById: user.id,
            approvalStatus: validated.approvalStatus,
          },
        });

        // Create Bill record
        await tx.bill.create({
          data: {
            expenseId: expense.id,
            invoiceNumber: validated.billNumber || `BILL-${Date.now().toString().slice(-6)}`,
            billDate: new Date(validated.billDate),
            amount: validated.amount,
            fileUrl: validated.billFileUrl || null,
            notes: validated.description || null,
          },
        });

        // If paidAmount > 0, create Payment and Ledger entries
        if (validated.paidAmount > 0) {
          await tx.payment.create({
            data: {
              expenseId: expense.id,
              vendorId: validated.vendorId || null,
              amount: validated.paidAmount,
              paymentDate: validated.paymentDate ? new Date(validated.paymentDate) : new Date(),
              paymentMethod: validated.paymentMethod,
              transactionRef: `PMT-${Date.now().toString().slice(-6)}`,
              notes: `Payment for ${validated.title}`,
            },
          });

          // Create Financial Transaction entry
          await tx.financialTransaction.create({
            data: {
              festivalYearId: activeYear.id,
              type: 'EXPENSE',
              referenceType: 'EXPENSE',
              referenceId: expense.id,
              amount: validated.paidAmount,
              paymentMethod: validated.paymentMethod,
              description: `Expense: ${validated.title}`,
            },
          });

          // Ledger Entry
          const accountType = validated.paymentMethod === 'CASH' ? 'CASH' : 'BANK_UPI';
          await tx.ledgerEntry.create({
            data: {
              festivalYearId: activeYear.id,
              accountType,
              debit: validated.paidAmount,
              credit: 0,
              balance: -validated.paidAmount,
              description: `Paid for ${validated.title}`,
              referenceId: expense.id,
            },
          });
        }
      }

      // If vendorId is attached, recalculate Vendor balances
      if (validated.vendorId) {
        const vendorExpenses = await tx.expense.findMany({
          where: { vendorId: validated.vendorId },
        });
        const totalBilled = vendorExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalPaid = vendorExpenses.reduce((sum, e) => sum + e.paidAmount, 0);
        const outstandingBalance = Math.max(0, totalBilled - totalPaid);

        await tx.vendor.update({
          where: { id: validated.vendorId },
          data: { totalBilled, totalPaid, outstandingBalance },
        });
      }

      return expense;
    });

    // Record Audit Log
    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: validated.id ? 'UPDATE_EXPENSE' : 'CREATE_EXPENSE',
      module: 'EXPENSES',
      recordId: result.id,
      details: `${user.name} recorded expense: "${result.title}" for ₹${result.amount}`,
    });

    return NextResponse.json({ success: true, expense: result });
  } catch (err: any) {
    console.error('Expense save error:', err);
    return NextResponse.json(
      { error: err?.errors?.[0]?.message || err.message || 'व्यय सहेजने में त्रुटि' },
      { status: 400 }
    );
  }
}

// DELETE: Soft delete / Controlled delete with audit trail
export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Expense ID required' }, { status: 400 });

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });

    await prisma.expense.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'DELETE_EXPENSE',
      module: 'EXPENSES',
      recordId: id,
      details: `Expense "${expense.title}" of ₹${expense.amount} was deleted by ${user.name}`,
    });

    return NextResponse.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
