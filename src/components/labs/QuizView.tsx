import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Award,
  Layers,
  HelpCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../../data/quizzes';
import { QuizQuestion, LabViewId } from '../../types';
import { recordQuizScore, getStudentProgress } from '../../utils/storage';

interface QuizViewProps {
  onNavigate: (view: LabViewId, detailId?: string) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ onNavigate }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [quizMode, setQuizMode] = useState<'practice' | 'flashcard'>('practice');

  // Active quiz session state
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 mins

  // Flashcard state
  const [flashcardFlipped, setFlashcardFlipped] = useState<boolean>(false);

  const topics = ['all', 'Semiconductor Physics', 'PN Junction & Diodes', 'BJT & Amplifiers', 'FETs & MOSFETs', 'Optoelectronics & Special Devices'];

  const startQuiz = () => {
    let pool = QUIZ_QUESTIONS;
    if (selectedTopic !== 'all') {
      pool = pool.filter((q) => q.topic === selectedTopic);
    }
    // Shuffle
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));

    setSessionQuestions(selected);
    setCurrentIndex(0);
    setUserAnswers({});
    setQuizFinished(false);
    setTimeRemaining(selected.length * 60);
    setSessionActive(true);
    setFlashcardFlipped(false);
  };

  // Timer effect
  useEffect(() => {
    if (!sessionActive || quizFinished) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive, quizFinished]);

  const handleSelectAnswer = (optIndex: number) => {
    if (quizFinished) return;
    const q = sessionQuestions[currentIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [q.id]: optIndex,
    }));
  };

  const isOptionCorrect = (q: QuizQuestion, optIndex: number | undefined) => {
    if (optIndex === undefined) return false;
    return (
      q.options[optIndex] === q.correctAnswer ||
      optIndex === q.correctAnswer ||
      String(optIndex) === String(q.correctAnswer)
    );
  };

  const getCorrectText = (q: QuizQuestion) => {
    if (typeof q.correctAnswer === 'number') {
      return q.options[q.correctAnswer] || String(q.correctAnswer);
    }
    return String(q.correctAnswer);
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    // Calculate score
    let correct = 0;
    sessionQuestions.forEach((q) => {
      if (isOptionCorrect(q, userAnswers[q.id])) {
        correct++;
      }
    });
    recordQuizScore(selectedTopic, correct, sessionQuestions.length);
  };

  const currentQ = sessionQuestions[currentIndex];

  // Score stats
  const totalCorrect = sessionQuestions.reduce((acc, q) => {
    return acc + (isOptionCorrect(q, userAnswers[q.id]) ? 1 : 0);
  }, 0);
  const scorePercent = sessionQuestions.length > 0 ? Math.round((totalCorrect / sessionQuestions.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#181628] to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
              EXAM ASSESSOR
            </span>
            <span className="text-xs font-mono text-slate-400">Knowledge Validation</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            <span>Semiconductor Assessment & Flashcards</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Test your grasp of university syllabus questions across PN diodes, BJTs, MOSFETs, and Optoelectronics with timer modes, instant feedback, and flashcards.
          </p>
        </div>

        {sessionActive && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-400">
              <Clock className="w-4 h-4" />
              <span>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={() => setSessionActive(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition cursor-pointer"
            >
              EXIT
            </button>
          </div>
        )}
      </div>

      {/* SETUP VIEW (When not in active quiz session) */}
      {!sessionActive && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
            <h3 className="font-display font-bold text-base text-slate-200">
              Configure Assessment Session
            </h3>

            {/* Topic Filter */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block uppercase font-bold">
                Select Syllabus Module / Topic:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    className={`p-3 rounded-xl border text-left text-xs font-mono transition cursor-pointer ${
                      selectedTopic === t
                        ? 'bg-indigo-950 border-indigo-500 text-indigo-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t === 'all' ? 'All University Topics (Comprehensive)' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode: Practice vs Flashcard */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block uppercase font-bold">
                Session Mode:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setQuizMode('practice')}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    quizMode === 'practice'
                      ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-xs block text-white">Timed Mock Quiz</span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    10 randomized questions with scored timer and detailed feedback.
                  </span>
                </button>

                <button
                  onClick={() => setQuizMode('flashcard')}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    quizMode === 'flashcard'
                      ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-xs block text-white">Interactive Flashcards</span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Flip-card review mode to drill core definitions and equations quickly.
                  </span>
                </button>
              </div>
            </div>

            {/* Start Button */}
            <button
              id="start-assessment-btn"
              onClick={startQuiz}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs tracking-wider transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>LAUNCH {quizMode === 'practice' ? 'MOCK EXAM' : 'FLASHCARD DECK'}</span>
            </button>
          </div>

          {/* Right: Academic Performance Record */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <h4 className="font-display font-bold text-sm text-slate-200">
                Your Academic Record
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Questions in Bank:</span>
                  <span className="text-cyan-400 font-bold">{QUIZ_QUESTIONS.length} Questions</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Lab Score:</span>
                  <span className="text-emerald-400 font-bold">{getStudentProgress().labScore} Pts</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Experiments Performed:</span>
                  <span className="text-amber-400 font-bold">{getStudentProgress().experimentsCompleted.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ SESSION */}
      {sessionActive && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Question {currentIndex + 1} of {sessionQuestions.length}</span>
              <span>Topic: {currentQ?.topic}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / sessionQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* PRACTICE MODE CARD */}
          {quizMode === 'practice' && !quizFinished && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-400">
                  {currentQ.type.toUpperCase()} • {currentQ.module}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Select best answer
                </span>
              </div>

              <h3 className="font-display text-base md:text-lg font-bold text-white leading-snug">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[currentQ.id] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectAnswer(oIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950 border-indigo-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected ? 'border-indigo-400 bg-indigo-500 text-slate-950 font-bold' : 'border-slate-700'
                      }`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Nav buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-mono text-slate-300 disabled:opacity-40 transition cursor-pointer"
                >
                  PREVIOUS
                </button>

                {currentIndex < sessionQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>NEXT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    id="submit-quiz-btn"
                    onClick={finishQuiz}
                    className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>SUBMIT EXAM</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* FLASHCARD MODE CARD */}
          {quizMode === 'flashcard' && (
            <div className="space-y-4">
              <div
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                className="h-80 rounded-2xl bg-slate-900 border border-slate-800 p-8 flex flex-col justify-between cursor-pointer hover:border-indigo-500/50 transition-all shadow-xl select-none"
              >
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>FLASHCARD #{currentIndex + 1}</span>
                  <span className="text-indigo-400">CLICK TO FLIP</span>
                </div>

                {!flashcardFlipped ? (
                  <div className="text-center space-y-3">
                    <span className="text-xs font-mono text-indigo-300 uppercase block">Concept Question:</span>
                    <h3 className="font-display font-bold text-lg text-white">
                      {currentQ.question}
                    </h3>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <span className="text-xs font-mono text-emerald-400 uppercase block">Correct Explanation:</span>
                    <div className="font-mono text-emerald-300 font-bold text-sm">
                      {getCorrectText(currentQ)}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono pt-2">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}

                <div className="text-center text-[11px] font-mono text-slate-500">
                  {flashcardFlipped ? 'Tap card to see question again' : 'Tap card to reveal answer & explanation'}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => {
                    setCurrentIndex((prev) => prev - 1);
                    setFlashcardFlipped(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-mono text-slate-300 disabled:opacity-40"
                >
                  PREVIOUS CARD
                </button>
                <button
                  disabled={currentIndex === sessionQuestions.length - 1}
                  onClick={() => {
                    setCurrentIndex((prev) => prev + 1);
                    setFlashcardFlipped(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold"
                >
                  NEXT CARD
                </button>
              </div>
            </div>
          )}

          {/* QUIZ FINISHED RESULTS CARD */}
          {quizFinished && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
              <div className="text-center space-y-2 border-b border-slate-800 pb-6">
                <Award className="w-12 h-12 text-amber-400 mx-auto" />
                <h3 className="font-display font-bold text-2xl text-white">
                  Assessment Completed!
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Final Score: <strong className="text-emerald-400 text-base">{totalCorrect} / {sessionQuestions.length} ({scorePercent}%)</strong>
                </p>
                <span className="inline-block px-3 py-1 rounded bg-indigo-950 text-indigo-300 text-xs font-mono border border-indigo-800">
                  +{totalCorrect * 15} XP Earned
                </span>
              </div>

              {/* Review Missed & Completed Questions */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-sm text-slate-200">
                  Review Explanations:
                </h4>
                {sessionQuestions.map((q, idx) => {
                  const userAns = userAnswers[q.id];
                  const isRight = isOptionCorrect(q, userAns);
                  return (
                    <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-200">
                          {idx + 1}. {q.question}
                        </span>
                        {isRight ? (
                          <span className="text-emerald-400 shrink-0 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </span>
                        ) : (
                          <span className="text-rose-400 shrink-0 flex items-center gap-1 font-bold">
                            <XCircle className="w-4 h-4" /> Incorrect
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400">
                        Your answer: <span className={isRight ? 'text-emerald-400' : 'text-rose-400'}>{userAns !== undefined ? q.options[userAns] : 'Not answered'}</span>
                      </div>
                      {!isRight && (
                        <div className="text-emerald-400 font-bold">
                          Correct: {getCorrectText(q)}
                        </div>
                      )}
                      <div className="p-2.5 rounded bg-slate-900 text-slate-300 leading-relaxed text-[11px]">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setSessionActive(false)}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs tracking-wide transition cursor-pointer"
              >
                RETURN TO QUIZ MENU
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
