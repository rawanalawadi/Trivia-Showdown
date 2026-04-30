'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { QUESTIONS, STRINGS, LABELS } from '@/lib/data';
import { lsGet, lsSet } from '@/lib/storage';
import type {
  Lang, Difficulty, GameMode, Screen,
  User, Question, CustomQuestion, BuilderCategory,
  TriviaCategory, FeedbackState, OptionState, LeaderboardEntry,
} from '@/lib/types';

const CIRC = 2 * Math.PI * 27;

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

function decodeHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  const el = document.createElement('textarea');
  el.innerHTML = html;
  return el.value;
}

interface TDBResult {
  category: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

function mapTDBQuestion(r: TDBResult): Question {
  const allOpts = shuffle([r.correct_answer, ...r.incorrect_answers]).map(decodeHtml);
  const decodedCorrect = decodeHtml(r.correct_answer);
  const ans = allOpts.indexOf(decodedCorrect);
  return {
    cat: { en: r.category, ar: r.category },
    q:   { en: decodeHtml(r.question), ar: decodeHtml(r.question) },
    opts: { en: allOpts, ar: allOpts },
    ans,
  };
}

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

  // API categories
  availableCategories: TriviaCategory[];
  selectedCategories: number[];
  categoriesLoading: boolean;
  toggleCategory: (id: number) => void;
  selectAllCategories: () => void;
  clearCategories: () => void;

  // Builder (category-based)
  builderCategories: BuilderCategory[];
  goBuilder: () => void;
  addBuilderCategory: (name: string, imageUrl: string) => void;
  deleteBuilderCategory: (id: string) => void;
  addQuestionToCategory: (categoryId: string, q: CustomQuestion) => void;
  deleteQuestionFromCategory: (categoryId: string, qIndex: number) => void;

  leaderboard: LeaderboardEntry[];
  goLeaderboard: () => void;
  clearLeaderboard: () => void;

  isLoading: boolean;
  apiError: string | null;
  clearApiError: () => void;

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
  addQCategoryId: string | null;
  addCategoryModal: boolean;
  openQuitModal: () => void;
  closeQuitModal: () => void;
  confirmQuit: () => void;
  openClearModal: () => void;
  closeClearModal: () => void;
  openAddQModal: (categoryId: string) => void;
  closeAddQModal: () => void;
  openAddCategoryModal: () => void;
  closeAddCategoryModal: () => void;

  circumference: number;
  formatDate: (ts: number) => string;
}

