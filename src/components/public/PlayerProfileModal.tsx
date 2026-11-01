'use client';

import React from 'react';
import {
  Trophy,
  X,
  Shield,
  Zap,
  Award,
  Flame,
  User,
  MapPin,
  Scale,
  Ruler,
  Phone,
  Heart,
} from 'lucide-react';

export interface PlayerData {
  id: string;
  name: string;
  jerseyNumber?: number | null;
  role: string;
  isCaptain?: boolean;
  phone?: string | null;
  photoUrl?: string | null;
  villageOrDistrict?: string | null;
  skills?: string | null;
  achievements?: string | null;
  bio?: string | null;
  weight?: string | null;
  height?: string | null;
  age?: number | null;
  matchesPlayed?: number;
  raidPoints?: number;
  tacklePoints?: number;
  superRaids?: number;
  superTackles?: number;
  team?: {
    teamName: string;
    villageOrClub?: string | null;
  } | null;
}

interface PlayerProfileModalProps {
  player: PlayerData | null;
  onClose: () => void;
}

export default function PlayerProfileModal({
  player,
  onClose,
}: PlayerProfileModalProps) {
  if (!player) return null;

  const roleMeta = {
    RAIDER: { label: 'रेडर (Raider)', color: 'bg-red-500/20 text-red-300 border-red-500/40', icon: Zap },
    DEFENDER: { label: 'डिफेंडर (Defender)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: Shield },
    ALL_ROUNDER: { label: 'ऑल राउंडर (All-Rounder)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Flame },
  }[player.role] || { label: player.role, color: 'bg-stone-800 text-stone-200 border-stone-700', icon: Trophy };

  const RoleIcon = roleMeta.icon;

  const skillsList = player.skills
    ? player.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : ['रनिंग हैंड टच', 'डुबकी स्पेशलिस्ट', 'सुपर टैकल', 'चेन ब्लॉक'];

  const achievementsList = player.achievements
    ? player.achievements.split(';').map((a) => a.trim()).filter(Boolean)
    : [
        'बिहार राज्य आमंत्रण कबड्डी प्रतियोगिता 2024 उत्कृष्ट प्रदर्शन',
        'परौरा कबड्डी अखाड़ा सर्वश्रेष्ठ उभरते खिलाड़ी',
      ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-gradient-to-b from-maroon-950 via-[#180404] to-black border-2 border-amber-500/60 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Decorative Top Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-red-900 border border-amber-500/40 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
          aria-label="बंद करें"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero with Player Photo and Jersey */}
        <div className="p-6 sm:p-7 relative overflow-hidden border-b border-amber-900/40 bg-gradient-to-r from-black/80 via-maroon-950/60 to-black/80">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Player Photo Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl bg-maroon-900 flex items-center justify-center">
                {player.photoUrl ? (
                  <img
                    src={player.photoUrl}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-amber-300">
                    <User className="w-12 h-12 stroke-[1.5]" />
                    <span className="text-[10px] font-mono mt-0.5">KABADDI</span>
                  </div>
                )}
              </div>

              {/* Jersey Badge */}
              {player.jerseyNumber && (
                <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-maroon-950 font-black font-mono text-sm flex items-center justify-center shadow-lg border-2 border-maroon-950">
                  #{player.jerseyNumber}
                </div>
              )}
            </div>

            {/* Name, Team, and Role */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleMeta.color}`}
                >
                  <RoleIcon className="w-3 h-3" />
                  {roleMeta.label}
                </span>

                {player.isCaptain && (
                  <span className="bg-amber-500 text-maroon-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow">
                    कप्तान (Captain)
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif mt-1.5 leading-tight truncate">
                {player.name}
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 font-semibold mt-0.5">
                {player.team?.teamName || 'परौरा कबड्डी टीम'}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-stone-400 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {player.villageOrDistrict || player.team?.villageOrClub || 'परोरा (बेगूसराय)'}
                </span>
                {player.phone && (
                  <span className="flex items-center gap-1 font-mono text-amber-300">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    {player.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs max-h-[60vh] overflow-y-auto">
          {/* Key Statistics Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
            <div className="bg-black/50 border border-amber-900/40 p-2.5 rounded-xl">
              <span className="text-[10px] text-stone-400 block">कुल मैच</span>
              <span className="text-lg font-bold font-mono text-amber-300">
                {player.matchesPlayed || 0}
              </span>
            </div>
            <div className="bg-red-950/40 border border-red-900/40 p-2.5 rounded-xl">
              <span className="text-[10px] text-red-300 block">रेड अंक</span>
              <span className="text-lg font-bold font-mono text-red-300">
                {player.raidPoints || 0}
              </span>
            </div>
            <div className="bg-blue-950/40 border border-blue-900/40 p-2.5 rounded-xl">
              <span className="text-[10px] text-blue-300 block">टैकल अंक</span>
              <span className="text-lg font-bold font-mono text-blue-300">
                {player.tacklePoints || 0}
              </span>
            </div>
            <div className="bg-purple-950/40 border border-purple-900/40 p-2.5 rounded-xl">
              <span className="text-[10px] text-purple-300 block">सुपर रेड</span>
              <span className="text-lg font-bold font-mono text-purple-300">
                {player.superRaids || 0}
              </span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-900/40 p-2.5 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[10px] text-emerald-300 block">सुपर टैकल</span>
              <span className="text-lg font-bold font-mono text-emerald-300">
                {player.superTackles || 0}
              </span>
            </div>
          </div>

          {/* Physical Metrics */}
          {(player.weight || player.height || player.age) && (
            <div className="flex items-center justify-around bg-black/40 border border-stone-800 p-2.5 rounded-xl text-stone-300">
              {player.weight && (
                <div className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>वजन: <strong className="text-stone-100">{player.weight}</strong></span>
                </div>
              )}
              {player.height && (
                <div className="flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-amber-400" />
                  <span>लंबाई: <strong className="text-stone-100">{player.height}</strong></span>
                </div>
              )}
              {player.age && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>उम्र: <strong className="text-stone-100">{player.age} वर्ष</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Skills Section */}
          <div className="space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Zap className="w-4 h-4 text-amber-400" />
              विशेष कौशल एवं तकनीक (Skills & Techniques)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-amber-500/10 text-amber-200 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-medium"
                >
                  ⚡ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Award className="w-4 h-4 text-amber-400" />
              उपलब्धियां एवं सम्मान (Achievements & Honors)
            </h4>
            <ul className="space-y-1.5">
              {achievementsList.map((ach, idx) => (
                <li
                  key={idx}
                  className="bg-black/50 border border-stone-800 p-2 rounded-xl text-stone-200 flex items-start gap-2"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{ach}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Coach Mentorship Spotlight */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/60 to-maroon-900/60 border border-amber-500/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 flex items-center justify-center font-bold text-sm">
              🏆
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 block">
                गुरु-शिष्य परंपरा • Parora Akhada Mentorship
              </span>
              <p className="text-[11px] text-stone-200 leading-snug">
                बिहार कबड्डी के भीष्म पितामह <strong>श्री अमरनाथ प्रसाद (Amarnath Prasad)</strong> के मार्गदर्शन में प्रशिक्षित।
              </p>
            </div>
          </div>

          {/* Bio / Background */}
          {player.bio && (
            <div className="space-y-1 bg-black/40 p-3 rounded-xl border border-stone-800">
              <span className="font-semibold text-stone-400 block text-[11px]">परिचय व पृष्ठभूमि:</span>
              <p className="text-stone-300 leading-relaxed text-xs">{player.bio}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-900/40 bg-black/60 flex items-center justify-between">
          <span className="text-[11px] text-stone-400 font-mono">
            Kali Puja Samiti Parora • Official Kabaddi Registry
          </span>
          <button
            onClick={onClose}
            className="festive-btn-gold text-xs px-5 py-1.5 cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
}

