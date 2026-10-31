import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import { formatDateTime } from '@/lib/utils';
import {
  Trophy,
  Users,
  ShieldCheck,
  Flame,
  ArrowRight,
  Medal,
  Award,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function KabaddiPage() {
  const activeYear = await prisma.festivalYear.findFirst({
    where: { isActive: true },
  });

  const teams = await prisma.kabaddiTeam.findMany({
    where: activeYear ? { festivalYearId: activeYear.id } : {},
    include: { players: true },
    orderBy: [{ points: 'desc' }, { matchesWon: 'desc' }],
  });

  const matches = await prisma.kabaddiMatch.findMany({
    where: activeYear ? { festivalYearId: activeYear.id } : {},
    include: {
      teamA: true,
      teamB: true,
    },
    orderBy: [{ status: 'asc' }, { matchNumber: 'asc' }],
  });

  const liveMatches = matches.filter((m) => m.status === 'LIVE');
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED');
  const upcomingMatches = matches.filter((m) => m.status === 'SCHEDULED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <DiyaAnimation size="sm" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            State Level Tournament
          </span>
          <DiyaAnimation size="sm" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-amber-300 font-serif">
          अखिल बिहार राज्यस्तरीय आमंत्रण कबड्डी प्रतियोगिता {activeYear?.year || 2026}
        </h1>
        <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
          बिहार के 16 शीर्ष क्लब एवं ग्रामीण टीमों के मध्य मैट पर रोमांचक महामुकाबला। लाइव स्कोरबोर्ड, मैच परिणाम, अंक तालिका एवं टीम विवरण।
        </p>

        {/* Prize Pool Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-2xl mx-auto">
          <div className="bg-gradient-to-b from-amber-500/20 to-maroon-950/80 border border-amber-500/40 rounded-xl p-4 text-center">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <div className="text-xs text-amber-200 font-bold uppercase">विजेता (Champion)</div>
            <div className="text-xl font-extrabold text-amber-300 font-mono mt-1">₹25,000 + शील्ड</div>
          </div>
          <div className="bg-gradient-to-b from-stone-500/20 to-maroon-950/80 border border-stone-400/40 rounded-xl p-4 text-center">
            <Medal className="w-6 h-6 text-stone-300 mx-auto mb-1" />
            <div className="text-xs text-stone-200 font-bold uppercase">उपविजेता (Runner Up)</div>
            <div className="text-xl font-extrabold text-stone-200 font-mono mt-1">₹15,000 + शील्ड</div>
          </div>
          <div className="bg-gradient-to-b from-amber-600/20 to-maroon-950/80 border border-amber-600/40 rounded-xl p-4 text-center">
            <Award className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <div className="text-xs text-amber-300 font-bold uppercase">मैन ऑफ द सीरीज</div>
            <div className="text-xl font-extrabold text-amber-400 font-mono mt-1">₹3,100 + ट्रॉफी</div>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/register?type=KABADDI"
            className="festive-btn-gold text-sm px-6 py-2.5 inline-flex items-center gap-2 font-bold"
          >
            <Users className="w-4 h-4" />
            <span>टीम का ऑनलाइन पंजीकरण करें (Team Registration)</span>
          </Link>
        </div>
      </div>

      {/* LIVE MATCH SECTION (IF ANY LIVE) */}
      {liveMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <h3 className="text-xl font-extrabold text-amber-300 uppercase tracking-wide">
              लाइव मुकाबला (Live Action)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveMatches.map((m) => (
              <div
                key={m.id}
                className="bg-gradient-to-br from-red-950/90 via-maroon-950/90 to-black/90 border-2 border-red-500/80 rounded-2xl p-6 shadow-glow-gold relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs text-stone-300 pb-3 border-b border-red-900/60">
                  <span className="font-bold text-red-400 uppercase tracking-wider">
                    {m.stage.replace('_', ' ')} • Match #{m.matchNumber}
                  </span>
                  <span>{m.venue || 'Floodlit Arena, Parora'}</span>
                </div>

                <div className="py-6 flex items-center justify-around">
                  <div className="text-center space-y-1">
                    <h4 className="text-lg sm:text-xl font-bold text-stone-100">{m.teamA.teamName}</h4>
                    <span className="text-xs text-stone-400">{m.teamA.villageOrClub}</span>
                    <div className="text-4xl sm:text-5xl font-extrabold text-amber-300 font-mono mt-2">
                      {m.teamAScore}
                    </div>
                  </div>

                  <div className="text-center px-4">
                    <span className="text-2xl font-bold text-red-400 animate-pulse">VS</span>
                    <div className="text-[11px] font-bold text-red-400 uppercase tracking-widest mt-1">
                      LIVE
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <h4 className="text-lg sm:text-xl font-bold text-stone-100">{m.teamB.teamName}</h4>
                    <span className="text-xs text-stone-400">{m.teamB.villageOrClub}</span>
                    <div className="text-4xl sm:text-5xl font-extrabold text-amber-300 font-mono mt-2">
                      {m.teamBScore}
                    </div>
                  </div>
                </div>

                {m.commentary && (
                  <div className="bg-black/60 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200/90">
                    <strong className="text-amber-400">लाइव कमेंट्री: </strong>
                    <span>{m.commentary}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POINTS TABLE */}
      <div className="festive-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-900/50 pb-4">
          <div>
            <h3 className="text-2xl font-extrabold text-amber-300 font-serif flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>अंक तालिका (Points Table)</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              जीत = 2 अंक, ड्रॉ = 1 अंक, हार = 0 अंक
            </p>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
            कुल टीमें: {teams.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-amber-900/60 text-amber-400 text-xs uppercase tracking-wider bg-black/30">
                <th className="py-3 px-3">रैंक</th>
                <th className="py-3 px-3">टीम (Team)</th>
                <th className="py-3 px-3 text-center">मैच (P)</th>
                <th className="py-3 px-3 text-center">जीत (W)</th>
                <th className="py-3 px-3 text-center">हार (L)</th>
                <th className="py-3 px-3 text-center font-bold">कुल अंक (PTS)</th>
                <th className="py-3 px-3 text-center">स्थिति (Status)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60">
              {teams.map((t, index) => (
                <tr
                  key={t.id}
                  className={`hover:bg-amber-500/5 transition-colors ${
                    index < 4 ? 'bg-amber-500/5 font-semibold' : ''
                  }`}
                >
                  <td className="py-3.5 px-3 font-mono text-amber-400">{index + 1}</td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-stone-100">{t.teamName}</div>
                    <div className="text-[11px] text-stone-400">
                      कप्तान: {t.captainName} ({t.villageOrClub})
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono">{t.matchesPlayed}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-emerald-400">{t.matchesWon}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-red-400">{t.matchesLost}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-base font-extrabold text-amber-300">
                    {t.points}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'WINNER'
                          ? 'bg-amber-500 text-maroon-950'
                          : t.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MATCH FIXTURES & RESULTS */}
      <div className="space-y-6">
        <h3 className="text-2xl font-extrabold text-amber-300 font-serif border-b border-amber-900/50 pb-3">
          मैच परिणाम एवं आगामी फिक्सचर्स (Fixtures & Results)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div key={match.id} className="festive-card p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-400 pb-2 border-b border-amber-900/40">
                <span className="font-bold text-amber-400 uppercase">
                  {match.stage.replace('_', ' ')} • Match #{match.matchNumber}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    match.status === 'COMPLETED'
                      ? 'bg-stone-800 text-stone-300'
                      : match.status === 'LIVE'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {match.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-100">{match.teamA.teamName}</span>
                  <span className="text-xl font-extrabold text-amber-300 font-mono">
                    {match.teamAScore}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-100">{match.teamB.teamName}</span>
                  <span className="text-xl font-extrabold text-amber-300 font-mono">
                    {match.teamBScore}
                  </span>
                </div>
              </div>

              {match.status === 'COMPLETED' && (
                <div className="pt-2 border-t border-amber-900/40 text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>
                    विजेता:{' '}
                    {match.winnerId === match.teamAId
                      ? match.teamA.teamName
                      : match.winnerId === match.teamBId
                      ? match.teamB.teamName
                      : 'मैच टाई'}
                  </span>
                </div>
              )}

              {match.scheduledTime && match.status === 'SCHEDULED' && (
                <div className="pt-2 border-t border-amber-900/40 text-xs text-stone-400">
                  समय: {formatDateTime(match.scheduledTime)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* TOURNAMENT RULES */}
      <div className="bg-black/40 border border-amber-900/60 rounded-2xl p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-stone-300">
        <h4 className="font-bold text-amber-300 text-base sm:text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span>प्रतियोगिता नियम एवं आचार संहिता (AKFI Regulations)</span>
        </h4>
        <ul className="list-disc list-inside space-y-2 text-stone-400 leading-relaxed">
          <li>मैच अधिकृत AKFI मैट पर 20-5-20 मिनट की दो अवधियों में खेला जाएगा।</li>
          <li>प्रत्येक टीम में 10 खिलाड़ी (7 प्लेइंग + 3 सब्स्टीट्यूट) का दल अनुमन्य होगा।</li>
          <li>सभी खिलाड़ियों के पास आधार कार्ड या आयु/पहचान पत्र होना अनिवार्य है।</li>
          <li>अंपायर और रेफरी का निर्णय सर्वोपरि एवं अंतिम होगा। अनुशासनहीनता पर टीम को अयोग्य घोषित किया जा सकता है।</li>
          <li>विजेता एवं उपविजेता टीमों को 10 नवंबर की संध्या में मुख्य मंच से सम्मानित किया जाएगा।</li>
        </ul>
      </div>
    </div>
  );
}

