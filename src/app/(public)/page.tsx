import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import FestivalCountdown from '@/components/public/FestivalCountdown';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import WhatsAppShareButton from '@/components/public/WhatsAppShareButton';
import HeroBannerSlider from '@/components/public/HeroBannerSlider';
import { formatINR, formatDate } from '@/lib/utils';
import {
  Sparkles,
  Calendar,
  MapPin,
  Trophy,
  GraduationCap,
  Heart,
  ArrowRight,
  Flame,
  Users,
  Activity,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  Vote,
  ExternalLink,
  ShieldCheck,
  Phone,
  Award,
  Medal,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let festivalYear: any = null;
  let cmsBanners: any[] = [];
  let cmsSections: any[] = [];

  try {
    festivalYear = await prisma.festivalYear.findFirst({
      where: { isActive: true },
      include: {
        events: {
          where: { isPublished: true },
          include: { category: true },
          orderBy: { date: 'asc' },
          take: 6,
        },
        kabaddiMatches: {
          where: { status: 'LIVE' },
          include: { teamA: true, teamB: true },
          take: 1,
        },
        studentAchievements: {
          where: { isPublished: true, status: 'APPROVED' },
          orderBy: { yearOfPassing: 'desc' },
          take: 4,
        },
        sponsors: {
          where: { isPublished: true },
          orderBy: { sortOrder: 'asc' },
        },
        donations: {
          where: { isPubliclyVisible: true, status: 'CONFIRMED' },
          orderBy: { amount: 'desc' },
          take: 5,
        },
        galleries: {
          include: { media: { take: 1 } },
          take: 4,
        },
        announcements: {
          where: { isActive: true },
          orderBy: { isPinned: 'desc' },
          take: 3,
        },
      },
    });

    if (!festivalYear) {
      festivalYear = await prisma.festivalYear.findFirst({
        orderBy: { year: 'desc' },
        include: {
          events: { include: { category: true }, take: 6 },
          kabaddiMatches: { include: { teamA: true, teamB: true }, take: 1 },
          studentAchievements: { take: 4 },
          sponsors: true,
          donations: { take: 5 },
          galleries: { include: { media: true }, take: 4 },
          announcements: { take: 3 },
        },
      });
    }

    // Fetch CMS Banners and Dynamic Content Sections
    const [fetchedBanners, fetchedSections] = await Promise.all([
      prisma.cmsBanner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.cmsContentSection.findMany({
        where: { isPublished: true },
      }),
    ]);
    cmsBanners = fetchedBanners;
    cmsSections = fetchedSections;
  } catch (dbError) {
    console.error('Database connection or query error on HomePage:', dbError);
  }

  // Graceful fallback banners prioritizing Maa Kali Darshan & Chandika Asthan
  if (cmsBanners.length === 0) {
    cmsBanners = [
      {
        id: 'fallback-kali-darshan',
        title: 'श्री श्री 108 माँ काली दिव्य दर्शन – परोरा',
        subtitle: 'माँ चंडिका स्थान, परोरा, बेगूसराय (बिहार - 851217) – पावन वार्षिक काली पूजा महोत्सव 2026',
        badgeText: '🔴 दिव्य पावन दर्शन',
        imageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'मंदिर व पूजा दर्शन',
        linkUrl: '/about',
        sortOrder: 1,
      },
      {
        id: 'fallback-chandika-asthan',
        title: 'माँ चंडिका स्थान परोरा – चार दशकों की दिव्य आस्था',
        subtitle: 'स्थापना 1984 • तांत्रोक्त निशा पूजा, 108 दीप महाआरती, सामाजिक समरसता व मेधावी छात्र सम्मान',
        badgeText: '🏛️ सिद्ध पीठ चंडिका स्थान',
        imageUrl: 'https://images.unsplash.com/photo-1567591414240-e17f09325965?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'समिति परिचय व इतिहास',
        linkUrl: '/about',
        sortOrder: 2,
      },
      {
        id: 'fallback-kabaddi',
        title: 'अखिल बिहार राज्य स्तरीय आमंत्रण कबड्डी प्रतियोगिता 2026',
        subtitle: '9 एवं 10 नवंबर 2026 • उच्च विद्यालय खेल मैदान, परोरा | मुख्य संरक्षक: श्री अमरनाथ प्रसाद (6203510983)',
        badgeText: '🏆 खेल आयोजन: 9-10 Nov',
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'कबड्डी एरिना देखें',
        linkUrl: '/kabaddi',
        sortOrder: 3,
      },
    ];
  }

  const sectionMap = new Map(cmsSections.map((s) => [s.sectionKey, s]));
  const coachMessage = sectionMap.get('COACH_MESSAGE');
  const presidentDesk = sectionMap.get('PRESIDENT_DESK');
  const kabaddiSpotlight = sectionMap.get('KABADDI_SPOTLIGHT');

  const liveMatch = festivalYear?.kabaddiMatches?.[0];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 pb-16 px-4 overflow-hidden border-b border-amber-600/30">
        {/* Glowing Ambient Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Sacred Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-maroon-900/80 border border-amber-500/50 shadow-glow-gold backdrop-blur-sm animate-pulse">
            <DiyaAnimation size="sm" />
            <span className="text-xs sm:text-sm font-bold text-amber-300 tracking-wider">
              || ॐ क्रीं कालिकायै नमः ||
            </span>
            <DiyaAnimation size="sm" />
          </div>

          {/* Main Animated Title */}
          <div className="space-y-2">
            <h2 className="text-amber-400 font-serif text-sm sm:text-base md:text-lg tracking-widest uppercase font-bold">
              Welcome to the Historic Celebration
            </h2>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 font-serif leading-tight drop-shadow-md">
              श्री श्री 108 काली पूजा समिति परोरा
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-300/90 font-serif">
              Kali Puja Samiti Parora – {festivalYear?.year || 2026}
            </p>
          </div>

          {/* Theme & Venue */}
          <p className="text-sm sm:text-base md:text-lg text-amber-100/90 max-w-3xl mx-auto font-medium leading-relaxed">
            {festivalYear?.theme || 'आस्था, एकता, खेल एवं युवा उत्थान का पावन महापर्व'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-stone-200 py-2">
            <div className="flex items-center gap-1.5 bg-black/40 border border-amber-500/40 px-3.5 py-1.5 rounded-full">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>9 & 10 November {festivalYear?.year || 2026}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 border border-amber-500/40 px-3.5 py-1.5 rounded-full">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{festivalYear?.venue || 'Parora, Begusarai, Bihar - 851217'}</span>
            </div>
          </div>

          {/* DYNAMIC COUNTDOWN TIMER */}
          <div className="pt-4 max-w-xl mx-auto">
            <FestivalCountdown
              startDate={festivalYear?.startDate || '2026-11-09T08:00:00Z'}
              endDate={festivalYear?.endDate || '2026-11-10T23:59:59Z'}
            />
          </div>

          {/* CTA Action Buttons */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="festive-btn-gold text-sm sm:text-base px-6 py-3 flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-maroon-950" />
              <span>पंजीकरण करें (Register Now)</span>
            </Link>
            <Link
              href="/events"
              className="festive-btn-red text-sm sm:text-base px-6 py-3 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>कार्यक्रम समय-सारणी (Events)</span>
            </Link>
            <Link
              href="/donations"
              className="bg-black/60 hover:bg-black/80 text-amber-300 font-bold px-6 py-3 rounded-full border border-amber-500/50 shadow flex items-center gap-2 transition-all hover:border-amber-400"
            >
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>दान / सहयोग (Donate)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* DYNAMIC CMS HERO BANNERS (SUPER ADMIN CMS) - ENLARGED FOR REALTIME MAA KALI DARSHAN */}
      {cmsBanners.length > 0 && (
        <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 -mt-4 sm:-mt-8">
          <HeroBannerSlider banners={cmsBanners} />
        </section>
      )}

      {/* LIVE KABADDI STATUS BANNER (IF ACTIVE) */}
      {liveMatch && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-950 via-maroon-900 to-red-950 border-2 border-amber-500/70 rounded-2xl p-5 shadow-glow-gold relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                  🔴 LIVE KABADDI MATCH ONGOING
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-white">
                  {liveMatch.teamA.teamName} vs {liveMatch.teamB.teamName}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-black/60 border border-amber-500/40 px-6 py-2 rounded-xl">
              <div className="text-center">
                <span className="text-xs text-stone-300 block">{liveMatch.teamA.teamName}</span>
                <span className="text-3xl font-extrabold text-amber-300 font-mono">{liveMatch.teamAScore}</span>
              </div>
              <span className="text-2xl font-bold text-amber-500">-</span>
              <div className="text-center">
                <span className="text-xs text-stone-300 block">{liveMatch.teamB.teamName}</span>
                <span className="text-3xl font-extrabold text-amber-300 font-mono">{liveMatch.teamBScore}</span>
              </div>
            </div>

            <Link
              href="/kabaddi"
              className="festive-btn-gold text-xs px-4 py-2 shrink-0 flex items-center gap-1.5"
            >
              <span>लाइव स्कोरबोर्ड देखें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* QUICK FEATURE PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Link
            href="/events"
            className="festive-card p-5 group flex flex-col items-center text-center hover:scale-[1.02] transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-maroon-950 shadow-md mb-3 group-hover:rotate-6 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-amber-300 text-sm sm:text-base">Maha Kali Puja</h4>
            <p className="text-xs text-stone-400 mt-1">धार्मिक अनुष्ठान एवं निशा पूजा</p>
          </Link>

          <Link
            href="/about"
            className="festive-card p-5 group flex flex-col items-center text-center hover:scale-[1.02] transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-md mb-3 group-hover:rotate-6 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-amber-300 text-sm sm:text-base">Maa Chandika Asthan</h4>
            <p className="text-xs text-stone-400 mt-1">समिति परिचय व 40+ वर्ष इतिहास</p>
          </Link>

          <Link
            href="/achievers"
            className="festive-card p-5 group flex flex-col items-center text-center hover:scale-[1.02] transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-maroon-950 shadow-md mb-3 group-hover:rotate-6 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-amber-300 text-sm sm:text-base">Pratibha Samman</h4>
            <p className="text-xs text-stone-400 mt-1">मेधावी छात्र अभिनंदन व पुरस्कार</p>
          </Link>

          <Link
            href="/donations"
            className="festive-card p-5 group flex flex-col items-center text-center hover:scale-[1.02] transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-md mb-3 group-hover:rotate-6 transition-transform">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <h4 className="font-bold text-amber-300 text-sm sm:text-base">Online Chanda / Seva</h4>
            <p className="text-xs text-stone-400 mt-1">सुरक्षित UPI व बैंक रसीद</p>
          </Link>
        </div>
      </section>

      {/* ANNUAL FESTIVAL SPORTS EVENT: ALL-BIHAR KABADDI TOURNAMENT (9 & 10 NOV 2026) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#1a0505] via-[#240808] to-maroon-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* OFFICIAL TOURNAMENT BANNER STRIP */}
          <div className="mb-8 p-5 sm:p-6 bg-gradient-to-r from-red-950/90 via-black to-maroon-900/90 border border-amber-500/50 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-maroon-950 font-black text-2xl shadow shrink-0">
                🏆
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                    आधिकारिक टूर्नामेंट
                  </span>
                  <span className="text-xs text-amber-300 font-mono font-bold bg-black/60 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    📅 9 एवं 10 नवंबर 2026
                  </span>
                </div>
                <h4 className="text-lg sm:text-2xl font-black text-amber-100 font-serif mt-1">
                  अखिल बिहार राज्य स्तरीय आमंत्रण कबड्डी प्रतियोगिता 2026
                </h4>
                <p className="text-xs text-stone-300">
                  श्री श्री 108 काली पूजा महोत्सव 2026 • उच्च विद्यालय खेल मैदान, परोरा (बेगूसराय - 851217)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Link
                href="/kabaddi"
                className="festive-btn-gold text-xs px-5 py-2.5 flex items-center gap-1.5 font-bold shadow flex-1 sm:flex-none justify-center"
              >
                <span>कबड्डी एरिना व शेड्यूल</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/register?type=KABADDI"
                className="bg-black/60 hover:bg-black/80 text-amber-200 border border-amber-500/50 text-xs px-4 py-2.5 rounded-full font-bold flex-1 sm:flex-none text-center"
              >
                <span>टीम पंजीकरण</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Col: Kabaddi Heritage as Festival Sports Event */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/40 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>वार्षिक खेल आयोजन • 9 व 10 नवंबर 2026</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-amber-200 font-serif leading-tight">
                {kabaddiSpotlight?.title || 'काली पूजा महोत्सव का पारंपरिक खेल: राज्यस्तरीय कबड्डी प्रतियोगिता'}
              </h3>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {kabaddiSpotlight?.content ||
                  'श्री श्री 108 काली पूजा महोत्सव, परोरा के उपलक्ष्य में प्रतिवर्ष राज्यस्तरीय कबड्डी प्रतियोगिता का भव्य आयोजन होता है। उच्च विद्यालय परोरा के मैदान पर अत्याधुनिक प्रो-मैट एवं फ्लडलाइट्स कोर्ट पर बिहार की शीर्ष 16 टीमें खिताबी भिड़ंत करती हैं।'}
              </p>

              {/* Quick Arena highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-black/60 border border-amber-600/30 text-center">
                  <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono block">9-10 Nov</span>
                  <span className="text-[11px] text-stone-400">टूर्नामेंट तिथियां</span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-amber-600/30 text-center">
                  <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono block">Pro Mat</span>
                  <span className="text-[11px] text-stone-400">डे-नाईट फ्लडलाइट्स कोर्ट</span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-amber-600/30 text-center col-span-2 sm:col-span-1">
                  <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono block">₹51,000+</span>
                  <span className="text-[11px] text-stone-400">नकद पुरस्कार व शील्ड</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/kabaddi"
                  className="festive-btn-gold text-xs sm:text-sm px-5 py-2.5 flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-maroon-950" />
                  <span>खिलाड़ी प्रोफाइल व लाइव स्कोर देखें</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/about"
                  className="bg-black/60 hover:bg-black/80 text-amber-200 border border-amber-500/40 text-xs sm:text-sm px-5 py-2.5 rounded-full font-bold"
                >
                  <span>माँ चंडिका स्थान व समिति इतिहास</span>
                </Link>
              </div>
            </div>

            {/* Right Col: Leadership Tribute (Coach Amarnath Prasad & President Sillu Kumar) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Coach Amarnath Prasad Card */}
              <div className="p-5 rounded-2xl bg-black/70 border border-amber-500/40 relative overflow-hidden space-y-2.5 shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Chief Sports Mentor & Super Admin
                    </span>
                    <h4 className="text-lg font-bold text-white font-serif">
                      श्री अमरनाथ प्रसाद (Amarnath Prasad)
                    </h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Medal className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-stone-300 leading-snug">
                  बिहार कबड्डी के शीर्ष कोच व मार्गदर्शक, जिन्होंने बिहार कबड्डी को दर्जनों राष्ट्रीय प्रतिभाएं दी हैं। पूर्व कबड्डी खिलाड़ी, बिहार राज्य पूर्व बॉक्सर एवं कराटे ब्लैक बेल्ट।
                </p>

                <div className="pt-2 border-t border-amber-900/60 flex items-center justify-between text-xs text-amber-300">
                  <span className="text-[11px] text-stone-400">संपर्क / मार्गदर्शन:</span>
                  <a href="tel:6203510983" className="flex items-center gap-1.5 font-bold hover:underline font-mono">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>6203510983</span>
                  </a>
                </div>
              </div>

              {/* President Sillu Kumar Card */}
              <div className="p-4 rounded-2xl bg-black/60 border border-amber-600/30 space-y-1.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-amber-400">
                    Current President (अध्यक्ष)
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">समिति सत्र 2026</span>
                </div>
                <h4 className="text-base font-bold text-stone-100 font-serif">
                  श्री सिल्लू कुमार (Sillu Kumar)
                </h4>
                <p className="text-xs text-stone-300 leading-snug">
                  अध्यक्ष, श्री श्री 108 काली पूजा समिति परोरा। &quot;माँ काली की कृपा से हम निष्पक्षता, भव्यता और सामाजिक एकता के साथ इस महोत्सव को नई ऊंचाइयों पर ले जाने हेतु समर्पित हैं।&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-3 border-b border-amber-900/40 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <DiyaAnimation size="sm" />
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                Festival Schedule
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-serif mt-1">
              प्रमुख महोत्सव कार्यक्रम (Key Programs)
            </h3>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-200 transition-colors"
          >
            <span>सभी कार्यक्रम देखें (View All)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {festivalYear?.events?.map((event: any) => (
            <div key={event.id} className="festive-card p-6 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {event.category?.nameHindi || event.category?.name || 'कार्यक्रम'}
                  </span>
                  <span className="text-xs text-amber-200/70 font-medium">
                    {formatDate(event.date)}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                  {event.titleHindi || event.title}
                </h4>

                <p className="text-xs sm:text-sm text-stone-400 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                <div className="space-y-1.5 text-xs text-stone-300 pt-2 border-t border-amber-900/40">
                  {event.startTime && (
                    <div className="flex items-center gap-2 text-amber-200">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>समय: {event.startTime} - {event.endTime || 'समाप्ति तक'}</span>
                    </div>
                  )}
                  {event.venue && (
                    <div className="flex items-center gap-2 text-stone-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{event.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-amber-900/30 flex items-center justify-between">
                <Link
                  href="/register"
                  className="text-xs font-bold text-amber-400 hover:text-amber-200 underline"
                >
                  भाग लें / पंजीकरण
                </Link>
                <Link
                  href="/events"
                  className="text-xs text-stone-400 hover:text-white flex items-center gap-1"
                >
                  <span>विवरण</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STUDENT ACHIEVERS RECOGNITION WALL PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-maroon-950/80 to-[#120303] border border-amber-600/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b border-amber-900/50 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                  Pratibha Samman 2026
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-serif mt-1">
                परोरा के गौरव: मेधावी छात्र सम्मान
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                दसवीं, बारहवीं, सरकारी नौकरी एवं खेलकूद में उत्कृष्ट प्रदर्शन करने वाले हमारे गांव के होनहार
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/achievers"
                className="festive-btn-gold text-xs px-4 py-2 font-bold"
              >
                छात्र पंजीकरण करें
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {festivalYear?.studentAchievements?.map((student: any) => (
              <div
                key={student.id}
                className="bg-black/50 border border-amber-500/30 rounded-2xl p-5 hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      {student.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-bold text-amber-400 font-mono">
                      {student.yearOfPassing}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-100 text-base">{student.studentName}</h4>
                    <p className="text-xs text-stone-400">{student.village}</p>
                  </div>

                  <div className="bg-maroon-950/70 border border-amber-900/60 rounded-xl p-2.5 text-xs">
                    <div className="text-stone-300 font-medium">{student.examOrCompetitionName}</div>
                    <div className="text-amber-300 font-bold mt-1 text-sm">{student.marksPercentageOrRank}</div>
                  </div>
                </div>

                {student.prizeAssigned && (
                  <div className="mt-4 pt-3 border-t border-amber-900/40 text-[11px] text-amber-200/90 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{student.prizeAssigned}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/achievers"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-200 transition-colors"
            >
              <span>सम्पूर्ण मेधावी छात्र सूची एवं आवेदन देखें</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SPONSOR & DONOR WALL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2">
            <DiyaAnimation size="sm" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              Devotees & Patrons
            </span>
            <DiyaAnimation size="sm" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-serif">
            मुख्य प्रायोजक एवं सहयोगी दानदाता
          </h3>
          <p className="text-xs sm:text-sm text-stone-400">
            माँ काली के पावन महोत्सव को भव्यता प्रदान करने वाले हमारे सम्मानीय भामाशाह एवं ग्रामवासी
          </p>
        </div>

        {/* Sponsor Tier Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {festivalYear?.sponsors?.map((sp: any) => (
            <div
              key={sp.id}
              className="bg-gradient-to-b from-maroon-950/80 to-black/70 border border-amber-500/40 rounded-2xl p-6 text-center space-y-3 relative overflow-hidden group hover:border-amber-400 transition-all shadow-md"
            >
              <div className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                {sp.sponsorTier} SPONSOR
              </div>
              <h4 className="text-base sm:text-lg font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                {sp.name}
              </h4>
              {sp.brandName && (
                <p className="text-xs text-amber-200/80 font-medium">{sp.brandName}</p>
              )}
              {sp.isAmountPublic && sp.contributionAmount && (
                <div className="text-lg font-extrabold text-amber-300 font-mono">
                  {formatINR(sp.contributionAmount)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recent Public Donors Scroll */}
        <div className="bg-maroon-950/50 border border-amber-600/30 rounded-2xl p-6 text-center">
          <h4 className="text-sm font-bold text-amber-300 mb-4 flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>शुभकामनाएं एवं सहयोग राशि (Devotee Offerings)</span>
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {festivalYear?.donations?.map((don: any) => (
              <div
                key={don.id}
                className="bg-black/60 border border-amber-500/20 rounded-full px-4 py-2 flex items-center gap-3 text-xs"
              >
                <span className="font-semibold text-stone-200">{don.donorName}</span>
                <span className="font-bold text-amber-300 font-mono">{formatINR(don.amount)}</span>
                <span className="text-[10px] text-stone-400">({don.purpose || 'दान'})</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/donations"
              className="festive-btn-gold text-xs px-6 py-2.5 inline-flex items-center gap-2"
            >
              <span>सहयोग राशि प्रदान करें एवं रसीद प्राप्त करें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* INTERACTIVE ENGAGEMENT: QUIZ, VOTE, SHARE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="festive-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-amber-300">परोरा महोत्सव क्विज (Festival Quiz)</h4>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                परोरा के इतिहास, माँ काली मंदिर परंपरा और कबड्डी नियमों से जुड़े 5 रोचक प्रश्नों के उत्तर दें और डिजिटल विजेता प्रमाणपत्र पाएं!
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-amber-900/40">
              <Link href="/quiz" className="festive-btn-gold text-xs py-2 px-4 block text-center">
                क्विज खेलें (Start Quiz)
              </Link>
            </div>
          </div>

          <div className="festive-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
                <Vote className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-amber-300">जनता की पसंद (Audience Choice)</h4>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                इस वर्ष के सर्वश्रेष्ठ सांस्कृतिक कार्यक्रम, सर्वश्रेष्ठ कबड्डी रेडर और सुंदर पंडाल सज्जा हेतु अपना मत दर्ज करें।
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-amber-900/40">
              <Link href="/vote" className="festive-btn-red text-xs py-2 px-4 block text-center">
                वोट करें (Cast Vote)
              </Link>
            </div>
          </div>

          <div className="festive-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <ExternalLink className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-amber-300">आमंत्रण पत्र साझा करें</h4>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                अपने मित्रों, रिश्तेदारों एवं ग्रामवासियों को WhatsApp पर काली पूजा महोत्सव 2026 का आमंत्रण पत्र भेजें।
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-amber-900/40 flex items-center justify-center">
              <WhatsAppShareButton />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

