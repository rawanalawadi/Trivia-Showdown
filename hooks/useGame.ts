'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { QUESTIONS, STRINGS, LABELS } from '@/lib/data';
import { lsGet, lsSet } from '@/lib/storage';
import type {
  Lang, Difficulty, GameMode, Screen,
  User, Question, CustomQuestion, FeedbackState, OptionState, LeaderboardEntry,
} from '@/lib/types';

const CIRC = 2 * Math.PI * 27; // SVG r=27

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
}

// Public shape the components receive
export interface GameAPI {
  screen: Screen;
  lang: Lang;
  t: (key: string) => string;
  toggleLang: () => void;

  user: User | null;
  goWelcome: () => void;
  goLogin: () => void;
  goGuest: () => void;
  doLogin: (mobile: string, name: string) => 'ok' | 'err_mobile' | 'err_name';
  doLogout: () => void;

  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  gameMode: GameMode;
  setGameMode: (m: GameMode) => void;

  customQuestions: CustomQuestion[];
  goBuilder: () => void;
  addCustomQuestion: (q: CustomQuestion) => void;
  deleteCustomQuestion: (i: number) => void;

  leaderboard: LeaderboardEntry[];
  goLeaderboard: () => void;
  clearLeaderboard: () => void;

  startGame: (t1: string, t2: string) => void;
  startCustomGame: (t1: string, t2: string) => void;

  questions: Question[];
  currentQ: number;
  scores: [number, number];
  teamNames: [string, string];
  activeTeam: 0 | 1;
  isTransfer: boolean;
  timeLeft: number;
  timerDuration: number;
  optStates: OptionState[];
  feedback: FeedbackState | null;

  handleAnswer: (i: number) => void;

  gameDiff: string;
  playAgain: () => void;
  goHome: () => void;

  confettiActive: boolean;
  confettiColor: string;

  quitModal: boolean;
  clearModal: boolean;
  addQModal: boolean;
  openQuitModal: () => void;
  closeQuitModal: () => void;
  confirmQuit: () => void;
  openClearModal: () => void;
  closeClearModal: () => void;
  openAddQModal: () => void;
  closeAddQModal: () => void;

  circumference: number;
}

