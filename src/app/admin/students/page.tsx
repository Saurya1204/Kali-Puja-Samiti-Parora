import React from 'react';
import prisma from '@/lib/prisma';
import StudentManager from './StudentManager';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage({
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

  const students = await prisma.studentAchievement.findMany({
    where: { festivalYearId: festivalYear?.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <StudentManager
      initialStudents={students}
      festivalYear={festivalYear?.year || 2026}
    />
  );
}
