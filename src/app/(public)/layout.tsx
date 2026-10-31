import React from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MarqueeAnnouncement from '@/components/public/MarqueeAnnouncement';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch live marquee announcement from database settings or announcement table
  let marqueeText = 'श्री श्री 108 काली पूजा महोत्सव 2026: 9 एवं 10 नवंबर को भव्य आयोजन! कबड्डी प्रतियोगिता एवं मेधावी छात्र सम्मान हेतु ऑनलाइन पंजीकरण प्रारंभ।';
  try {
    const setting = await prisma.websiteSetting.findUnique({
      where: { key: 'MARQUEE_ANNOUNCEMENT' },
    });
    if (setting?.value) {
      marqueeText = setting.value;
    }
  } catch (err) {
    console.error('Error fetching marquee setting:', err);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MarqueeAnnouncement announcementText={marqueeText} />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