export function useGame(): GameAPI {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [lang, setLang] = useState<Lang>('en');
  const [user, setUser] = useState<User | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('ready');
  const [builderCategories, setBuilderCategories] = useState<BuilderCategory[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // API categories
  const [availableCategories, setAvailableCategories] = useState<TriviaCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [otdbToken, setOtdbToken] = useState<string | null>(null);

  const [quitModal, setQuitModal] = useState(false);
  const [clearModal, setClearModal] = useState(false);
  const [addQModal, setAddQModal] = useState(false);
  const [addQCategoryId, setAddQCategoryId] = useState<string | null>(null);
  const [addCategoryModal, setAddCategoryModal] = useState(false);

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

  const [timeLeft, setTimeLeft] = useState(15);
  const [timerDuration, setTimerDuration] = useState(15);
  const [timerActive, setTimerActive] = useState(false);

  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiColor, setConfettiColor] = useState('#e8b84b');

  const handleTimeoutRef = useRef<() => void>(() => {});
  const advanceRoundRef  = useRef<() => void>(() => {});
  const showResultsRef   = useRef<() => void>(() => {});

  const t = useCallback((key: string): string =>
    (STRINGS[lang] as Record<string, string>)[key] ?? key,
  [lang]);

  // Fetch available categories on mount
  useEffect(() => {
    setCategoriesLoading(true);
    fetch('https://opentdb.com/api_category.php')
      .then(r => r.json())
      .then((d: { trivia_categories: TriviaCategory[] }) => {
        if (d.trivia_categories) setAvailableCategories(d.trivia_categories);
      })
      .catch(() => {})
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Request an OpenTDB session token on mount — prevents repeat questions
  useEffect(() => {
    fetch('https://opentdb.com/api_token.php?command=request')
      .then(r => r.json())
      .then(d => { if (d.response_code === 0) setOtdbToken(d.token as string); })
      .catch(() => {});
  }, []);

  // Restore session from localStorage
  useEffect(() => {
    const savedLang = lsGet<Lang>('tq_lang', 'en');
    setLang(savedLang);
    document.documentElement.lang = savedLang;
    document.documentElement.dir  = savedLang === 'ar' ? 'rtl' : 'ltr';

    const savedUser = lsGet<User | null>('tq_user', null);
    if (savedUser?.mobile && savedUser?.name) {
      setUser(savedUser);
      setBuilderCategories(lsGet<BuilderCategory[]>(`tq_categories_${savedUser.mobile}`, []));
    }
    setLeaderboard(lsGet<LeaderboardEntry[]>('tq_leaderboard', []));
  }, []);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next: Lang = prev === 'en' ? 'ar' : 'en';
      lsSet('tq_lang', next);
      document.documentElement.lang = next;
      document.documentElement.dir  = next === 'ar' ? 'rtl' : 'ltr';
      return next;
    });
  }, []);

  const goWelcome = useCallback(() => setScreen('welcome'), []);
  const goLogin   = useCallback(() => setScreen('login'),   []);
  const goGuest   = useCallback(() => setScreen('home'),    []);

  const doLogin = useCallback((mobile: string, name: string): 'ok' | 'err_mobile' | 'err_name' => {
    if (!/^\+?[\d\s\-]{7,15}$/.test(mobile)) return 'err_mobile';
    if (name.trim().length < 2) return 'err_name';
    const u: User = { mobile: mobile.replace(/\D/g, ''), name: name.trim() };
    setUser(u);
    lsSet('tq_user', u);
    setBuilderCategories(lsGet<BuilderCategory[]>(`tq_categories_${u.mobile}`, []));
    setScreen('home');
    return 'ok';
  }, []);

  const doLogout = useCallback(() => {
    setUser(null);
    lsSet('tq_user', null);
    setBuilderCategories([]);
    setScreen('welcome');
  }, []);

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

  const goBuilder = useCallback(() => setScreen('builder'), []);

  const addBuilderCategory = useCallback((name: string, imageUrl: string) => {
    setBuilderCategories(prev => {
      const next: BuilderCategory[] = [...prev, { id: `cat-${Date.now()}`, name: name.trim(), imageUrl, questions: [] }];
      if (user) lsSet(`tq_categories_${user.mobile}`, next);
      return next;
    });
  }, [user]);

  const deleteBuilderCategory = useCallback((id: string) => {
    setBuilderCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      if (user) lsSet(`tq_categories_${user.mobile}`, next);
      return next;
    });
  }, [user]);

  const addQuestionToCategory = useCallback((categoryId: string, q: CustomQuestion) => {
    setBuilderCategories(prev => {
      const next = prev.map(c =>
        c.id === categoryId && c.questions.length < 6
          ? { ...c, questions: [...c.questions, q] }
          : c
      );
      if (user) lsSet(`tq_categories_${user.mobile}`, next);
      return next;
    });
  }, [user]);

  const deleteQuestionFromCategory = useCallback((categoryId: string, qIndex: number) => {
    setBuilderCategories(prev => {
      const next = prev.map(c =>
        c.id === categoryId
          ? { ...c, questions: c.questions.filter((_, i) => i !== qIndex) }
          : c
      );
      if (user) lsSet(`tq_categories_${user.mobile}`, next);
      return next;
    });
  }, [user]);

  const toggleCategory = useCallback((id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }, []);

  const selectAllCategories = useCallback(() => {
    setSelectedCategories(prev => {
      // If all are already selected, clear; otherwise select all
      return prev.length === 0 ? prev : [];
    });
  }, []);

  const clearCategories = useCallback(() => setSelectedCategories([]), []);

  // Timer tick
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const id = window.setTimeout(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearTimeout(id);
  }, [timerActive, timeLeft]);

  // Timeout trigger
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
    setIsLoading(true);
    setApiError(null);

    const catIds = selectedCategories;
    const totalAmount = 30;

    const tokenSuffix = otdbToken ? `&token=${otdbToken}` : '';
    const urls = catIds.length > 0
      ? catIds.map(id =>
          `https://opentdb.com/api.php?amount=${Math.max(5, Math.ceil(totalAmount / catIds.length))}&category=${id}&type=multiple&difficulty=${difficulty}${tokenSuffix}`
        )
      : [`https://opentdb.com/api.php?amount=${totalAmount}&type=multiple&difficulty=${difficulty}${tokenSuffix}`];

    Promise.all(urls.map(url => fetch(url).then(r => r.json())))
      .then((results: Array<{ response_code: number; results: TDBResult[] }>) => {
        // Token exhausted (code 4) — reset it silently so next game gets fresh questions
        if (otdbToken && results.some(d => d.response_code === 4)) {
          fetch(`https://opentdb.com/api_token.php?command=reset&token=${otdbToken}`)
            .then(r => r.json())
            .then(d => { if (d.response_code === 0) setOtdbToken(d.token as string); })
            .catch(() => {});
        }
        const qs = results.flatMap(d =>
          d.response_code === 0 && d.results ? d.results.map(mapTDBQuestion) : []
        );
        if (qs.length === 0) throw new Error('no_results');
        initGame(shuffle(qs), difficulty, t1, t2);
      })
      .catch(() => {
        setApiError('err_api');
        initGame(shuffle([...QUESTIONS[difficulty]]), difficulty, t1, t2);
      })
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, selectedCategories, lang, otdbToken]);

  const startCustomGame = useCallback((t1: string, t2: string) => {
    const qs: Question[] = shuffle(
      builderCategories.flatMap(cat =>
        cat.questions.map(q => ({
          cat:  { en: cat.name, ar: cat.name },
          q:    { en: q.question, ar: q.question },
          opts: { en: q.options,  ar: q.options  },
          ans:  q.answer,
          imageUrl: cat.imageUrl || undefined,
        }))
      )
    );
    initGame(qs, 'custom', t1, t2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builderCategories, lang]);

  // Always-fresh refs
  showResultsRef.current = () => {
    stopTimer();
    let color = '#e8b84b';
    if (scores[0] > scores[1]) color = '#e05555';
    else if (scores[1] > scores[0]) color = '#3aaa8a';
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
    availableCategories, selectedCategories, categoriesLoading,
    toggleCategory, selectAllCategories, clearCategories,
    builderCategories, goBuilder, addBuilderCategory, deleteBuilderCategory,
    addQuestionToCategory, deleteQuestionFromCategory,
    leaderboard, goLeaderboard, clearLeaderboard,
    isLoading, apiError, clearApiError: () => setApiError(null),
    startGame, startCustomGame,
    questions, currentQ, scores, teamNames, activeTeam, isTransfer,
    timeLeft, timerDuration, optStates, feedback,
    handleAnswer,
    gameDiff, playAgain, goHome,
    confettiActive, confettiColor,
    quitModal, clearModal, addQModal, addQCategoryId, addCategoryModal,
    openQuitModal:         () => setQuitModal(true),
    closeQuitModal:        () => setQuitModal(false),
    confirmQuit,
    openClearModal:        () => setClearModal(true),
    closeClearModal:       () => setClearModal(false),
    openAddQModal:         (categoryId: string) => { setAddQCategoryId(categoryId); setAddQModal(true); },
    closeAddQModal:        () => { setAddQModal(false); setAddQCategoryId(null); },
    openAddCategoryModal:  () => setAddCategoryModal(true),
    closeAddCategoryModal: () => setAddCategoryModal(false),
    circumference: CIRC,
    formatDate,
  };
}
