'use client';

import React, { useState } from 'react';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import { HelpCircle, Award, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: 'परोरा में माँ काली पूजा समिति की स्थापना किस वर्ष हुई थी?',
    options: ['1975', '1984', '1995', '2005'],
    correct: 1,
    explanation: 'काली पूजा समिति परोरा की स्थापना वर्ष 1984 में गांव के प्रबुद्ध नागरिकों द्वारा की गई थी।',
  },
  {
    id: 2,
    question: 'परोरा काली पूजा महोत्सव प्रतिवर्ष किस पावन हिंदू तिथि को आयोजित होता है?',
    options: [
      'दशहरा (विजयादशमी)',
      'दीपावली के तुरंत बाद (कार्तिक अमावस्या एवं प्रतिपदा)',
      'छठ महापर्व',
      'रामनवमी',
    ],
    correct: 1,
    explanation: 'यह महोत्सव प्रतिवर्ष दीपावली की रात्रि (कार्तिक अमावस्या) एवं उसके अगले दिन प्रतिपदा को आयोजित होता है।',
  },
  {
    id: 3,
    question: 'परोरा के खेल महोत्सव में आयोजित होने वाली मुख्य राज्यस्तरीय प्रतियोगिता कौन सी है?',
    options: ['क्रिकेट टूर्नामेंट', 'वॉलीबॉल कप', 'मैट कबड्डी चैंपियनशिप', 'फुटबॉल लीग'],
    correct: 2,
    explanation: 'अखिल बिहार राज्यस्तरीय आमंत्रण मैट कबड्डी प्रतियोगिता महोत्सव का मुख्य खेल आकर्षण है।',
  },
  {
    id: 4,
    question: 'समिति द्वारा मेधावी छात्र-छात्राओं के अभिनंदन हेतु कौन सा समारोह आयोजित किया जाता है?',
    options: [
      'परोरा प्रतिभा सम्मान समारोह',
      'बाल मेला उत्सव',
      'ज्ञान ज्योति प्रतियोगिता',
      'युवा संसद',
    ],
    correct: 0,
    explanation: 'परोरा प्रतिभा सम्मान समारोह में 10वीं, 12वीं, सरकारी नौकरी व खेल में सफल युवाओं को शील्ड व प्रशस्ति पत्र दिया जाता है।',
  },
  {
    id: 5,
    question: 'महोत्सव के दूसरे दिन सर्वजन समरसता हेतु कौन सा मुख्य धार्मिक कार्यक्रम होता है?',
    options: [
      'महाप्रसाद भंडारा एवं लंगर',
      'नौका दौड़',
      'पतंग उत्सव',
      'दीप दान यज्ञ',
    ],
    correct: 0,
    explanation: 'विशाल महाप्रसाद भंडारा में हजारों श्रद्धालुओं को शुद्ध देसी घी का प्रसाद वितरित किया जाता है।',
  },
];

export default function QuizPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userName, setUserName] = useState('');

  const currentQ = quizQuestions[currentIdx];

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelectedOpt(idx);
    setShowAnswer(true);

    if (idx === currentQ.correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setShowAnswer(false);
    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setShowAnswer(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2">
          <DiyaAnimation size="sm" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            Interactive Festival Quiz
          </span>
          <DiyaAnimation size="sm" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-amber-300 font-serif">
          परोरा परंपरा एवं महोत्सव क्विज
        </h1>
        <p className="text-xs sm:text-sm text-stone-300">
          परोरा के इतिहास, माँ काली पूजा परंपरा एवं कबड्डी महोत्सव से जुड़े प्रश्नों के उत्तर दें और अपना डिजिटल ज्ञान प्रमाणपत्र देखें!
        </p>
      </div>

      {!isCompleted ? (
        <div className="festive-card p-6 sm:p-10 space-y-6 max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold border-b border-amber-900/40 pb-3">
            <span>
              प्रश्न {currentIdx + 1} / {quizQuestions.length}
            </span>
            <span className="bg-amber-500/20 px-3 py-1 rounded-full font-mono">
              अंक: {score}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-stone-100 leading-snug">
            {currentQ.question}
          </h3>

          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, idx) => {
              let btnStyle = 'bg-black/50 text-stone-200 border-amber-900/50 hover:border-amber-500';
              if (showAnswer) {
                if (idx === currentQ.correct) {
                  btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                } else if (idx === selectedOpt) {
                  btnStyle = 'bg-red-950/80 border-red-500 text-red-200';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showAnswer}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {showAnswer && idx === currentQ.correct && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {showAnswer && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
              <strong className="block text-amber-300">विस्तृत व्याख्या:</strong>
              <p>{currentQ.explanation}</p>
              <div className="pt-2 text-right">
                <button
                  onClick={handleNext}
                  className="festive-btn-gold text-xs px-5 py-2 font-bold cursor-pointer"
                >
                  {currentIdx + 1 < quizQuestions.length ? 'अगला प्रश्न' : 'परिणाम देखें'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Completed Certificate Box */
        <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl relative space-y-6 printable-area">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">
              Digital Certificate of Honor
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif mt-1">
              काली पूजा समिति परोरा महोत्सव क्विज
            </h2>
          </div>

          <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-6 text-center space-y-2">
            <span className="text-xs text-stone-400">आपका कुल स्कोर:</span>
            <div className="text-4xl font-extrabold text-amber-300 font-mono">
              {score} / {quizQuestions.length}
            </div>
            <p className="text-xs text-amber-200 font-medium pt-2">
              {score >= 4
                ? 'अद्भुत! आप परोरा के इतिहास एवं संस्कृति के सच्चे ज्ञाता हैं।'
                : 'सराहनीय प्रयास! माँ काली का आशीर्वाद सदैव आपके साथ रहे।'}
            </p>
          </div>

          <div className="no-print pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="festive-btn-gold text-xs sm:text-sm px-6 py-2.5 font-bold cursor-pointer"
            >
              प्रमाणपत्र प्रिंट करें (Print)
            </button>
            <button
              onClick={handleRestart}
              className="bg-black/60 hover:bg-black/80 text-stone-300 px-6 py-2.5 rounded-full border border-amber-700/50 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>पुनः खेलें</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

