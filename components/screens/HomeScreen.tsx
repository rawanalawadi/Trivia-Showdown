'use client';

import { useState } from 'react';
import type { GameAPI } from '@/hooks/useGame';

const CAT_EMOJI: Record<string, string> = {
  'General Knowledge': '🧠', 'Entertainment: Books': '📚',
  'Entertainment: Film': '🎬', 'Entertainment: Music': '🎵',
  'Entertainment: Musicals & Theatres': '🎭', 'Entertainment: Television': '📺',
  'Entertainment: Video Games': '🎮', 'Entertainment: Board Games': '♟️',
  'Science & Nature': '🔬', 'Science: Computers': '💻',
  'Science: Mathematics': '🔢', 'Mythology': '⚡', 'Sports': '⚽',
  'Geography': '🌍', 'History': '🏛️', 'Politics': '🗳️', 'Art': '🎨',
  'Celebrities': '⭐', 'Animals': '🐾', 'Vehicles': '🚗',
  'Entertainment: Comics': '💬', 'Science: Gadgets': '⚙️',
  'Entertainment: Japanese Anime & Manga': '🗾',
  'Entertainment: Cartoon & Animations': '🎪',
};
const catEmoji = (name: string) => CAT_EMOJI[name] ?? '❓';
const catLabel = (name: string) => name.replace(/^(Entertainment|Science): /, '');

const Q_OPTIONS = [10, 20, 30] as const;

