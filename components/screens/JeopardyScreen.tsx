'use client';

import type { GameAPI } from '@/hooks/useGame';

const LABELS = ['A', 'B', 'C', 'D'] as const;
const CIRC   = 2 * Math.PI * 27;

/** Row order: 0-1 = easy (100), 2-3 = medium (200), 4-5 = hard (300) */
const CELL_ROWS = [0, 1, 2, 3, 4, 5] as const;

const PT_COLOR: Record<number, string> = {
  100: 'var(--correct)',
  200: 'var(--gold)',
  300: 'var(--t1)',
};

export default function JeopardyScreen({ g }: { g: GameAPI }) {
  const inQuestion = g.jeopardyActiveCol !== null && g.jeopardyActiveCell !== null;

  /* ── QUESTION VIEW ── */
  if (inQuestion) {
    const col  = g.jeopardyBoard[g.jeopardyActiveCol!];
    const cell = col?.cells[g.jeopardyActiveCell!];
    if (!col || !cell) return null;

    const q       = cell.question;
    const lang    = g.lang;
    const ratio   = g.timeLeft / g.timerDuration;
    const offset  = CIRC * (1 - ratio);
    const stroke  = ratio > 0.5 ? '#34c759' : ratio > 0.25 ? '#ff9f0a' : '#ff2d55';

    return (
      <div className="screen" style={{ paddingTop: 4 }}>
        {/* Quit */}
        <div className="quit-row">
          <button className="btn btn-ghost btn-sm" onClick={g.openQuitModal}>{g.t('btn_quit')}</button>
        </div>

        {/* Scoreboard */}
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

        {/* Timer */}
        <div className="timer-row">
          <div className="timer-ring">
            <svg className="timer-svg" viewBox="0 0 64 64">
              <circle className="timer-track" cx="32" cy="32" r="27" />
              <circle className="timer-fill" cx="32" cy="32" r="27"
                strokeDasharray={CIRC} strokeDashoffset={offset} style={{ stroke }} />
            </svg>
            <div className="timer-num" style={{ color: stroke }}>{g.timeLeft}</div>
          </div>
          <div className={`turn-badge tb-t${g.activeTeam + 1}`}>{g.teamNames[g.activeTeam]}</div>
        </div>

        {/* Category + points badge */}
        <div className="j-question-meta">
          <span className="j-cat-name">{col.categoryName}</span>
          <span className="j-pts-badge" style={{ background: PT_COLOR[cell.points] }}>
            {cell.points} {g.t('pts')}
          </span>
        </div>

        {/* Question */}
        <div className="question-card">
          <div className="question-text">{q.q[lang]}</div>
        </div>

        {/* Options */}
        <div className="options-grid">
          {q.opts[lang].map((opt, i) => (
            <button key={i}
              className={`opt-btn${g.optStates[i] ? ` ${g.optStates[i]}` : ''}`}
              disabled={g.optStates.some(s => s !== '')}
              onClick={() => g.handleJeopardyAnswer(i)}
            >
              <span className="opt-lbl-btn">{LABELS[i]}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        {/* Feedback */}
        <div className={`feedback${g.feedback ? ' show fb-' + g.feedback.type : ''}`}>
          {g.feedback?.msg ?? ''}
        </div>
      </div>
    );
  }

  /* ── BOARD VIEW ── */
  const numCols = g.jeopardyBoard.length;

  return (
    <div className="screen" style={{ paddingTop: 4 }}>
      {/* Scores */}
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

      {/* Turn indicator */}
      <div className={`turn-badge tb-t${g.activeTeam + 1}`} style={{ alignSelf: 'center', fontSize: '.85rem', padding: '7px 22px' }}>
        {g.teamNames[g.activeTeam]}{g.t('jeopardy_turn')}
      </div>

      {/* Board — horizontal scroll on small screens */}
      <div className="j-board-wrapper">
        <div className="j-board" style={{ '--j-cols': numCols } as React.CSSProperties}>

          {/* Column headers */}
          {g.jeopardyBoard.map((col, ci) => (
            <div key={`h-${ci}`} className="j-header">{col.categoryName}</div>
          ))}

          {/* 6 rows of cells */}
          {CELL_ROWS.map(rowIdx =>
            g.jeopardyBoard.map((col, ci) => {
              const cell = col.cells[rowIdx];
              if (!cell) return <div key={`${ci}-${rowIdx}`} className="j-cell j-cell-empty" />;
              return (
                <button
                  key={`${ci}-${rowIdx}`}
                  className={`j-cell${cell.used ? ' used' : ''}`}
                  disabled={cell.used}
                  onClick={() => !cell.used && g.pickJeopardyCell(ci, rowIdx)}
                  style={cell.used ? {} : { color: PT_COLOR[cell.points] }}
                >
                  {cell.used ? '' : cell.points}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Quit */}
      <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-end' }} onClick={g.openQuitModal}>
        {g.t('btn_quit')}
      </button>
    </div>
  );
}
