export type Lang = 'en' | 'ar';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'ready' | 'custom';
export type GameStyle = 'trivia' | 'jeopardy';
export type Screen = 'welcome' | 'login' | 'home' | 'leaderboard' | 'builder' | 'game' | 'results' | 'jeopardy';
export type OptionState = '' | 'correct' | 'wrong' | 'reveal';

export interface User { mobile: string; name: string; }

export interface TriviaCategory { id: number; name: string; }

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

export interface JeopardyCell {
  question: Question;
  points: number;       // 100 | 200 | 300
  difficulty: Difficulty;
  used: boolean;
}

export interface JeopardyColumn {
  categoryId: number;
  categoryName: string;
  cells: JeopardyCell[]; // always 6: [easy, easy, medium, medium, hard, hard]
}
