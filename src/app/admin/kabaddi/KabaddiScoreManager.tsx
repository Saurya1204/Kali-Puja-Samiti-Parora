'use client';

import React, { useState } from 'react';
import PlayerProfileModal, { PlayerData } from '@/components/public/PlayerProfileModal';
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
  UserPlus,
  UserCheck,
  Zap,
  Shield,
  Eye,
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
  players?: PlayerData[];
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

  // Selected Team for Player Management
  const [selectedRosterTeam, setSelectedRosterTeam] = useState<Team | null>(initialTeams[0] || null);

  // Player Profile Modal Preview
  const [previewPlayer, setPreviewPlayer] = useState<PlayerData | null>(null);

  // Player Form Modal State
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerData | null>(null);
  const [playerForm, setPlayerForm] = useState({
    teamId: initialTeams[0]?.id || '',
    name: '',
    jerseyNumber: 7,
    role: 'RAIDER',
    isCaptain: false,
    phone: '',
    photoUrl: '',
    villageOrDistrict: 'परोरा',
    skills: 'रनिंग हैंड टच, डुबकी, सुपर रेड',
    achievements: 'बिहार राज्य आमंत्रण कबड्डी प्रतियोगिता उत्कृष्ट प्रदर्शन',
    bio: 'अमरनाथ प्रसाद (चीफ कोच) के सानिध्य में परोरा अखाड़ा में प्रशिक्षित।',
    weight: '72 kg',
    height: '5 ft 9 in',
    age: 22,
    matchesPlayed: 3,
    raidPoints: 24,
    tacklePoints: 6,
    superRaids: 2,
    superTackles: 1,
  });

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
    coachName: 'श्री अमरनाथ प्रसाद (चीफ कोच)',
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

  // --- PLAYER CRUD HANDLERS ---
  const openAddPlayer = (team: Team) => {
    setEditingPlayer(null);
    setPlayerForm({
      teamId: team.id,
      name: '',
      jerseyNumber: (team.players?.length || 0) + 1,
      role: 'RAIDER',
      isCaptain: false,
      phone: '',
      photoUrl: '',
      villageOrDistrict: team.villageOrClub || 'परोरा (बेगूसराय)',
      skills: 'रनिंग हैंड टच, डुबकी, सुपर रेड',
      achievements: 'बिहार राज्य आमंत्रण कबड्डी प्रतियोगिता उत्कृष्ट प्रदर्शन',
      bio: 'श्री अमरनाथ प्रसाद (चीफ कोच) के सानिध्य में परोरा अखाड़ा में प्रशिक्षित।',
      weight: '72 kg',
      height: '5 ft 9 in',
      age: 22,
      matchesPlayed: 3,
      raidPoints: 15,
      tacklePoints: 5,
      superRaids: 1,
      superTackles: 1,
    });
    setIsPlayerModalOpen(true);
  };

  const openEditPlayer = (p: PlayerData, team: Team) => {
    setEditingPlayer(p);
    setPlayerForm({
      teamId: team.id,
      name: p.name,
      jerseyNumber: p.jerseyNumber || 1,
      role: p.role,
      isCaptain: Boolean(p.isCaptain),
      phone: p.phone || '',
      photoUrl: p.photoUrl || '',
      villageOrDistrict: p.villageOrDistrict || team.villageOrClub || '',
      skills: p.skills || '',
      achievements: p.achievements || '',
      bio: p.bio || '',
      weight: p.weight || '',
      height: p.height || '',
      age: p.age || 20,
      matchesPlayed: p.matchesPlayed || 0,
      raidPoints: p.raidPoints || 0,
      tacklePoints: p.tacklePoints || 0,
      superRaids: p.superRaids || 0,
      superTackles: p.superTackles || 0,
    });
    setIsPlayerModalOpen(true);
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = { ...playerForm };
      if (editingPlayer) payload.id = editingPlayer.id;

      const res = await fetch('/api/admin/kabaddi/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'खिलाड़ी सहेजने में त्रुटि');

      // Update local team's player list
      const updatedTeams = teams.map((t) => {
        if (t.id === data.player.teamId) {
          const existingPlayers = t.players || [];
          const newPlayers = editingPlayer
            ? existingPlayers.map((item) => (item.id === data.player.id ? data.player : item))
            : [...existingPlayers, data.player];
          return { ...t, players: newPlayers };
        }
        return t;
      });

      setTeams(updatedTeams);
      if (selectedRosterTeam?.id === data.player.teamId) {
        setSelectedRosterTeam(updatedTeams.find((t) => t.id === data.player.teamId) || null);
      }

      setFeedback('खिलाड़ी प्रोफाइल सफलतापूर्वक सहेज लिया गया!');
      setIsPlayerModalOpen(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId: string, teamId: string) => {
    if (!confirm('क्या आप वाकई इस खिलाड़ी को टीम से हटाना चाहते हैं?')) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/kabaddi/players?id=${playerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'हटाने में विफल');

      const updatedTeams = teams.map((t) => {
        if (t.id === teamId) {
          return { ...t, players: (t.players || []).filter((p) => p.id !== playerId) };
        }
        return t;
      });

      setTeams(updatedTeams);
      if (selectedRosterTeam?.id === teamId) {
        setSelectedRosterTeam(updatedTeams.find((t) => t.id === teamId) || null);
      }

      setFeedback('खिलाड़ी सफलतापूर्वक हटा दिया गया।');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
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
      const payload: any = { ...matchForm, festivalYear };
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
    if (!confirm(`क्या आप मैच #${m.matchNumber} को हटाना चाहते हैं?`)) return;
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
      coachName: 'श्री अमरनाथ प्रसाद (चीफ कोच)',
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
      const payload: any = { ...teamForm, festivalYear };
      if (editingTeam) payload.id = editingTeam.id;

      const res = await fetch('/api/admin/kabaddi/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'टीम सहेजने में विफल');

      if (editingTeam) {
        setTeams(teams.map((t) => (t.id === editingTeam.id ? { ...t, ...data.team } : t)));
        setFeedback('टीम का विवरण सफलतापूर्वक अपडेट किया गया!');
      } else {
        setTeams([...teams, { ...data.team, players: [] }]);
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
    if (!confirm(`क्या आप टीम "${t.teamName}" को हटाना चाहते हैं?`)) return;
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
      {/* Header with Coach Amarnath Prasad Tribute Banner */}
      <div className="bg-gradient-to-r from-red-950 via-maroon-900 to-black p-4 sm:p-5 rounded-2xl border border-amber-500/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-black/40 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              बिहार कबड्डी का गौरव • Parora Kabaddi Arena
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-200 font-serif mt-1 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            कबड्डी मैच, स्कोर व खिलाड़ी प्रबंधन (Teams & Roster)
          </h1>
          <p className="text-xs text-stone-300 mt-0.5">
            चीफ कोच <strong>श्री अमरनाथ प्रसाद (Amarnath Prasad - 6203510983)</strong> के मार्गदर्शन में संचालित
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-amber-500/30 text-xs shrink-0 flex-wrap">
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
            🛡️ टीमें व खिलाड़ी रोस्टर ({teams.length})
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
              <button onClick={openCreateMatch} className="festive-btn-gold text-xs mt-3">
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
                        <div className="text-5xl sm:text-6xl font-extrabold text-amber-300 font-mono my-3 tracking-tighter">
                          {selectedMatch.teamAScore}
                        </div>

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
                        <div className="text-5xl sm:text-6xl font-extrabold text-amber-300 font-mono my-3 tracking-tighter">
                          {selectedMatch.teamBScore}
                        </div>

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

                    {/* Live Commentary Box */}
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
                          placeholder="उदा. परोरा वारियर्स ने लगाया सुपर टैकल! 2 अंक बटोरे..."
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
                      <span className="text-stone-400">विजेता घोषित कर मैच समाप्त करें:</span>
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
            <button onClick={openCreateMatch} className="festive-btn-gold flex items-center gap-1.5 text-xs">
              <PlusCircle className="w-4 h-4" />
              नया मैच शेड्यूल करें
            </button>
          </div>

          <div className="bg-maroon-950/40 border border-amber-600/30 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[650px]">
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
                      <td className="p-3 font-semibold text-stone-300">{m.stage.replace('_', ' ')}</td>
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
                          <button onClick={() => openEditMatch(m)} className="p-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteMatch(m)} className="p-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded">
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
        </div>
      )}

      {/* --- TAB 3: TEAMS & ROSTER CRUD --- */}
      {activeTab === 'TEAMS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-amber-200 font-serif">
                प्रतिभागी टीमें व खिलाड़ी रोस्टर (Teams & Players)
              </h3>
              <p className="text-xs text-stone-400">
                खिलाड़ी के नाम पर क्लिक कर उनका पूरा प्रोफाइल (फोटो, कौशल, उपलब्धियां) देखें।
              </p>
            </div>
            <button onClick={openCreateTeam} className="festive-btn-gold flex items-center gap-1.5 text-xs">
              <PlusCircle className="w-4 h-4" />
              नई टीम जोड़ें (Add Team)
            </button>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((t) => {
              const isSelected = selectedRosterTeam?.id === t.id;
              const playerCount = t.players?.length || 0;

              return (
                <div
                  key={t.id}
                  className={`festive-card p-4 space-y-3 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-amber-400 border-amber-400' : 'hover:border-amber-500/50'
                  }`}
                  onClick={() => setSelectedRosterTeam(t)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400 font-mono uppercase font-bold block">
                        {t.villageOrClub || 'बिहार'}
                      </span>
                      <h4 className="font-bold text-stone-100 text-base">{t.teamName}</h4>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEditTeam(t)} className="p-1 text-stone-400 hover:text-amber-300">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteTeam(t)} className="p-1 text-stone-400 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-stone-300 space-y-1 bg-black/40 p-2.5 rounded-xl border border-stone-800">
                    <div>कप्तान: <strong className="text-amber-200">{t.captainName}</strong> ({t.captainPhone})</div>
                    {t.coachName && <div className="text-[11px] text-stone-400">कोच: {t.coachName}</div>}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-800 text-[11px]">
                      <span>खिलाड़ी: <strong className="text-amber-300">{playerCount} सदस्य</strong></span>
                      <span className="font-mono font-bold text-emerald-400">अंक: {t.points} PTS</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openAddPlayer(t)}
                      className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> खिलाड़ी जोड़ें
                    </button>
                    <span className="text-[11px] text-stone-400">
                      {isSelected ? '✓ चयनित टीम' : 'क्लिक कर रोस्टर देखें'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Selected Team Roster Management */}
          {selectedRosterTeam && (
            <div className="bg-gradient-to-b from-maroon-950/80 to-black/80 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/50 pb-3">
                <div>
                  <div className="text-xs text-amber-400 font-mono uppercase font-bold">
                    टीम खिलाड़ी रोस्टर (Team Players Roster)
                  </div>
                  <h3 className="text-xl font-bold text-amber-200 font-serif">
                    {selectedRosterTeam.teamName} के खिलाड़ी
                  </h3>
                </div>

                <button
                  onClick={() => openAddPlayer(selectedRosterTeam)}
                  className="festive-btn-gold text-xs px-4 py-2 flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>खिलाड़ी जोड़ें (Add Player to Team)</span>
                </button>
              </div>

              {(!selectedRosterTeam.players || selectedRosterTeam.players.length === 0) ? (
                <div className="p-8 text-center text-stone-400 text-xs bg-black/40 rounded-2xl border border-stone-800">
                  इस टीम में अभी कोई खिलाड़ी पंजीकृत नहीं है। ऊपर दिए गए बटन से खिलाड़ी जोड़ें।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedRosterTeam.players.map((p) => (
                    <div
                      key={p.id}
                      className="bg-black/60 border border-amber-600/30 hover:border-amber-400 rounded-2xl p-3.5 flex items-start justify-between gap-3 transition-all group cursor-pointer"
                      onClick={() => setPreviewPlayer({ ...p, team: selectedRosterTeam })}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Jersey / Avatar */}
                        <div className="w-12 h-12 rounded-xl bg-maroon-900 border border-amber-500/50 overflow-hidden shrink-0 flex items-center justify-center font-mono font-black text-amber-300 text-sm shadow">
                          {p.photoUrl ? (
                            <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>#{p.jerseyNumber || '?'}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-stone-100 text-sm truncate group-hover:text-amber-300 transition-colors">
                              {p.name}
                            </span>
                            {p.isCaptain && (
                              <span className="text-[9px] bg-amber-500 text-maroon-950 px-1 font-bold rounded">
                                C
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-amber-300/80 block font-semibold">
                            {p.role}
                          </span>
                          <span className="text-[10px] text-stone-400 block truncate">
                            रेड अंक: {p.raidPoints || 0} • टैकल: {p.tacklePoints || 0}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setPreviewPlayer({ ...p, team: selectedRosterTeam })}
                          className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded"
                          title="प्रोफाइल देखें"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditPlayer(p, selectedRosterTeam)}
                          className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded"
                          title="संपादित करें"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(p.id, selectedRosterTeam.id)}
                          className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- PLAYER CREATE / EDIT MODAL --- */}
      {isPlayerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPlayerModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-amber-200 font-serif mb-1">
              {editingPlayer ? 'खिलाड़ी विवरण व प्रोफाइल संपादित करें' : 'नया कबड्डी खिलाड़ी पंजीकृत करें'}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              खिलाड़ी की फोटो, कौशल, उपलब्धियां एवं शारीरिक विवरण दर्ज करें ताकि दर्शक उनकी प्रोफाइल देख सकें।
            </p>

            <form onSubmit={handleSavePlayer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">खिलाड़ी का पूरा नाम *</label>
                  <input
                    type="text"
                    required
                    value={playerForm.name}
                    onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                    placeholder="उदा. राहुल कुमार"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">जर्सी संख्या (Jersey #)</label>
                  <input
                    type="number"
                    value={playerForm.jerseyNumber}
                    onChange={(e) => setPlayerForm({ ...playerForm, jerseyNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">खेल भूमिका (Role) *</label>
                  <select
                    value={playerForm.role}
                    onChange={(e) => setPlayerForm({ ...playerForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 font-bold"
                  >
                    <option value="RAIDER">रेडर (Raider)</option>
                    <option value="DEFENDER">डिफेंडर (Defender)</option>
                    <option value="ALL_ROUNDER">ऑल राउंडर (All-Rounder)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">गांव या जिला (Village/District)</label>
                  <input
                    type="text"
                    value={playerForm.villageOrDistrict}
                    onChange={(e) => setPlayerForm({ ...playerForm, villageOrDistrict: e.target.value })}
                    placeholder="उदा. परोरा (बेगूसराय)"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">फोटो URL (Picture URL)</label>
                <input
                  type="url"
                  value={playerForm.photoUrl}
                  onChange={(e) => setPlayerForm({ ...playerForm, photoUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... अथवा इमेज लिंक"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  विशेष कौशल (Skills - अल्पविराम से अलग करें)
                </label>
                <input
                  type="text"
                  value={playerForm.skills}
                  onChange={(e) => setPlayerForm({ ...playerForm, skills: e.target.value })}
                  placeholder="उदा. रनिंग हैंड टच, डुबकी, सुपर टैकल, टो टच, एंकल होल्ड"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-amber-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  उपलब्धियां (Achievements - सेमीकोलन ; से अलग करें)
                </label>
                <textarea
                  rows={2}
                  value={playerForm.achievements}
                  onChange={(e) => setPlayerForm({ ...playerForm, achievements: e.target.value })}
                  placeholder="उदा. बिहार राज्य जूनियर कबड्डी रजत पदक 2024; बेगूसराय जिला सर्वश्रेष्ठ रेडर"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-stone-400 text-[11px] mb-1">वजन (Weight)</label>
                  <input
                    type="text"
                    value={playerForm.weight}
                    onChange={(e) => setPlayerForm({ ...playerForm, weight: e.target.value })}
                    placeholder="75 kg"
                    className="w-full px-2.5 py-1.5 bg-black/50 border border-stone-800 rounded-lg text-stone-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-[11px] mb-1">लंबाई (Height)</label>
                  <input
                    type="text"
                    value={playerForm.height}
                    onChange={(e) => setPlayerForm({ ...playerForm, height: e.target.value })}
                    placeholder="5 ft 10 in"
                    className="w-full px-2.5 py-1.5 bg-black/50 border border-stone-800 rounded-lg text-stone-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-[11px] mb-1">उम्र (Age)</label>
                  <input
                    type="number"
                    value={playerForm.age}
                    onChange={(e) => setPlayerForm({ ...playerForm, age: Number(e.target.value) })}
                    placeholder="22"
                    className="w-full px-2.5 py-1.5 bg-black/50 border border-stone-800 rounded-lg text-stone-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-stone-400 text-[11px] mb-1">कुल मैच</label>
                  <input
                    type="number"
                    value={playerForm.matchesPlayed}
                    onChange={(e) => setPlayerForm({ ...playerForm, matchesPlayed: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-black/50 border border-stone-800 rounded-lg text-stone-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-[11px] mb-1">रेड अंक</label>
                  <input
                    type="number"
                    value={playerForm.raidPoints}
                    onChange={(e) => setPlayerForm({ ...playerForm, raidPoints: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-black/50 border border-stone-800 rounded-lg text-red-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-[11px] mb-1">टैकल अंक</label>
                  <input
                    type="number"
                    value={playerForm.tacklePoints}
                    onChange={(e) => setPlayerForm({ ...playerForm, tacklePoints: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-black/50 border border-stone-800 rounded-lg text-blue-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-[11px] mb-1">सुपर रेड</label>
                  <input
                    type="number"
                    value={playerForm.superRaids}
                    onChange={(e) => setPlayerForm({ ...playerForm, superRaids: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-black/50 border border-stone-800 rounded-lg text-purple-300 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCaptainCheck"
                  checked={playerForm.isCaptain}
                  onChange={(e) => setPlayerForm({ ...playerForm, isCaptain: e.target.checked })}
                  className="rounded border-amber-600 text-amber-500"
                />
                <label htmlFor="isCaptainCheck" className="text-stone-300 font-semibold cursor-pointer">
                  टीम का आधिकारिक कप्तान है (Team Captain)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={() => setIsPlayerModalOpen(false)}
                  className="px-4 py-2 bg-black/50 text-stone-300 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-5 py-2"
                >
                  {loading ? 'सहेज रहे हैं...' : editingPlayer ? 'अपडेट सुरक्षित करें' : 'खिलाड़ी जोड़ें'}
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
            <button onClick={() => setIsTeamModalOpen(false)} className="absolute top-4 right-4 text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-amber-200 font-serif mb-3">
              {editingTeam ? 'टीम विवरण संपादित करें' : 'नई कबड्डी टीम पंजीकृत करें'}
            </h3>

            <form onSubmit={handleSaveTeam} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">टीम का नाम *</label>
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
                  placeholder="उदा. परोरा (बेगूसराय)"
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
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">कोच / मार्गदर्शक (Coach Name)</label>
                <input
                  type="text"
                  value={teamForm.coachName}
                  onChange={(e) => setTeamForm({ ...teamForm, coachName: e.target.value })}
                  placeholder="उदा. श्री अमरनाथ प्रसाद (चीफ कोच)"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button type="button" onClick={() => setIsTeamModalOpen(false)} className="px-4 py-2 bg-black/50 text-stone-300 rounded-xl">
                  रद्द करें
                </button>
                <button type="submit" disabled={loading} className="festive-btn-gold px-5 py-2">
                  {loading ? 'सहेज रहे हैं...' : editingTeam ? 'अपडेट सुरक्षित करें' : 'टीम जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MATCH MODAL --- */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-maroon-950 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsMatchModalOpen(false)} className="absolute top-4 right-4 text-stone-400 hover:text-white">
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button type="button" onClick={() => setIsMatchModalOpen(false)} className="px-4 py-2 bg-black/50 text-stone-300 rounded-xl">
                  रद्द करें
                </button>
                <button type="submit" disabled={loading} className="festive-btn-gold px-5 py-2">
                  {loading ? 'सहेज रहे हैं...' : editingMatch ? 'अपडेट करें' : 'शेड्यूल करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PREVIEW PLAYER PROFILE MODAL --- */}
      {previewPlayer && (
        <PlayerProfileModal player={previewPlayer} onClose={() => setPreviewPlayer(null)} />
      )}
    </div>
  );
}
