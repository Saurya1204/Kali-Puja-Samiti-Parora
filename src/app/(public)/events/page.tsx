import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import { formatDate } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Trophy,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const selectedCategory = searchParams?.category;
  let categories: any[] = [];
  let events: any[] = [];
  let activeYear: any = null;

  try {
    categories = await prisma.eventCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    activeYear = await prisma.festivalYear.findFirst({
      where: { isActive: true },
    });

    events = await prisma.event.findMany({
      where: {
        isPublished: true,
        ...(activeYear ? { festivalYearId: activeYear.id } : {}),
        ...(selectedCategory ? { category: { slug: selectedCategory } } : {}),
      },
      include: {
        category: true,
        festivalYear: true,
      },
      orderBy: { date: 'asc' },
    });
  } catch (err) {
    console.error('Error loading events:', err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2">
          <DiyaAnimation size="sm" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            Festival Timeline & Calendar
          </span>
          <DiyaAnimation size="sm" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-amber-300 font-serif">
          महोत्सव कार्यक्रम एवं समय-सारणी
        </h1>
        <p className="text-sm sm:text-base text-stone-300">
          श्री श्री 108 काली पूजा महोत्सव {activeYear?.year || 2026} के अंतर्गत आयोजित होने वाले समस्त धार्मिक अनुष्ठान, खेलकूद, कबड्डी व सांस्कृतिक प्रतियोगिताओं की आधिकारिक सूची।
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
        <Link
          href="/events"
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            !selectedCategory
              ? 'bg-amber-500 text-maroon-950 shadow-md shadow-amber-500/20'
              : 'bg-maroon-900/60 text-stone-300 hover:bg-maroon-800 border border-amber-600/30'
          }`}
        >
          सभी कार्यक्रम (All Events)
        </Link>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.slug;
          return (
            <Link
              key={cat.id}
              href={`/events?category=${cat.slug}`}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-500 text-maroon-950 shadow-md shadow-amber-500/20'
                  : 'bg-maroon-900/60 text-stone-300 hover:bg-maroon-800 border border-amber-600/30'
              }`}
            >
              {cat.nameHindi || cat.name}
            </Link>
          );
        })}
      </div>

      {/* Events Timeline / Grid View */}
      {events.length === 0 ? (
        <div className="bg-maroon-950/60 border border-amber-600/30 rounded-2xl p-12 text-center text-stone-400">
          <p className="text-base">इस श्रेणी में अभी कोई कार्यक्रम निर्धारित नहीं है।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((ev, index) => (
            <div
              key={ev.id}
              className="festive-card p-6 sm:p-8 flex flex-col justify-between relative group hover:border-amber-400 transition-all"
            >
              <div className="space-y-4">
                {/* Top Badge & Date */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {ev.category.nameHindi || ev.category.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-amber-200/90 font-semibold bg-black/40 px-3 py-1 rounded-full border border-amber-900/60">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{formatDate(ev.date)}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-amber-200 group-hover:text-amber-300 transition-colors">
                  {ev.titleHindi || ev.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-stone-300 leading-relaxed">{ev.description}</p>

                {/* Time & Venue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300 bg-black/30 p-3 rounded-xl border border-amber-900/40">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {ev.startTime ? `${ev.startTime} - ${ev.endTime || 'समाप्ति तक'}` : 'समय शीघ्र घोषित'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{ev.venue || 'परोरा, बेगूसराय (851217)'}</span>
                  </div>
                </div>

                {/* Rules & Prizes (if present) */}
                {ev.prizeDetails && (
                  <div className="text-xs bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-200 flex items-start gap-2">
                    <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-300">पुरस्कार विवरण:</strong>
                      <span>{ev.prizeDetails}</span>
                    </div>
                  </div>
                )}

                {ev.rules && (
                  <div className="text-xs text-stone-400 flex items-start gap-2 bg-maroon-900/30 p-3 rounded-xl">
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-300">नियम व शर्तें:</strong>
                      <span>{ev.rules}</span>
                    </div>
                  </div>
                )}

                {/* Organizer Contact */}
                {ev.organizerName && (
                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-2 border-t border-amber-900/40">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>संयोजक: {ev.organizerName}</span>
                    </div>
                    {ev.organizerContact && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <a href={`tel:${ev.organizerContact}`} className="hover:text-amber-300">
                          {ev.organizerContact}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-6 mt-6 border-t border-amber-900/40 flex items-center justify-between">
                <Link
                  href="/register"
                  className="festive-btn-gold text-xs px-5 py-2.5 flex items-center gap-2 font-bold"
                >
                  <span>इस प्रतियोगिता में भाग लें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-xs text-stone-400">
                  स्थिति: <strong className="text-amber-400">{ev.status}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

