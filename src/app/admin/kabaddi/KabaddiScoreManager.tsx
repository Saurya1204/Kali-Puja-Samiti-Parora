'use client';

import React, { useState } from 'react';
import { Trophy, Flame, Play, CheckCircle2, RefreshCw, Send, ShieldCheck, Users } from 'lucide-react';

interface Team {
  id: string;
  teamName: string;
  villageOrClub?: string | null;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
}

interface Match {
  id: string;
  matchNumber: number;
  stage: string;
  teamAId: string;
  teamBId: string;
  teamAScore: number;
  teamBScore: number;
  status: string;
  winnerId?: string | null;
  commentary?: string | null;
  venue?: string | null;
  teamA: Team;
  teamB: Team;
}

export default function KabaddiScoreManager({
  initialMatches,
  teams,
  festivalYear,
}: {
  initialMatches: Match[];
  teams: Team[];
  festivalYear: number;
}) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [selectedMatch, setSelectedMatch] = useState<Match>(initialMatches[0] || null);
  const [commentaryText, setCommentaryText] = useState(selectedMatch?.commentary || '');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const updateScore = async (
    matchId: string,
    newScoreA: number,
    newScoreB: number,
    status = selectedMatch.status,
    commentary = commentaryText,
    winnerId = selectedMatch.winnerId
  ) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/kabaddi/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          teamAScore: newScoreA,
          teamBScore: newScoreB,
          status,
          commentary,
          winnerId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'अपडेट विफल रहा');

      const updated = matches.map((m) => (m.id === matchId ? { ...m, ...data.match } : m));
      setMatches(updated);
      setSelectedMatch((prev) => ({ ...prev, ...data.match }));
      setFeedback('लाइव स्कोर एवं कमेंट्री पब्लिक वेबसाइट पर तत्काल अपडेट हो गई!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPointsA = (pts: number) => {
    if (!selectedMatch) return;
    updateScore(selectedMatch.id, selectedMatch.teamAScore + pts, selectedMatch.teamBScore);
  };

  const addPointsB = (pts: number) => {
    if (!selectedMatch) return;
    updateScore(selectedMatch.id, selectedMatch.teamAScore, selectedMatch.teamBScore + pts);
  };

  const endMatch = (winnerTeamId: string) => {
    if (!confirm('क्या आप मैच समाप्त कर विजेता घोषित करना चाहते हैं? इससे अंक तालिका स्वतः अपडेट हो जाएगी।')) return;
    updateScore(
      selectedMatch.id,
      selectedMatch.teamAScore,
      selectedMatch.teamBScore,
      'COMPLETED',
      `Match ended. Champion: ${winnerTeamId === selectedMatch.teamAId ? selectedMatch.teamA.teamName : selectedMatch.teamB.teamName}`,
      winnerTeamId
    );
  };

  const setLive = () => {
    updateScore(selectedMatch.id, selectedMatch.teamAScore, selectedMatch.teamBScore, 'LIVE', 'Match started live on court.');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-amber-900/40 pb-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
          Kabaddi Arena Live Operations
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
          कबड्डी लाइव स्कोर एवं मैच कंट्रोलर ({festivalYear})
        </h1>
        <p className="text-xs text-stone-400 mt-0.5">
          कोर्ट से 1-क्लिक स्कोर अपडेशन, सुपर टैकल, ऑल-आउट, लाइव कमेंट्री एवं अंक तालिका
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Match Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {matches.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setSelectedMatch(m);
              setCommentaryText(m.commentary || '');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedMatch?.id === m.id
                ? 'bg-amber-500 text-maroon-950 shadow-md font-extrabold'
                : 'bg-black/50 text-stone-300 hover:bg-maroon-900 border border-amber-900/50'
            }`}
          >
            {m.status === 'LIVE' && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
            <span>
              #{m.matchNumber}: {m.teamA.teamName} vs {m.teamB.teamName}
            </span>
          </button>
        ))}
      </div>

      {/* LIVE CONTROLLER CONSOLE */}
      {selectedMatch && (
        <div className="bg-gradient-to-br from-red-950/80 via-black to-maroon-950 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/50 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Match #{selectedMatch.matchNumber} • {selectedMatch.stage.replace('_', ' ')}
              </span>
              <h2 className="text-xl font-bold text-white">
                {selectedMatch.teamA.teamName} बनाम {selectedMatch.teamB.teamName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  selectedMatch.status === 'LIVE'
                    ? 'bg-red-600 text-white animate-pulse'
                    : selectedMatch.status === 'COMPLETED'
                    ? 'bg-stone-800 text-stone-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {selectedMatch.status}
              </span>
              {selectedMatch.status !== 'LIVE' && (
                <button
                  onClick={setLive}
                  className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>लाइव करें</span>
                </button>
              )}
            </div>
          </div>

          {/* DUAL TEAMS SCOREBOARD & BUTTONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Team A Console */}
            <div className="bg-black/60 border border-amber-500/40 rounded-2xl p-6 text-center space-y-4">
              <h3 className="text-lg font-extrabold text-amber-300">
                {selectedMatch.teamA.teamName}
              </h3>
              <div className="text-6xl font-extrabold text-amber-400 font-mono">
                {selectedMatch.teamAScore}
              </div>

              {/* Instant Point Buttons for Team A */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => addPointsA(1)}
                  disabled={loading}
                  className="bg-amber-600 hover:bg-amber-500 text-maroon-950 font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  +1 रेड अंक
                </button>
                <button
                  onClick={() => addPointsA(2)}
                  disabled={loading}
                  className="bg-amber-700 hover:bg-amber-600 text-amber-100 font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  +2 टैकल अंक
                </button>
                <button
                  onClick={() => addPointsA(2)}
                  disabled={loading}
                  className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  +2 ऑल-आउट
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => endMatch(selectedMatch.teamAId)}
                  className="w-full bg-emerald-950 border border-emerald-500/50 hover:bg-emerald-900 text-emerald-200 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  विजेता घोषित करें (Declare Winner)
                </button>
              </div>
            </div>

            {/* Team B Console */}
            <div className="bg-black/60 border border-amber-500/40 rounded-2xl p-6 text-center space-y-4">
              <h3 className="text-lg font-extrabold text-amber-300">
                {selectedMatch.teamB.teamName}
              </h3>
              <div className="text-6xl font-extrabold text-amber-400 font-mono">
                {selectedMatch.teamBScore}
              </div>

              {/* Instant Point Buttons for Team B */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => addPointsB(1)}
                  disabled={loading}
                  className="bg-amber-600 hover:bg-amber-500 text-maroon-950 font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  +1 रेड अंक
                </button>
                <button
                  onClick={() => addPointsB(2)}
                  disabled={loading}
                  className="bg-amber-700 hover:bg-amber-600 text-amber-100 font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  +2 टैकल अंक
                </button>
                <button
                  onClick={() => addPointsB(2)}
                  disabled={loading}
                  className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  +2 ऑल-आउट
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => endMatch(selectedMatch.teamBId)}
                  className="w-full bg-emerald-950 border border-emerald-500/50 hover:bg-emerald-900 text-emerald-200 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  विजेता घोषित करें (Declare Winner)
                </button>
              </div>
            </div>
          </div>

          {/* Live Commentary Updater */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span>लाइव कमेंट्री फीड (Live Commentary Broadcast)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="उदा. परोरा टाइगर्स के रेडर ने 3-पॉइंट सुपर रेड लगाई!"
                value={commentaryText}
                onChange={(e) => setCommentaryText(e.target.value)}
                className="flex-1 bg-black/60 border border-amber-700/50 rounded-xl px-4 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() =>
                  updateScore(
                    selectedMatch.id,
                    selectedMatch.teamAScore,
                    selectedMatch.teamBScore,
                    selectedMatch.status,
                    commentaryText
                  )
                }
                disabled={loading}
                className="festive-btn-gold text-xs px-5 py-2 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>अपडेट करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POINTS TABLE PREVIEW */}
      <div className="festive-card p-6 space-y-4">
        <h3 className="font-bold text-amber-300 text-base flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>अद्यतन अंक तालिका (Tournament Standings)</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-black/40 text-amber-400 uppercase font-mono">
                <th className="py-2.5 px-3">टीम (Team)</th>
                <th className="py-2.5 px-3 text-center">मैच (P)</th>
                <th className="py-2.5 px-3 text-center">जीत (W)</th>
                <th className="py-2.5 px-3 text-center">हार (L)</th>
                <th className="py-2.5 px-3 text-center font-bold">अंक (PTS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/50 text-stone-300">
              {teams.map((t) => (
                <tr key={t.id} className="hover:bg-amber-500/5">
                  <td className="py-2.5 px-3 font-semibold text-stone-100">{t.teamName}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{t.matchesPlayed}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-emerald-400">{t.matchesWon}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-red-400">{t.matchesLost}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-extrabold text-amber-300 text-sm">
                    {t.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
