'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Play,
  CheckCircle2,
  RefreshCw,
  Send,
  ShieldCheck,
  Users,
  PlusCircle,
  Edit2,
  Trash2,
  Calendar,
  X,
  Clock,
  MapPin,
  ChevronRight,
} from 'lucide-react';

interface Team {
  id: string;
  teamName: string;
  villageOrClub?: string | null;
  captainName: string;
  captainPhone: string;
  coachName?: string | null;
  logoUrl?: string | null;
  status: string;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesTied: number;
  scoreDiff: number;
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
  scheduledTime?: string | Date | null;
  teamA: Team;
  teamB: Team;
}

export default function KabaddiScoreManager({
  initialMatches,
  teams: initialTeams,
  festivalYear,
}: {
  initialMatches: Match[];
  teams: Team[];
  festivalYear: number;
}) {
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'MATCHES' | 'TEAMS'>('CONSOLE');
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(initialMatches[0] || null);
  const [commentaryText, setCommentaryText] = useState(initialMatches[0]?.commentary || '');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Match Modal
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [matchForm, setMatchForm] = useState({
    matchNumber: matches.length + 1,
    stage: 'GROUP_STAGE',
    teamAId: teams[0]?.id || '',
    teamBId: teams[1]?.id || '',
    venue: 'हाई स्कूल खेल मैदान, परोरा',
    scheduledTime: '',
    status: 'SCHEDULED',
  });

  // Team Modal
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    villageOrClub: '',
    captainName: '',
    captainPhone: '',
    coachName: '',
    status: 'CONFIRMED',
  });

  // --- SCORE CONSOLE HANDLERS ---
  const updateScore = async (
    matchId: string,
    newScoreA: number,
    newScoreB: number,
    status = selectedMatch?.status || 'SCHEDULED',
    commentary = commentaryText,
    winnerId = selectedMatch?.winnerId
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
      setSelectedMatch(data.match);
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
    if (!selectedMatch) return;
    if (!confirm('क्या आप मैच समाप्त कर विजेता घोषित करना चाहते हैं? इससे अंक तालिका स्वतः अपडेट हो जाएगी।')) return;
    updateScore(
      selectedMatch.id,
      selectedMatch.teamAScore,
      selectedMatch.teamBScore,
      'COMPLETED',
      `मैच समाप्त! विजेता: ${winnerTeamId === selectedMatch.teamAId ? selectedMatch.teamA.teamName : selectedMatch.teamB.teamName}`,
      winnerTeamId
    );
  };

  // --- MATCH CRUD HANDLERS ---
  const openCreateMatch = () => {
    setEditingMatch(null);
    setMatchForm({
      matchNumber: matches.length + 1,
      stage: 'GROUP_STAGE',
      teamAId: teams[0]?.id || '',
      teamBId: teams[1]?.id || '',
      venue: 'हाई स्कूल खेल मैदान, परोरा',
      scheduledTime: '',
      status: 'SCHEDULED',
    });
    setIsMatchModalOpen(true);
  };

  const openEditMatch = (m: Match) => {
    setEditingMatch(m);
    setMatchForm({
      matchNumber: m.matchNumber,
      stage: m.stage,
      teamAId: m.teamAId,
      teamBId: m.teamBId,
      venue: m.venue || 'हाई स्कूल खेल मैदान, परोरा',
      scheduledTime: m.scheduledTime ? new Date(m.scheduledTime).toISOString().slice(0, 16) : '',
      status: m.status,
    });
    setIsMatchModalOpen(true);
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (matchForm.teamAId === matchForm.teamBId) {
      alert('टीम A और टीम B अलग-अलग होनी चाहिए!');
      return;
    }
    setLoading(true);

    try {
      const payload: any = {
        ...matchForm,
        festivalYear,
      };
      if (editingMatch) payload.id = editingMatch.id;

      const res = await fetch('/api/admin/kabaddi/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'मैच सहेजने में विफल');

      if (editingMatch) {
        setMatches(matches.map((m) => (m.id === editingMatch.id ? data.match : m)));
        if (selectedMatch?.id === editingMatch.id) setSelectedMatch(data.match);
        setFeedback('मैच विवरण सफलतापूर्वक अपडेट किया गया!');
      } else {
        setMatches([...matches, data.match]);
        if (!selectedMatch) setSelectedMatch(data.match);
        setFeedback('नया मैच सफलतापूर्वक शेड्यूल किया गया!');
      }

      setIsMatchModalOpen(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (m: Match) => {
    if (!confirm(`क्या आप मैच #${m.matchNumber} (${m.teamA.teamName} vs ${m.teamB.teamName}) को हटाना चाहते हैं?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kabaddi/matches?id=${m.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'हटाने में विफल');

      const remaining = matches.filter((item) => item.id !== m.id);
      setMatches(remaining);
      if (selectedMatch?.id === m.id) setSelectedMatch(remaining[0] || null);
      setFeedback('मैच सफलतापूर्वक हटा दिया गया।');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- TEAM CRUD HANDLERS ---
  const openCreateTeam = () => {
    setEditingTeam(null);
    setTeamForm({
      teamName: '',
      villageOrClub: '',
      captainName: '',
      captainPhone: '',
      coachName: '',
      status: 'CONFIRMED',
    });
    setIsTeamModalOpen(true);
  };

  const openEditTeam = (t: Team) => {
    setEditingTeam(t);
    setTeamForm({
      teamName: t.teamName,
      villageOrClub: t.villageOrClub || '',
      captainName: t.captainName,
      captainPhone: t.captainPhone,
      coachName: t.coachName || '',
      status: t.status,
    });
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        ...teamForm,
        festivalYear,
      };
      if (editingTeam) payload.id = editingTeam.id;

      const res = await fetch('/api/admin/kabaddi/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'टीम सहेजने में विफल');

      if (editingTeam) {
        setTeams(teams.map((t) => (t.id === editingTeam.id ? data.team : t)));
        setFeedback('टीम का विवरण सफलतापूर्वक अपडेट किया गया!');
      } else {
        setTeams([...teams, data.team]);
        setFeedback('नई कबड्डी टीम सफलतापूर्वक पंजीकृत की गई!');
      }

      setIsTeamModalOpen(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (t: Team) => {
    if (!confirm(`क्या आप टीम "${t.teamName}" को हटाना चाहते हैं? इससे संबंधित मैच भी प्रभावित हो सकते हैं।`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kabaddi/teams?id=${t.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'हटाने में विफल');

      setTeams(teams.filter((item) => item.id !== t.id));
      setFeedback('टीम सफलतापूर्वक हटा दी गई।');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            All-Bihar State Level Kabaddi Championship
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400" />
            कबड्डी टूर्नामेंट प्रबंधन व लाइव स्कोर (Kabaddi Arena)
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            सत्र {festivalYear} | टीमें, मैच फिक्सचर्स, लाइव रेड/टैकल स्कोरिंग एवं अंक तालिका का पूर्ण नियंत्रण
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-amber-500/30 text-xs">
          <button
            onClick={() => setActiveTab('CONSOLE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'CONSOLE'
                ? 'bg-amber-500 text-maroon-950 shadow'
                : 'text-stone-300 hover:text-amber-300'
            }`}
          >
            🔴 लाइव स्कोर कंसोल
          </button>
          <button
            onClick={() => setActiveTab('MATCHES')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'MATCHES'
                ? 'bg-amber-500 text-maroon-950 shadow'
                : 'text-stone-300 hover:text-amber-300'
            }`}
          >
            📅 मैच शेड्यूल ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('TEAMS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'TEAMS'
                ? 'bg-amber-500 text-maroon-950 shadow'
                : 'text-stone-300 hover:text-amber-300'
            }`}
          >
            🛡️ टीमें व अंक तालिका ({teams.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* --- TAB 1: LIVE SCORE CONSOLE --- */}
      {activeTab === 'CONSOLE' && (
        <>
          {matches.length === 0 ? (
            <div className="text-center p-12 bg-maroon-950/40 border border-amber-900/30 rounded-2xl">
              <Trophy className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <h3 className="text-stone-300 font-bold mb-1">कोई मैच शेड्यूल नहीं है</h3>
              <p className="text-xs text-stone-500 mb-4">स्कोरिंग शुरू करने से पहले नया मैच शेड्यूल करें।</p>
              <button onClick={openCreateMatch} className="festive-btn-gold text-xs">
                नया मैच जोड़ें (Schedule Match)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Match Selector List */}
              <div className="lg:col-span-1 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300 border-b border-amber-900/40 pb-2">
                  <span>मैच चुनें (Select Match)</span>
                  <button
                    onClick={openCreateMatch}
                    className="text-amber-400 hover:text-amber-200 flex items-center gap-1 font-semibold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    नया मैच
                  </button>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMatch(m);
                        setCommentaryText(m.commentary || '');
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedMatch?.id === m.id
                          ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400'
                          : 'bg-maroon-950/50 border-amber-900/40 hover:border-amber-600/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                        <span className="font-bold text-amber-400 font-mono">
                          मैच #{m.matchNumber} ({m.stage.replace('_', ' ')})
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            m.status === 'LIVE'
                              ? 'bg-red-600 text-white animate-pulse'
                              : m.status === 'COMPLETED'
                              ? 'bg-emerald-900/60 text-emerald-300'
                              : 'bg-stone-800 text-stone-300'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-stone-100">
                        <span className="truncate max-w-[100px]">{m.teamA.teamName}</span>
                        <span className="font-mono text-amber-300 px-2 py-0.5 bg-black/50 rounded">
                          {m.teamAScore} - {m.teamBScore}
                        </span>
                        <span className="truncate max-w-[100px] text-right">{m.teamB.teamName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Scoring Console */}
              {selectedMatch && (
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-gradient-to-br from-maroon-900/90 via-maroon-950/95 to-black border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-500/30">
                      <div>
                        <span className="text-xs font-mono text-amber-400 font-bold block">
                          मैच #{selectedMatch.matchNumber} • {selectedMatch.stage.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          {selectedMatch.venue || 'हाई स्कूल खेल मैदान, परोरा'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedMatch.status !== 'LIVE' && (
                          <button
                            onClick={() => updateScore(selectedMatch.id, selectedMatch.teamAScore, selectedMatch.teamBScore, 'LIVE')}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition-all"
                          >
                            <Play className="w-3.5 h-3.5" /> लाइव शुरू करें
                          </button>
                        )}
                        {selectedMatch.status === 'LIVE' && (
                          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
                            🔴 LIVE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Big Scoreboard */}
                    <div className="grid grid-cols-2 gap-4 my-6">
                      {/* Team A */}
                      <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-4 text-center">
                        <span className="text-sm font-bold text-stone-200 block truncate">
                          {selectedMatch.teamA.teamName}
                        </span>
                        <span className="text-[10px] text-amber-300/80 block">
                          {selectedMatch.teamA.villageOrClub || 'Team A'}
                        </span>
                        <div className="text-5xl sm:text-6xl font-extrabold text-amber-300 font-mono my-3 tracking-tighter">
                          {selectedMatch.teamAScore}
                        </div>

                        {/* Point Buttons Team A */}
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <button
                            onClick={() => addPointsA(1)}
                            className="bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-maroon-950 font-bold py-2 rounded-xl text-xs transition-all border border-amber-500/40"
                          >
                            +1 रेड
                          </button>
                          <button
                            onClick={() => addPointsA(1)}
                            className="bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white font-bold py-2 rounded-xl text-xs transition-all border border-blue-500/40"
                          >
                            +1 टैकल
                          </button>
                          <button
                            onClick={() => addPointsA(2)}
                            className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white font-bold py-1.5 rounded-xl text-xs transition-all border border-emerald-500/40"
                          >
                            +2 ऑल आउट
                          </button>
                          <button
                            onClick={() => addPointsA(3)}
                            className="bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white font-bold py-1.5 rounded-xl text-xs transition-all border border-purple-500/40"
                          >
                            +3 सुपर रेड
                          </button>
                        </div>
                        <button
                          onClick={() => addPointsA(-1)}
                          className="mt-2 text-[10px] text-stone-500 hover:text-stone-300 underline"
                        >
                          -1 अंक वापस लें (Undo)
                        </button>
                      </div>

                      {/* Team B */}
                      <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-4 text-center">
                        <span className="text-sm font-bold text-stone-200 block truncate">
                          {selectedMatch.teamB.teamName}
                        </span>
                        <span className="text-[10px] text-amber-300/80 block">
                          {selectedMatch.teamB.villageOrClub || 'Team B'}
                        </span>
                        <div className="text-5xl sm:text-6xl font-extrabold text-amber-300 font-mono my-3 tracking-tighter">
                          {selectedMatch.teamBScore}
                        </div>

                        {/* Point Buttons Team B */}
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <button
                            onClick={() => addPointsB(1)}
                            className="bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-maroon-950 font-bold py-2 rounded-xl text-xs transition-all border border-amber-500/40"
                          >
                            +1 रेड
                          </button>
                          <button
                            onClick={() => addPointsB(1)}
                            className="bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white font-bold py-2 rounded-xl text-xs transition-all border border-blue-500/40"
                          >
                            +1 टैकल
                          </button>
                          <button
                            onClick={() => addPointsB(2)}
                            className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white font-bold py-1.5 rounded-xl text-xs transition-all border border-emerald-500/40"
                          >
                            +2 ऑल आउट
                          </button>
                          <button
                            onClick={() => addPointsB(3)}
                            className="bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white font-bold py-1.5 rounded-xl text-xs transition-all border border-purple-500/40"
                          >
                            +3 सुपर रेड
                          </button>
                        </div>
                        <button
                          onClick={() => addPointsB(-1)}
                          className="mt-2 text-[10px] text-stone-500 hover:text-stone-300 underline"
                        >
                          -1 अंक वापस लें (Undo)
                        </button>
                      </div>
                    </div>

                    {/* Live Commentary & Announcer Box */}
                    <div className="bg-black/40 border border-amber-900/50 rounded-2xl p-3.5 space-y-2">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        लाइव कमेंट्री एवं घोषणा (Public Live Feed)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentaryText}
                          onChange={(e) => setCommentaryText(e.target.value)}
                          placeholder="उदा. राहुल ने शानदार सुपर रेड लगाकर 3 अंक बटोरे! परोरा आगे..."
                          className="flex-1 px-3 py-2 bg-maroon-950/80 border border-amber-900/50 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-400"
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
                          className="festive-btn-gold px-4 py-2 text-xs flex items-center gap-1 shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          प्रसारित करें
                        </button>
                      </div>
                    </div>

                    {/* Match Conclusion / Winner Selection */}
                    <div className="mt-4 pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <span className="text-stone-400">
                        विजेता घोषित कर मैच समाप्त करें:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => endMatch(selectedMatch.teamAId)}
                          className="bg-stone-800 hover:bg-emerald-900 text-stone-200 hover:text-emerald-200 px-3 py-1.5 rounded-lg border border-stone-700 transition-all"
                        >
                          🏆 {selectedMatch.teamA.teamName} विजेता
                        </button>
                        <button
                          onClick={() => endMatch(selectedMatch.teamBId)}
                          className="bg-stone-800 hover:bg-emerald-900 text-stone-200 hover:text-emerald-200 px-3 py-1.5 rounded-lg border border-stone-700 transition-all"
                        >
                          🏆 {selectedMatch.teamB.teamName} विजेता
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* --- TAB 2: MATCH SCHEDULE CRUD --- */}
      {activeTab === 'MATCHES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-amber-200 font-serif">
              समस्त मैच शेड्यूल व फिक्सचर्स (All Matches)
            </h3>
            <button
              onClick={openCreateMatch}
              className="festive-btn-gold flex items-center gap-1.5 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              नया मैच शेड्यूल करें
            </button>
          </div>

          <div className="bg-maroon-950/40 border border-amber-600/30 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-maroon-950/80 text-amber-300 font-serif border-b border-amber-900/40 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">मैच सं.</th>
                  <th className="p-3">चरण (Stage)</th>
                  <th className="p-3">मुकाबला (Teams)</th>
                  <th className="p-3">स्कोर (Score)</th>
                  <th className="p-3">स्थान व समय</th>
                  <th className="p-3">स्थिति (Status)</th>
                  <th className="p-3 text-right">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/20 text-stone-200">
                {matches.map((m) => (
                  <tr key={m.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-400">#{m.matchNumber}</td>
                    <td className="p-3 font-semibold text-stone-300">
                      {m.stage.replace('_', ' ')}
                    </td>
                    <td className="p-3 font-bold text-stone-100">
                      <span>{m.teamA.teamName}</span>
                      <span className="text-amber-400 mx-2 text-[10px]">बनाम</span>
                      <span>{m.teamB.teamName}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-300">
                      {m.teamAScore} - {m.teamBScore}
                    </td>
                    <td className="p-3 text-stone-400 text-[11px]">
                      <div>{m.venue || 'परोरा खेल मैदान'}</div>
                      {m.scheduledTime && (
                        <div className="text-[10px] text-amber-300/70">
                          {new Date(m.scheduledTime).toLocaleString('hi-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'LIVE'
                            ? 'bg-red-600 text-white animate-pulse'
                            : m.status === 'COMPLETED'
                            ? 'bg-emerald-900/60 text-emerald-300'
                            : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedMatch(m);
                            setActiveTab('CONSOLE');
                          }}
                          className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded text-[11px] font-semibold"
                        >
                          स्कोरिंग
                        </button>
                        <button
                          onClick={() => openEditMatch(m)}
                          className="p-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMatch(m)}
                          className="p-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: TEAMS MANAGEMENT & STANDINGS --- */}
      {activeTab === 'TEAMS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-amber-200 font-serif">
                प्रतिभागी टीमें एवं अंक तालिका (Teams & Standings)
              </h3>
              <p className="text-xs text-stone-400">
                मैच समाप्त होने पर अंक व जीत/हार का रिकॉर्ड स्वतः अपडेट होता है।
              </p>
            </div>
            <button
              onClick={openCreateTeam}
              className="festive-btn-gold flex items-center gap-1.5 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              नई टीम जोड़ें (Add Team)
            </button>
          </div>

          <div className="bg-maroon-950/40 border border-amber-600/30 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-maroon-950/80 text-amber-300 font-serif border-b border-amber-900/40 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">रैंक</th>
                  <th className="p-3">टीम व गांव (Team Name)</th>
                  <th className="p-3">कप्तान व संपर्क (Captain)</th>
                  <th className="p-3 text-center">मैच (P)</th>
                  <th className="p-3 text-center">जीत (W)</th>
                  <th className="p-3 text-center">हार (L)</th>
                  <th className="p-3 text-center">टाई (T)</th>
                  <th className="p-3 text-center font-bold text-amber-300">अंक (PTS)</th>
                  <th className="p-3 text-right">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/20 text-stone-200">
                {teams.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-400">#{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-stone-100">{t.teamName}</div>
                      <div className="text-[10px] text-stone-400">{t.villageOrClub || 'बिहार'}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-stone-200 font-medium">{t.captainName}</div>
                      <div className="text-[10px] text-stone-400">{t.captainPhone}</div>
                    </td>
                    <td className="p-3 text-center font-mono">{t.matchesPlayed}</td>
                    <td className="p-3 text-center font-mono text-emerald-400 font-bold">{t.matchesWon}</td>
                    <td className="p-3 text-center font-mono text-red-400">{t.matchesLost}</td>
                    <td className="p-3 text-center font-mono text-stone-400">{t.matchesTied}</td>
                    <td className="p-3 text-center font-mono font-extrabold text-amber-300 text-sm">
                      {t.points}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditTeam(t)}
                          className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded"
                          title="संपादित करें"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(t)}
                          className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MATCH CREATE / EDIT MODAL --- */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-maroon-950 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsMatchModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-amber-200 font-serif mb-3">
              {editingMatch ? 'मैच विवरण संपादित करें' : 'नया मैच शेड्यूल करें'}
            </h3>

            <form onSubmit={handleSaveMatch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">मैच संख्या *</label>
                  <input
                    type="number"
                    required
                    value={matchForm.matchNumber}
                    onChange={(e) => setMatchForm({ ...matchForm, matchNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">चरण (Stage) *</label>
                  <select
                    value={matchForm.stage}
                    onChange={(e) => setMatchForm({ ...matchForm, stage: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  >
                    <option value="GROUP_STAGE">ग्रुप स्टेज (Group Stage)</option>
                    <option value="QUARTER_FINAL">क्वार्टर फाइनल (Quarter Final)</option>
                    <option value="SEMI_FINAL">सेमी फाइनल (Semi Final)</option>
                    <option value="FINAL">फाइनल महामुकाबला (Final)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">टीम A का चयन करें *</label>
                <select
                  value={matchForm.teamAId}
                  onChange={(e) => setMatchForm({ ...matchForm, teamAId: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-amber-300 font-bold"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id} className="bg-maroon-950 text-stone-200">
                      {t.teamName} ({t.villageOrClub || 'बिहार'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">टीम B का चयन करें *</label>
                <select
                  value={matchForm.teamBId}
                  onChange={(e) => setMatchForm({ ...matchForm, teamBId: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-amber-300 font-bold"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id} className="bg-maroon-950 text-stone-200">
                      {t.teamName} ({t.villageOrClub || 'बिहार'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">स्थान (Venue)</label>
                <input
                  type="text"
                  value={matchForm.venue}
                  onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                  placeholder="हाई स्कूल खेल मैदान, परोरा"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">दिनांक व समय (Scheduled Time)</label>
                <input
                  type="datetime-local"
                  value={matchForm.scheduledTime}
                  onChange={(e) => setMatchForm({ ...matchForm, scheduledTime: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={() => setIsMatchModalOpen(false)}
                  className="px-4 py-2 bg-black/50 text-stone-300 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-5 py-2"
                >
                  {loading ? 'सहेज रहे हैं...' : editingMatch ? 'अपडेट करें' : 'शेड्यूल करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TEAM CREATE / EDIT MODAL --- */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-maroon-950 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsTeamModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-amber-200 font-serif mb-3">
              {editingTeam ? 'टीम विवरण संपादित करें' : 'नई कबड्डी टीम पंजीकृत करें'}
            </h3>

            <form onSubmit={handleSaveTeam} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">टीम का नाम (Team Name) *</label>
                <input
                  type="text"
                  required
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                  placeholder="उदा. परोरा वारियर्स"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">गांव या क्लब का नाम *</label>
                <input
                  type="text"
                  required
                  value={teamForm.villageOrClub}
                  onChange={(e) => setTeamForm({ ...teamForm, villageOrClub: e.target.value })}
                  placeholder="उदा. परोरा (पूर्णिया)"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">कप्तान का नाम *</label>
                  <input
                    type="text"
                    required
                    value={teamForm.captainName}
                    onChange={(e) => setTeamForm({ ...teamForm, captainName: e.target.value })}
                    placeholder="उदा. राहुल सिंह"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">कप्तान मोबाइल नंबर *</label>
                  <input
                    type="text"
                    required
                    value={teamForm.captainPhone}
                    onChange={(e) => setTeamForm({ ...teamForm, captainPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">कोच / प्रबंधक (Coach Name)</label>
                <input
                  type="text"
                  value={teamForm.coachName}
                  onChange={(e) => setTeamForm({ ...teamForm, coachName: e.target.value })}
                  placeholder="उदा. श्री विरेन्द्र कुमार"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-4 py-2 bg-black/50 text-stone-300 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-5 py-2"
                >
                  {loading ? 'सहेज रहे हैं...' : editingTeam ? 'अपडेट सुरक्षित करें' : 'टीम जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
