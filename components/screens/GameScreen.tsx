'use client';

import { useState, useEffect } from 'react';
import { fetchRandomGif } from '@/lib/giphy';
import { fetchWikiSummary, type WikiSummary } from '@/lib/wikipedia';
import type { GameAPI } from '@/hooks/useGame';

const LABELS = ['A', 'B', 'C', 'D'] as const;
const CIRC = 2 * Math.PI * 27;

export default function GameScreen({ g }: { g: GameAPI }) {
  const q = g.questions[g.currentQ];

  const [correctGif, setCorrectGif] = useState<string | null>(null);
  const [wikiCard,   setWikiCard]   = useState<WikiSummary | null>(null);

  // Fetch GIF + Wikipedia snippet whenever a new feedback appears
  useEffect(() => {
    if (!q || !g.feedback) {
      setCorrectGif(null);
      setWikiCard(null);
      return;
    }
    // Wikipedia: fetch for the question's category (works for any result)
    fetchWikiSummary(q.cat.en).then(setWikiCard);
    // Giphy: only on correct answer
    if (g.feedback.type === 'correct') {
      fetchRandomGif('correct answer winner brilliant').then(setCorrectGif);
    } else {
      setCorrectGif(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.feedback]);

  if (!q) return null;

  const lang     = g.lang;
  const total    = g.questions.length;
  const progress = (g.currentQ / total) * 100;
  const ratio    = g.timeLeft / g.timerDuration;
  const offset   = CIRC * (1 - ratio);
  const stroke   = ratio > 0.5 ? '#34c759' : ratio > 0.25 ? '#ff9f0a' : '#ff2d55';

  const badgeCls = g.isTransfer ? 'turn-badge tb-steal' : `turn-badge tb-t${g.activeTeam + 1}`;
  const badgeTxt = g.isTransfer
    ? `${g.teamNames[g.activeTeam]} — ${g.t('lbl_steal')}`
    : g.teamNames[g.activeTeam];

  return (
    <div className="screen" style={{ paddingTop: 4 }}>
      {/* Quit */}
      <div className="quit-row">
        <button className="btn btn-ghost btn-sm" onClick={g.openQuitModal}>
          {g.t('btn_quit')}
        </button>
      </div>

      {/* Scoreboard — two team cards only */}
      <div className="scoreboard">
        <div className={`score-card${g.activeTeam === 0 ? ' at1' : ''}`}>
          <div className="score-lbl">{g.t('score_lbl')}</div>
          <div className="score-name t1">{g.teamNames[0]}</div>
          <div className="score-pts">{g.scores[0]}</div>
        </div>

        <div className={`score-card${g.activeTeam === 1 ? ' at2' : ''}`}>
          <div className="score-lbl">{g.t('score_lbl')}</div>
          <div className="score-name t2">{g.teamNames[1]}</div>
          <div className="score-pts">{g.scores[1]}</div>
        </div>
      </div>

      {/* Timer + turn badge — centered below scoreboard */}
      <div className="timer-row">
        <div className="timer-ring">
          <svg className="timer-svg" viewBox="0 0 64 64">
            <circle className="timer-track" cx="32" cy="32" r="27" />
            <circle
              className="timer-fill"
              cx="32" cy="32" r="27"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              style={{ stroke }}
            />
          </svg>
          <div className="timer-num" style={{ color: stroke }}>{g.timeLeft}</div>
        </div>
        <div className={badgeCls}>{badgeTxt}</div>
      </div>

      {/* Progress */}
      <div className="q-meta">
        <span className="q-cat">
          {q.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={q.imageUrl} alt="" className="q-cat-img" />
          )}
          {q.cat[lang]}
        </span>
        <span>{g.currentQ + 1} / {total}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="question-card">
        <div className="question-text">{q.q[lang]}</div>
      </div>

      {/* Options */}
      <div className="options-grid">
        {q.opts[lang].map((opt, i) => (
          <button
            key={i}
            className={`opt-btn${g.optStates[i] ? ` ${g.optStates[i]}` : ''}`}
            disabled={g.optStates.some(s => s !== '')}
            onClick={() => g.handleAnswer(i)}
          >
            <span className="opt-lbl-btn">{LABELS[i]}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>

      {/* Feedback (+ optional celebration GIF) */}
      <div className={`feedback${g.feedback ? ' show fb-' + g.feedback.type : ''}`}>
        {g.feedback?.msg ?? ''}
        {correctGif && g.feedback?.type === 'correct' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={correctGif} alt="🎉" className="feedback-gif" />
        )}
      </div>

      {/* Wikipedia "Did you know?" card */}
      {wikiCard && g.feedback && (
        <div className="wiki-card">
          {wikiCard.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={wikiCard.thumbnail.source} alt="" className="wiki-card-thumb" />
          )}
          <div className="wiki-card-body">
            <div className="wiki-card-label">📖 Did you know?</div>
            <div className="wiki-card-title">{wikiCard.title}</div>
            <div className="wiki-card-text">{wikiCard.extract}</div>
          </div>
        </div>
      )}
    </div>
  );
}
