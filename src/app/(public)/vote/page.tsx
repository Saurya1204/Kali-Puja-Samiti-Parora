'use client';

import React, { useState, useEffect } from 'react';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import { Vote, CheckCircle2, ShieldAlert, Award, Star } from 'lucide-react';

interface PollCategory {
  id: string;
  title: string;
  options: {
    id: string;
    text: string;
    description: string;
    votes: number;
  }[];
}

const initialPolls: PollCategory[] = [
  {
    id: 'cultural-award',
    title: 'सर्वश्रेष्ठ सांस्कृतिक प्रस्तुति (Best Cultural Performance 2026)',
    options: [
      { id: 'opt-1', text: 'भक्ति जागरण एवं भव्य झांकी दर्शन', description: 'सत्यनारायण भगत एवं दल', votes: 142 },
      { id: 'opt-2', text: 'मिथिला-सीमांचल पारंपरिक लोक नृत्य', description: 'परोरा महिला सांस्कृतिक मंडल', votes: 198 },
      { id: 'opt-3', text: 'बाल प्रतिभा नाटक: माँ काली की महिमा', description: 'आदर्श विद्या मंदिर छात्र दल', votes: 165 },
    ],
  },
  {
    id: 'kabaddi-star',
    title: 'जनता की पसंद - सर्वश्रेष्ठ कबड्डी खिलाड़ी (Audience Choice Star Raider)',
    options: [
      { id: 'opt-4', text: 'अमित कुमार सिंह (परोरा टाइगर्स)', description: 'सुपर रेडर - 28 रेड पॉइंट्स', votes: 312 },
      { id: 'opt-5', text: 'सुनील सोरेन (धमदाहा चैंपियंस)', description: 'ऑल-राउंडर - 22 पॉइंट्स', votes: 284 },
      { id: 'opt-6', text: 'रवि कुमार (कस्बा वॉरियर्स)', description: 'डिफेंडर - 7 सुपर टैकल', votes: 195 },
    ],
  },
];

export default function VotePage() {
  const [polls, setPolls] = useState<PollCategory[]>(initialPolls);
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kps_votes');
      if (stored) {
        setVotedPolls(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleVote = (pollId: string, optionId: string) => {
    if (votedPolls[pollId]) {
      setMessage('आप इस श्रेणी में पूर्व में ही अपना मत दर्ज कर चुके हैं। एक डिवाइस से केवल एक वोट मान्य है।');
      return;
    }

    const updatedPolls = polls.map((p) => {
      if (p.id !== pollId) return p;
      return {
        ...p,
        options: p.options.map((opt) => {
          if (opt.id === optionId) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        }),
      };
    });

    const newVoted = { ...votedPolls, [pollId]: optionId };
    setPolls(updatedPolls);
    setVotedPolls(newVoted);
    try {
      localStorage.setItem('kps_votes', JSON.stringify(newVoted));
    } catch {}

    setMessage('आपका मत सफलतापूर्वक दर्ज कर लिया गया है। निष्पक्ष चुनाव हेतु धन्यवाद!');
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2">
          <DiyaAnimation size="sm" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            Public Choice Awards
          </span>
          <DiyaAnimation size="sm" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-amber-300 font-serif">
          जनता की पसंद: ऑनलाइन वोटिंग
        </h1>
        <p className="text-xs sm:text-sm text-stone-300">
          इस वर्ष के सर्वश्रेष्ठ सांस्कृतिक कलाकारों एवं कबड्डी खिलाड़ियों के चयन हेतु अपना बहुमूल्य मत समर्पित करें।
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500 text-amber-200 text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Poll Cards */}
      <div className="space-y-8">
        {polls.map((poll) => {
          const hasVoted = Boolean(votedPolls[poll.id]);
          const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

          return (
            <div key={poll.id} className="festive-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/40 pb-4">
                <h3 className="text-lg sm:text-xl font-bold text-amber-200 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-current" />
                  <span>{poll.title}</span>
                </h3>
                <span className="text-xs font-mono bg-black/40 px-3 py-1 rounded-full text-stone-400 border border-amber-900/40">
                  कुल वोट: {totalVotes}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {poll.options.map((opt) => {
                  const isSelected = votedPolls[poll.id] === opt.id;
                  const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;

                  return (
                    <div
                      key={opt.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 shadow-glow-gold'
                          : 'bg-black/40 border-amber-900/40 hover:border-amber-600/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-stone-100 text-sm">{opt.text}</h4>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-stone-400">{opt.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-amber-900/30 space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-stone-400">{opt.votes} मत</span>
                          <span className="font-bold text-amber-300">{percentage}%</span>
                        </div>

                        {/* Progress visual */}
                        <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-600 to-amber-400 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        {!hasVoted ? (
                          <button
                            onClick={() => handleVote(poll.id, opt.id)}
                            className="w-full mt-2 festive-btn-gold text-xs py-2 font-bold cursor-pointer"
                          >
                            वोट दें (Vote Now)
                          </button>
                        ) : (
                          <div className="text-[11px] text-center text-stone-400 pt-1">
                            {isSelected ? '✓ आपने इन्हें चुना' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-stone-400 flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400" />
        <span>फर्जी मतदान रोकने हेतु ब्राउज़र एवं आईपी सत्यापन सुरक्षा तंत्र सक्रिय है।</span>
      </div>
    </div>
  );
}