export function useGame(): GameAPI {
  // ── App ──────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>('welcome');
  const [lang, setLang] = useState<Lang>('en');
  const [user, setUser] = useState<User | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('ready');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // ── Modals ───────────────────────────────────────────
  const [quitModal, setQuitModal] = useState(false);
  const [clearModal, setClearModal] = useState(false);
  const [addQModal, setAddQModal] = useState(false);

  // ── Game ─────────────────────────────────────────────
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [teamNames, setTeamNames] = useState<[string, string]>(['Team 1', 'Team 2']);
  const [activeTeam, setActiveTeam] = useState<0 | 1>(0);
  const [firstTeam, setFirstTeam] = useState<0 | 1>(0);
  const [isTransfer, setIsTransfer] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [optStates, setOptStates] = useState<OptionState[]>(['', '', '', '']);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [gameDiff, setGameDiff] = useState<string>('medium');

  // ── Timer ────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerDuration, setTimerDuration] = useState(15);
  const [timerActive, setTimerActive] = useState(false);

  // ── Confetti ─────────────────────────────────────────
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiColor, setConfettiColor] = useState('#ffd60a');

  // ── Refs ─────────────────────────────────────────────
  // Updated on every render so effects always get the latest closure
  const handleTimeoutRef = useRef<() => void>(() => {});
  const advanceRoundRef  = useRef<() => void>(() => {});
  const showResultsRef   = useRef<() => void>(() => {});

  // ── i18n ─────────────────────────────────────────────
  const t = useCallback((key: string): string =>
    (STRINGS[lang] as Record<string, string>)[key] ?? key,
  [lang]);

  // ── Initialise from localStorage ─────────────────────
  useEffect(() => {
    const savedLang = lsGet<Lang>('tq_lang', 'en');
    setLang(savedLang);
    document.documentElement.lang = savedLang;
    document.documentElement.dir  = savedLang === 'ar' ? 'rtl' : 'ltr';

    const savedUser = lsGet<User | null>('tq_user', null);
    if (savedUser?.mobile && savedUser?.name) {
      setUser(savedUser);
      setCustomQuestions(lsGet<CustomQuestion[]>(`tq_custom_${savedUser.mobile}`, []));
    }
    setLeaderboard(lsGet<LeaderboardEntry[]>('tq_leaderboard', []));
  }, []);

  // ── Lang helpers ─────────────────────────────────────
  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next: Lang = prev === 'en' ? 'ar' : 'en';
      lsSet('tq_lang', next);
      document.documentElement.lang = next;
      document.documentElement.dir  = next === 'ar' ? 'rtl' : 'ltr';
      return next;
    });
  }, []);

  // ── Auth ─────────────────────────────────────────────
  const goWelcome = useCallback(() => setScreen('welcome'), []);
  const goLogin   = useCallback(() => setScreen('login'),   []);
  const goGuest   = useCallback(() => setScreen('home'),    []);

  const doLogin = useCallback((mobile: string, name: string): 'ok' | 'err_mobile' | 'err_name' => {
    if (!/^\+?[\d\s\-]{7,15}$/.test(mobile)) return 'err_mobile';
    if (name.trim().length < 2) return 'err_name';
    const u: User = { mobile: mobile.replace(/\D/g, ''), name: name.trim() };
    setUser(u);
    lsSet('tq_user', u);
    setCustomQuestions(lsGet<CustomQuestion[]>(`tq_custom_${u.mobile}`, []));
    setScreen('home');
    return 'ok';
  }, []);

  const doLogout = useCallback(() => {
    setUser(null);
    lsSet('tq_user', null);
    setCustomQuestions([]);
    setScreen('welcome');
  }, []);

  // ── Leaderboard ──────────────────────────────────────
  const goLeaderboard = useCallback(() => {
    setLeaderboard(lsGet<LeaderboardEntry[]>('tq_leaderboard', []));
    setScreen('leaderboard');
  }, []);

  const clearLeaderboard = useCallback(() => {
    lsSet('tq_leaderboard', []);
    setLeaderboard([]);
    setClearModal(false);
  }, []);

  const saveEntry = (entry: LeaderboardEntry) => {
    const updated = [...lsGet<LeaderboardEntry[]>('tq_leaderboard', []), entry];
    lsSet('tq_leaderboard', updated);
    setLeaderboard(updated);
  };

  // ── Builder ──────────────────────────────────────────
  const goBuilder = useCallback(() => setScreen('builder'), []);

  const addCustomQuestion = useCallback((q: CustomQuestion) => {
    setCustomQuestions(prev => {
      const next = [...prev, q];
      if (user) lsSet(`tq_custom_${user.mobile}`, next);
      return next;
    });
  }, [user]);

  const deleteCustomQuestion = useCallback((i: number) => {
    setCustomQuestions(prev => {
      const next = prev.filter((_, idx) => idx !== i);
      if (user) lsSet(`tq_custom_${user.mobile}`, next);
      return next;
    });
  }, [user]);

  // ── Timer effects ─────────────────────────────────────
  // Tick
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const id = window.setTimeout(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearTimeout(id);
  }, [timerActive, timeLeft]);

  // Timeout trigger (calls always-fresh ref)
  useEffect(() => {
    if (!timerActive || timeLeft > 0) return;
    setTimerActive(false);
    handleTimeoutRef.current();
  }, [timerActive, timeLeft]);

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setTimerDuration(seconds);
    setTimerActive(true);
  };

  const stopTimer = useCallback(() => setTimerActive(false), []);

  // ── Game setup ────────────────────────────────────────
  const initGame = (qs: Question[], diff: string, t1: string, t2: string) => {
    const names: [string, string] = [
      t1.trim() || (lang === 'ar' ? 'الفريق الأول' : 'Team 1'),
      t2.trim() || (lang === 'ar' ? 'الفريق الثاني' : 'Team 2'),
    ];
    setQuestions(qs);
    setCurrentQ(0);
    setScores([0, 0]);
    setTeamNames(names);
    setActiveTeam(0);
    setFirstTeam(0);
    setIsTransfer(false);
    setAnswered(false);
    setOptStates(['', '', '', '']);
    setFeedback(null);
    setGameDiff(diff);
    setConfettiActive(false);
    setScreen('game');
    startTimer(15);
  };

  const startGame = useCallback((t1: string, t2: string) => {
    initGame(shuffle([...QUESTIONS[difficulty]]), difficulty, t1, t2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, lang]);

  const startCustomGame = useCallback((t1: string, t2: string) => {
    const qs: Question[] = shuffle(
      customQuestions.map(q => ({
        cat:  { en: q.category, ar: q.category },
        q:    { en: q.question,  ar: q.question },
        opts: { en: q.options,   ar: q.options  },
        ans:  q.answer,
      }))
    );
    initGame(qs, 'custom', t1, t2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customQuestions, lang]);

  // ── Always-fresh refs (updated every render) ──────────
  // showResults uses scores/teamNames/etc. from latest render
  showResultsRef.current = () => {
    stopTimer();
    let color = '#ffd60a';
    if (scores[0] > scores[1]) color = '#e63946';
    else if (scores[1] > scores[0]) color = '#1d7cc4';
    setConfettiColor(color);
    setConfettiActive(true);

    if (user) {
      saveEntry({
        id: `tq-${Date.now()}`,
        mobile: user.mobile,
        playerName: user.name,
        teams: [
          { name: teamNames[0], score: scores[0] },
          { name: teamNames[1], score: scores[1] },
        ],
        diff: gameDiff,
        mode: gameMode,
        total: questions.length,
        timestamp: Date.now(),
      });
    }
    setScreen('results');
  };

  advanceRoundRef.current = () => {
    const nextQ = currentQ + 1;
    if (nextQ >= questions.length) {
      showResultsRef.current();
      return;
    }
    const nextFirst: 0 | 1 = firstTeam === 0 ? 1 : 0;
    setCurrentQ(nextQ);
    setFirstTeam(nextFirst);
    setActiveTeam(nextFirst);
    setIsTransfer(false);
    setAnswered(false);
    setOptStates(['', '', '', '']);
    setFeedback(null);
    startTimer(15);
  };

  handleTimeoutRef.current = () => {
    if (answered) return;
    const otherTeam: 0 | 1 = activeTeam === 0 ? 1 : 0;

    if (!isTransfer) {
      setAnswered(true);
      setFeedback({ type: 'timeout', msg: `${teamNames[otherTeam]} ${t('fb_timeout_steal')}` });
      window.setTimeout(() => {
        setActiveTeam(otherTeam);
        setIsTransfer(true);
        setAnswered(false);
        setFeedback(null);
        setOptStates(['', '', '', '']);
        startTimer(5);
      }, 1600);
    } else {
      const q = questions[currentQ];
      if (!q) return;
      const optLabel = `${LABELS[q.ans]}: ${q.opts[lang][q.ans]}`;
      setAnswered(true);
      setOptStates(Array.from({ length: 4 }, (_, i) => (i === q.ans ? 'reveal' : '')) as OptionState[]);
      setFeedback({ type: 'wrong', msg: `${t('fb_steal_fail')} ${optLabel}` });
      window.setTimeout(() => advanceRoundRef.current(), 2000);
    }
  };

  // ── Handle answer ─────────────────────────────────────
  const handleAnswer = useCallback((chosen: number) => {
    if (answered) return;
    stopTimer();

    const q = questions[currentQ];
    const correct = chosen === q.ans;

    setOptStates(
      Array.from({ length: 4 }, (_, i) => {
        if (i === q.ans) return 'correct';
        if (i === chosen) return 'wrong';
        return '';
      }) as OptionState[]
    );
    setAnswered(true);

    if (correct) {
      setScores(prev => {
        const next: [number, number] = [...prev] as [number, number];
        next[activeTeam]++;
        return next;
      });
      setFeedback({ type: 'correct', msg: `${t('fb_correct')} ${teamNames[activeTeam]}` });
    } else {
      const optLabel = `${LABELS[q.ans]}: ${q.opts[lang][q.ans]}`;
      setFeedback({ type: 'wrong', msg: `${t('fb_wrong')} ${optLabel}` });
    }

    window.setTimeout(() => advanceRoundRef.current(), 2000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, questions, currentQ, activeTeam, teamNames, lang, t, stopTimer]);

  // ── Results / Play again ──────────────────────────────
  const playAgain = useCallback(() => {
    setConfettiActive(false);
    setCurrentQ(0);
    setScores([0, 0]);
    setFirstTeam(0);
    setActiveTeam(0);
    setIsTransfer(false);
    setAnswered(false);
    setOptStates(['', '', '', '']);
    setFeedback(null);
    setQuestions(prev => shuffle([...prev]));
    setScreen('game');
    startTimer(15);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goHome = useCallback(() => {
    stopTimer();
    setConfettiActive(false);
    setScreen('home');
  }, [stopTimer]);

  // ── Quit ─────────────────────────────────────────────
  const confirmQuit = useCallback(() => {
    stopTimer();
    setConfettiActive(false);
    setQuitModal(false);
    setScreen('home');
  }, [stopTimer]);

  return {
    screen, lang, t, toggleLang,
    user, goWelcome, goLogin, goGuest, doLogin, doLogout,
    difficulty, setDifficulty, gameMode, setGameMode,
    customQuestions, goBuilder, addCustomQuestion, deleteCustomQuestion,
    leaderboard, goLeaderboard, clearLeaderboard,
    startGame, startCustomGame,
    questions, currentQ, scores, teamNames, activeTeam, isTransfer,
    timeLeft, timerDuration, optStates, feedback,
    handleAnswer,
    gameDiff, playAgain, goHome,
    confettiActive, confettiColor,
    quitModal, clearModal, addQModal,
    openQuitModal:  () => setQuitModal(true),
    closeQuitModal: () => setQuitModal(false),
    confirmQuit,
    openClearModal:  () => setClearModal(true),
    closeClearModal: () => setClearModal(false),
    openAddQModal:   () => setAddQModal(true),
    closeAddQModal:  () => setAddQModal(false),
    circumference: CIRC,
  };
}
