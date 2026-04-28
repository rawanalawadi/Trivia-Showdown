import type { GameAPI } from '@/hooks/useGame';

const LABELS = ['A', 'B', 'C', 'D'] as const;

export default function GameScreen({ g }: { g: GameAPI }) {
  const q = g.questions[g.currentQ];
  if (!q) return null;

  const lang = g.lang;
  const total = g.questions.length;
  const progress = (g.currentQ / total) * 100;
  const ratio    = g.timeLeft / g.timerDuration;
  const offset   = g.circumference * (1 - ratio);
  const stroke   = ratio > 0.5 ? '#2dc653' : ratio > 0.25 ? '#ff9f43' : '#e63946';

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

      {/* Scoreboard */}
      <div className="scoreboard">
        <div className={`score-card${g.activeTeam === 0 ? ' at1' : ''}`}>
          <div className="score-lbl">{g.t('score_lbl')}</div>
          <div className="score-name t1">{g.teamNames[0]}</div>
          <div className="score-pts">{g.scores[0]}</div>
        </div>

        <div className="timer-col">
          <div className="timer-ring">
            <svg className="timer-svg" viewBox="0 0 64 64">
              <circle className="timer-track" cx="32" cy="32" r="27" />
              <circle
                className="timer-fill"
                cx="32" cy="32" r="27"
                strokeDasharray={g.circumference}
                strokeDashoffset={offset}
                style={{ stroke }}
              />
            </svg>
            <div className="timer-num" style={{ color: stroke }}>{g.timeLeft}</div>
          </div>
          <div className="timer-tag">
            {g.isTransfer ? g.t('lbl_steal') : g.t('lbl_seconds')}
          </div>
          <div className={badgeCls}>{badgeTxt}</div>
        </div>

        <div className={`score-card${g.activeTeam === 1 ? ' at2' : ''}`}>
          <div className="score-lbl">{g.t('score_lbl')}</div>
          <div className="score-name t2">{g.teamNames[1]}</div>
          <div className="score-pts">{g.scores[1]}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="q-meta">
        <span className="q-cat">{q.cat[lang]}</span>
        <span>{g.t('q_of')} {g.currentQ + 1} / {total}</span>
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

      {/* Feedback */}
      <div className={`feedback${g.feedback ? ' show fb-' + g.feedback.type : ''}`}>
        {g.feedback?.msg ?? ''}
      </div>
    </div>
  );
}