export default function HomeScreen({ g }: { g: GameAPI }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');

  const loggedIn   = !!g.user;
  const isCustom   = loggedIn && g.gameMode === 'custom';
  const isJeopardy = g.gameStyle === 'jeopardy';

  const completeCats  = g.builderCategories.filter(c => c.questions.length === 6);
  const canPlayCustom = completeCats.length >= 1;
  const selectedCount = g.selectedCategories.length;
  const jeopardyCats  = g.selectedCategories.slice(0, 6);

  function handleStart() {
    if (isCustom)        g.startCustomGame(t1, t2);
    else if (isJeopardy) g.startJeopardyGame(t1, t2);
    else                 g.startGame(t1, t2);
  }

  const steps = isJeopardy
    ? [g.t('step_teams'), g.t('style_title'), g.t('step_jeopardy_cats')]
    : [g.t('step_teams'), g.t('style_title'), g.t('step_settings'), g.t('step_categories')];
  const totalSteps = steps.length;

  if (g.isLoading) {
    return (
      <div className="screen" style={{ justifyContent: 'center', minHeight: '60vh' }}>
        <div className="loading-overlay"><div className="spinner" /><span>{g.t('lbl_loading')}</span></div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ paddingTop: 10 }}>

      {/* Header */}
      <div className="home-header">
        <div className="home-greeting">
          {loggedIn
            ? <>{g.t('home_welcome')} <span className="gold">{g.user!.name}</span></>
            : <span style={{ color: 'var(--muted)' }}>{g.t('home_guest')}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {loggedIn && <button className="btn btn-ghost btn-sm" onClick={g.goLeaderboard}>🏆</button>}
          {loggedIn && <button className="btn btn-ghost btn-sm" onClick={g.doLogout}>{g.t('btn_logout')}</button>}
        </div>
      </div>

      {g.apiError && (
        <div className="feedback show fb-timeout" style={{ pointerEvents: 'auto' }}>
          {g.t(g.apiError)}
        </div>
      )}

      {/* Game mode toggle */}
      {loggedIn && (
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button
            className={`diff-btn${g.gameMode === 'ready' ? ' sel-medium' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { g.setGameMode('ready'); setStep(1); }}
          >🎯 {g.t('mode_ready')}</button>
          <button
            className={`diff-btn${g.gameMode === 'custom' ? ' sel-easy' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { g.setGameMode('custom'); setStep(1); }}
          >✏️ {g.t('mode_custom')}</button>
        </div>
      )}

      {/* ── CUSTOM GAME ── */}
      {isCustom ? (
        <>
          <div style={{ width: '100%' }}>
            <div className="team-row">
              <div className="field">
                <label className="lbl-t1">{g.t('label_t1')}</label>
                <input className="input" type="text" placeholder={g.t('ph_t1')}
                  value={t1} maxLength={20} onChange={e => setT1(e.target.value)} />
              </div>
              <div className="field">
                <label className="lbl-t2">{g.t('label_t2')}</label>
                <input className="input" type="text" placeholder={g.t('ph_t2')}
                  value={t2} maxLength={20} onChange={e => setT2(e.target.value)} />
              </div>
            </div>
          </div>
          <button className="btn btn-gold btn-full" onClick={handleStart} disabled={!canPlayCustom}>
            {g.t('btn_start')}
          </button>
          <button className="btn btn-purple btn-full" onClick={g.goBuilder}>
            {g.t('btn_build')}
          </button>
          {!canPlayCustom && <p className="builder-play-note">{g.t('builder_play_note')}</p>}
        </>
      ) : (
        /* ── READY-MADE / JEOPARDY WIZARD ── */
        <>
          {/* Dynamic step indicator */}
          <div className="step-indicator">
            {steps.map((_, idx) => {
              const s = idx + 1;
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: idx < totalSteps - 1 ? 1 : 'none' }}>
                  <div className={`step-dot${step === s ? ' active' : step > s ? ' done' : ''}`}>
                    {step > s ? '✓' : s}
                  </div>
                  {idx < totalSteps - 1 && <div className={`step-line${step > s ? ' done' : ''}`} />}
                </div>
              );
            })}
          </div>

          {/* STEP 1 — Teams */}
          {step === 1 && (
            <div className="step-container">
              <div className="step-heading"><h2>{g.t('step_teams')}</h2><p>{g.t('step_teams_sub')}</p></div>
              <div className="team-row">
                <div className="field">
                  <label className="lbl-t1">{g.t('label_t1')}</label>
                  <input className="input" type="text" placeholder={g.t('ph_t1')}
                    value={t1} maxLength={20} onChange={e => setT1(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && setStep(2)} />
                </div>
                <div className="field">
                  <label className="lbl-t2">{g.t('label_t2')}</label>
                  <input className="input" type="text" placeholder={g.t('ph_t2')}
                    value={t2} maxLength={20} onChange={e => setT2(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && setStep(2)} />
                </div>
              </div>
              <div className="step-nav">
                <button className="btn btn-gold btn-full" onClick={() => setStep(2)}>{g.t('lbl_next')}</button>
              </div>
            </div>
          )}

          {/* STEP 2 — Style selection */}
          {step === 2 && (
            <div className="step-container">
              <div className="step-heading"><h2>{g.t('style_title')}</h2><p>{g.t('style_sub')}</p></div>
              <div className="style-cards">
                <div
                  className={`style-card${g.gameStyle === 'trivia' ? ' selected' : ''}`}
                  onClick={() => g.setGameStyle('trivia')}
                >
                  <div className="style-card-icon">🎯</div>
                  <div className="style-card-label">{g.t('style_trivia')}</div>
                  <div className="style-card-desc">{g.t('style_trivia_desc')}</div>
                </div>
                <div
                  className={`style-card${g.gameStyle === 'jeopardy' ? ' selected' : ''}`}
                  onClick={() => g.setGameStyle('jeopardy')}
                >
                  <div className="style-card-icon">🏆</div>
                  <div className="style-card-label">{g.t('style_jeopardy')}</div>
                  <div className="style-card-desc">{g.t('style_jeopardy_desc')}</div>
                </div>
              </div>
              <div className="step-nav">
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>{g.t('btn_back')}</button>
                <button className="btn btn-gold" style={{ flex: 2 }} onClick={() => setStep(3)}>{g.t('lbl_next')}</button>
              </div>
            </div>
          )}

          {/* STEP 3 — Trivia settings (difficulty + count) */}
          {step === 3 && !isJeopardy && (
            <div className="step-container">
              <div className="step-heading"><h2>{g.t('step_settings')}</h2><p>{g.t('step_settings_sub')}</p></div>

              <div className="diff-cards">
                {([
                  { d: 'easy',   icon: '🌱', lbl: g.t('diff_easy'),   desc: g.t('diff_easy_desc')   },
                  { d: 'medium', icon: '⚡', lbl: g.t('diff_medium'), desc: g.t('diff_medium_desc') },
                  { d: 'hard',   icon: '🔥', lbl: g.t('diff_hard'),   desc: g.t('diff_hard_desc')   },
                ] as const).map(({ d, icon, lbl, desc }) => (
                  <div key={d} className={`diff-card${g.difficulty === d ? ` sel-${d}` : ''}`} onClick={() => g.setDifficulty(d)}>
                    <div className="diff-card-icon">{icon}</div>
                    <div className="diff-card-label">{lbl}</div>
                    <div className="diff-card-desc">{desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ width: '100%' }}>
                <div className="section-label" style={{ marginBottom: 10 }}>{g.t('step_count_label')}</div>
                <div className="q-count-row">
                  {Q_OPTIONS.map(n => (
                    <button key={n}
                      className={`q-count-btn${g.numQuestions === n ? ' selected' : ''}`}
                      onClick={() => g.setNumQuestions(n)}
                    >{n}</button>
                  ))}
                </div>
              </div>

              <div className="step-nav">
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(2)}>{g.t('btn_back')}</button>
                <button className="btn btn-gold" style={{ flex: 2 }} onClick={() => setStep(4)}>{g.t('lbl_next')}</button>
              </div>
            </div>
          )}

          {/* STEP 3 — Jeopardy categories (max 6) */}
          {step === 3 && isJeopardy && (
            <div className="step-container">
              <div className="step-heading"><h2>{g.t('step_jeopardy_cats')}</h2><p>{g.t('step_jeopardy_cats_sub')}</p></div>

              <div className="cat-select-toolbar">
                <span className="cat-select-info">
                  {jeopardyCats.length > 0
                    ? <><strong>{jeopardyCats.length}</strong> / 6 selected</>
                    : <span>{g.t('cats_none_hint')}</span>}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={g.clearCategories}>{g.t('cat_clear')}</button>
              </div>

              {g.categoriesLoading ? (
                <div className="loading-overlay"><div className="spinner" /><span>{g.t('cats_loading')}</span></div>
              ) : (
                <div className="cat-grid-select">
                  {g.availableCategories.map(cat => {
                    const isSel    = g.selectedCategories.includes(cat.id);
                    const atLimit  = jeopardyCats.length >= 6 && !isSel;
                    return (
                      <button key={cat.id}
                        className={`cat-pill${isSel ? ' selected' : ''}${atLimit ? ' at-limit' : ''}`}
                        onClick={() => !atLimit && g.toggleCategory(cat.id)}
                        disabled={atLimit}
                      >
                        <span className="cat-pill-emoji">{catEmoji(cat.name)}</span>
                        <span>{catLabel(cat.name)}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="step-nav">
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(2)}>{g.t('btn_back')}</button>
                <button className="btn btn-gold" style={{ flex: 2 }} onClick={handleStart} disabled={jeopardyCats.length === 0}>
                  {g.t('lbl_start')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Trivia categories */}
          {step === 4 && !isJeopardy && (
            <div className="step-container">
              <div className="step-heading"><h2>{g.t('step_categories')}</h2><p>{g.t('step_categories_sub')}</p></div>

              <div className="cat-select-toolbar">
                <span className="cat-select-info">
                  {selectedCount > 0
                    ? <><strong>{selectedCount}</strong> {selectedCount === 1 ? 'topic' : 'topics'} selected</>
                    : <span>{g.t('cats_none_hint')}</span>}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={g.clearCategories}>{g.t('cat_clear')}</button>
              </div>

              {g.categoriesLoading ? (
                <div className="loading-overlay"><div className="spinner" /><span>{g.t('cats_loading')}</span></div>
              ) : (
                <div className="cat-grid-select">
                  {g.availableCategories.map(cat => (
                    <button key={cat.id}
                      className={`cat-pill${g.selectedCategories.includes(cat.id) ? ' selected' : ''}`}
                      onClick={() => g.toggleCategory(cat.id)}
                    >
                      <span className="cat-pill-emoji">{catEmoji(cat.name)}</span>
                      <span>{catLabel(cat.name)}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="step-nav">
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(3)}>{g.t('btn_back')}</button>
                <button className="btn btn-gold" style={{ flex: 2 }} onClick={handleStart}>{g.t('lbl_start')}</button>
              </div>
            </div>
          )}
        </>
      )}

      {!loggedIn && (
        <div className="guest-promo">
          <span>{g.t('guest_promo')} </span>
          <button onClick={g.goLogin}>{g.t('btn_login_now')}</button>
        </div>
      )}
    </div>
  );
}
