'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import PlayerProfileModal, { PlayerData } from '@/components/public/PlayerProfileModal';
import { formatDateTime } from '@/lib/utils';
import {
  Trophy,
  Users,
  ShieldCheck,
  Flame,
  Medal,
  Award,
  Zap,
  MapPin,
  Phone,
  UserCheck,
  Eye,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface TeamWithPlayers {
  id: string;
  teamName: string;
  villageOrClub?: string | null;
  captainName: string;
  captainPhone: string;
  coachName?: string | null;
  status: string;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesTied: number;
  scoreDiff: number;
  players?: PlayerData[];
}

interface MatchItem {
  id: string;
  matchNumber: number;
  stage: string;
  teamAId: string;
  teamBId: string;
  teamAScore: number;
  teamBScore: number;
  status: string;
  winnerId?: string | null;
  scheduledTime?: string | Date | null;
  venue?: string | null;
  commentary?: string | null;
  teamA: { teamName: string };
  teamB: { teamName: string };
}

export default function KabaddiArenaClient({
  teams,
  matches,
  festivalYear,
}: {
  teams: TeamWithPlayers[];
  matches: MatchItem[];
  festivalYear: number;
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [selectedTeamTab, setSelectedTeamTab] = useState<string>(teams[0]?.id || '');

  const liveMatches = matches.filter((m) => m.status === 'LIVE');
  const activeTeam = teams.find((t) => t.id === selectedTeamTab) || teams[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <DiyaAnimation size="sm" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-black/40 px-3 py-1 rounded-full border border-amber-500/30">
            All-Bihar State Level Kabaddi Championship
          </span>
          <DiyaAnimation size="sm" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-amber-200 font-serif leading-tight">
          अखिल बिहार राज्यस्तरीय कबड्डी महाकुंभ {festivalYear}
        </h1>

        <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-3xl mx-auto">
          परौरा की पावन धरा - जो बिहार कबड्डी का गौरवशाली तीर्थ है। 16 शीर्ष आमंत्रित टीमों के मध्य मैट पर खिताबी भिड़ंत।
          खिलाड़ियों के नाम पर क्लिक कर उनका पूरा प्रोफाइल, कौशल एवं उपलब्धियां देखें।
        </p>

        {/* Prize Pool Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 max-w-2xl mx-auto">
          <div className="bg-gradient-to-b from-amber-500/25 to-maroon-950/80 border border-amber-500/50 rounded-2xl p-4 text-center shadow-lg">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <div className="text-xs text-amber-200 font-bold uppercase">विजेता (Champion)</div>
            <div className="text-2xl font-black text-amber-300 font-mono mt-1">₹25,000 + भव्य शील्ड</div>
          </div>

          <div className="bg-gradient-to-b from-stone-500/20 to-maroon-950/80 border border-stone-400/40 rounded-2xl p-4 text-center shadow-lg">
            <Medal className="w-6 h-6 text-stone-300 mx-auto mb-1" />
            <div className="text-xs text-stone-200 font-bold uppercase">उपविजेता (Runner Up)</div>
            <div className="text-2xl font-black text-stone-200 font-mono mt-1">₹15,000 + शील्ड</div>
          </div>

          <div className="bg-gradient-to-b from-red-600/20 to-maroon-950/80 border border-red-500/40 rounded-2xl p-4 text-center shadow-lg">
            <Award className="w-6 h-6 text-orange-400 mx-auto mb-1" />
            <div className="text-xs text-amber-300 font-bold uppercase">सर्वश्रेष्ठ रेडर / कैचर</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">₹3,100 + व्यक्तिगत ट्रॉफी</div>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register?type=KABADDI"
            className="festive-btn-gold text-xs sm:text-sm px-6 py-2.5 inline-flex items-center gap-2 font-bold shadow-lg"
          >
            <Users className="w-4 h-4" />
            <span>टीम का ऑनलाइन पंजीकरण करें (Team Registration)</span>
          </Link>
        </div>
      </div>

      {/* COACH AMARNATH PRASAD TRIBUTE CARD */}
      <div className="bg-gradient-to-r from-red-950/90 via-maroon-950 to-black border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar Icon */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-500 via-red-600 to-maroon-900 p-1 shrink-0 shadow-2xl border-2 border-amber-300/80 flex items-center justify-center">
            <div className="w-full h-full bg-maroon-950 rounded-xl flex flex-col items-center justify-center text-amber-300 text-center p-2">
              <Trophy className="w-8 h-8 text-amber-400 mb-1" />
              <span className="text-[10px] font-mono font-bold leading-tight uppercase">CHIEF MENTOR</span>
            </div>
          </div>

          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>★ भीष्म पितामह • बिहार कबड्डी व खेल संरक्षक</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-amber-200 font-serif">
              श्री अमरनाथ प्रसाद (Shri Amarnath Prasad)
            </h2>

            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-3xl">
              बिहार कबड्डी के शीर्ष प्रशिक्षक जिन्होंने दर्जनों युवाओं को तराशकर राज्य एवं राष्ट्रीय स्तर पर पहचान दिलाई।
              स्वयं बिहार राज्य के पूर्व कबड्डी खिलाड़ी, बिहार राज्य बॉक्सर एवं कराटे ब्लैक बेल्ट धारक।
              परौरा की पहचान पूरे बिहार में कबड्डी की नर्सरी के रूप में स्थापित करने में आपका अतुलनीय योगदान है।
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs">
              <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-300 font-mono font-bold">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <a href="tel:6203510983" className="hover:underline">
                  हेल्पलाइन / संपर्क: 6203510983
                </a>
              </div>
              <span className="text-stone-400 text-xs">
                स्थान: परौरा कबड्डी अखाड़ा एवं उच्च विद्यालय खेल मैदान
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE MATCH SECTION */}
      {liveMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <h3 className="text-xl font-extrabold text-amber-300 uppercase tracking-wide">
              लाइव मुकाबला (Live Action In Progress)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveMatches.map((m) => (
              <div
                key={m.id}
                className="bg-gradient-to-b from-red-950/90 via-maroon-950/95 to-black border-2 border-red-500/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-red-900/60 pb-3 mb-4">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    मैच #{m.matchNumber} • {m.stage.replace('_', ' ')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                    🔴 LIVE ON AIR
                  </span>
                </div>

                <div className="flex items-center justify-between text-center my-4">
                  <div className="flex-1">
                    <h4 className="text-base sm:text-lg font-bold text-stone-100">{m.teamA.teamName}</h4>
                    <span className="text-4xl sm:text-5xl font-mono font-black text-amber-300 block mt-2">
                      {m.teamAScore}
                    </span>
                  </div>
                  <div className="px-3 text-stone-500 font-bold text-sm">VS</div>
                  <div className="flex-1">
                    <h4 className="text-base sm:text-lg font-bold text-stone-100">{m.teamB.teamName}</h4>
                    <span className="text-4xl sm:text-5xl font-mono font-black text-amber-300 block mt-2">
                      {m.teamBScore}
                    </span>
                  </div>
                </div>

                {m.commentary && (
                  <div className="bg-black/50 border border-amber-900/50 p-3 rounded-xl text-xs text-amber-200/90 flex items-center gap-2 mt-2">
                    <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{m.commentary}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TEAMS & PLAYERS ROSTER SECTION WITH MODAL POPUP */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/50 pb-3">
          <div>
            <span className="text-xs font-mono text-amber-400 uppercase font-bold block">
              Participating Teams & Squads
            </span>
            <h3 className="text-2xl font-black text-amber-200 font-serif">
              टीमें एवं खिलाड़ी प्रोफाइल (Click Player to View Profile)
            </h3>
          </div>
          <span className="text-xs text-stone-400">
            किसी भी खिलाड़ी के नाम पर क्लिक कर उनका कौशल, उपलब्धियां एवं परिचय देखें
          </span>
        </div>

        {/* Team Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {teams.map((t) => {
            const isSelected = (activeTeam?.id || '') === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeamTab(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-maroon-950 shadow-lg shadow-amber-500/20'
                    : 'bg-maroon-950/80 text-stone-300 hover:text-amber-200 border border-amber-900/40'
                }`}
              >
                {t.teamName}
              </button>
            );
          })}
        </div>

        {/* Active Team Card & Squad Grid */}
        {activeTeam && (
          <div className="festive-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/40 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold block">
                  {activeTeam.villageOrClub || 'बिहार'}
                </span>
                <h4 className="text-2xl font-bold text-amber-100 font-serif">{activeTeam.teamName}</h4>
              </div>

              <div className="flex items-center gap-4 text-xs text-stone-300">
                <div>
                  कप्तान: <strong className="text-amber-300">{activeTeam.captainName}</strong>
                </div>
                {activeTeam.coachName && (
                  <div>
                    कोच: <strong className="text-stone-100">{activeTeam.coachName}</strong>
                  </div>
                )}
                <div className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-bold">
                  {activeTeam.points} PTS
                </div>
              </div>
            </div>

            {/* Players Grid */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                <span>खिलाड़ियों का दल (Squad Roster - Click for Details)</span>
              </div>

              {(!activeTeam.players || activeTeam.players.length === 0) ? (
                <p className="text-xs text-stone-400 p-4 bg-black/40 rounded-xl">
                  इस टीम के खिलाड़ी सूची सत्यापन प्रक्रिया में है।
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeTeam.players.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlayer({ ...p, team: activeTeam })}
                      className="bg-black/50 hover:bg-maroon-900/40 border border-amber-600/30 hover:border-amber-400 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer group shadow"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Jersey / Avatar */}
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600/40 to-maroon-900 border border-amber-400/60 overflow-hidden shrink-0 flex items-center justify-center font-mono font-bold text-amber-300 text-sm shadow">
                          {p.photoUrl ? (
                            <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>#{p.jerseyNumber || '?'}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-stone-100 text-xs sm:text-sm truncate group-hover:text-amber-300 transition-colors">
                              {p.name}
                            </span>
                            {p.isCaptain && (
                              <span className="text-[9px] bg-amber-500 text-maroon-950 px-1 font-bold rounded">
                                C
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-amber-300/80 font-semibold block">
                            {p.role}
                          </span>
                          <span className="text-[10px] text-stone-400 block truncate">
                            रेड अंक: {p.raidPoints || 0} • टैकल: {p.tacklePoints || 0}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-amber-400 group-hover:translate-x-1 transition-transform">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* TOURNAMENT POINTS TABLE */}
      <div className="space-y-4">
        <h3 className="text-2xl font-extrabold text-amber-300 font-serif border-b border-amber-900/50 pb-3 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <span>अंक तालिका (Live Points Table)</span>
        </h3>

        <div className="bg-maroon-950/40 border border-amber-600/30 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-maroon-950/80 text-amber-300 font-serif border-b border-amber-900/40 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-3">रैंक</th>
                  <th className="py-3.5 px-4">टीम का नाम</th>
                  <th className="py-3.5 px-3 text-center">मैच (P)</th>
                  <th className="py-3.5 px-3 text-center">जीत (W)</th>
                  <th className="py-3.5 px-3 text-center">हार (L)</th>
                  <th className="py-3.5 px-3 text-center font-bold text-amber-300">अंक (PTS)</th>
                  <th className="py-3.5 px-3 text-center">स्थिति</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/20 text-stone-200">
                {teams.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-amber-400">#{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-100">{t.teamName}</div>
                      <div className="text-[10px] text-stone-400">{t.villageOrClub || 'बिहार'}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">{t.matchesPlayed}</td>
                    <td className="py-3.5 px-3 text-center font-mono text-emerald-400 font-bold">{t.matchesWon}</td>
                    <td className="py-3.5 px-3 text-center font-mono text-red-400">{t.matchesLost}</td>
                    <td className="py-3.5 px-3 text-center font-mono text-base font-extrabold text-amber-300">
                      {t.points}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MATCH FIXTURES & RESULTS */}
      <div className="space-y-4">
        <h3 className="text-2xl font-extrabold text-amber-300 font-serif border-b border-amber-900/50 pb-3">
          मैच परिणाम एवं आगामी फिक्सचर्स (Fixtures & Results)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => (
            <div key={match.id} className="festive-card p-4 space-y-3">
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-100 text-xs sm:text-sm">{match.teamA.teamName}</span>
                  <span className="text-xl font-mono font-bold text-amber-300">{match.teamAScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-100 text-xs sm:text-sm">{match.teamB.teamName}</span>
                  <span className="text-xl font-mono font-bold text-amber-300">{match.teamBScore}</span>
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
            </div>
          ))}
        </div>
      </div>

      {/* PLAYER PROFILE MODAL POPUP */}
      {selectedPlayer && (
        <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}

