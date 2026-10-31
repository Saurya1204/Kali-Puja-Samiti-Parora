import React from 'react';
import prisma from '@/lib/prisma';
import SettingsManager from './SettingsManager';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const rawYears = await prisma.festivalYear.findMany({
    orderBy: { year: 'desc' },
  });

  const years = rawYears.map((y) => ({
    ...y,
    startDate: y.startDate.toISOString(),
    endDate: y.endDate.toISOString(),
  }));

  const settingRecords = await prisma.websiteSetting.findMany();
  const settings: Record<string, string> = {};
  settingRecords.forEach((s) => {
    settings[s.key] = s.value;
  });

  return <SettingsManager initialYears={years} initialSettings={settings} />;
}

