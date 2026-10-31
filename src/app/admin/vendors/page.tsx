import React from 'react';
import prisma from '@/lib/prisma';
import VendorManager from './VendorManager';

export const dynamic = 'force-dynamic';

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: 'asc' },
    include: {
      expenses: {
        select: {
          id: true,
          title: true,
          amount: true,
          paidAmount: true,
          billDate: true,
          billNumber: true,
        },
      },
    },
  });

  return <VendorManager initialVendors={vendors} />;
}
