export type Lang = 'en' | 'ar';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'ready' | 'custom';
export type Screen = 'welcome' | 'login' | 'home' | 'leaderboard' | 'builder' | 'game' | 'results';
export type OptionState = '' | 'correct' | 'wrong' | 'reveal';

export interface User { mobile: string; name: string; }

export interface Question {
  cat: { en: string; ar: string };
  q: { en: string; ar: string };
  opts: { en: string[]; ar: string[] };
  ans: number;
  imageUrl?: string;
}

export interface CustomQuestion { question: string; options: string[]; answer: number; category: string; }

export interface BuilderCategory {
  id: string;
  name: string;
  imageUrl: string;
  questions: CustomQuestion[];
}

export interface FeedbackState { type: 'correct' | 'wrong' | 'timeout'; msg: string; }

export interface LeaderboardEntry {
  id: string;
  mobile: string;
  playerName: string;
  teams: Array<{ name: string; score: number }>;
  diff: string;
  mode: string;
  total: number;
  timestamp: number;
}
