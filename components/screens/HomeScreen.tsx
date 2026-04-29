'use client';

import { useState } from 'react';
import type { GameAPI } from '@/hooks/useGame';

const CAT_EMOJI: Record<string, string> = {
  'General Knowledge': '🧠',
  'Entertainment: Books': '📚',
  'Entertainment: Film': '🎬',
  'Entertainment: Music': '🎵',
  'Entertainment: Musicals & Theatres': '🎭',
  'Entertainment: Television': '📺',
  'Entertainment: Video Games': '🎮',
  'Entertainment: Board Games': '♟️',
  'Science & Nature': '🔬',
  'Science: Computers': '💻',
  'Science: Mathematics': '🔢',
  'Mythology': '⚡',
  'Sports': '⚽',
  'Geography': '🌍',
  'History': '🏛️',
  'Politics': '🗳️',
  'Art': '🎨',
  'Celebrities': '⭐',
  'Animals': '🐾',
  'Vehicles': '🚗',
  'Entertainment: Comics': '💬',
  'Science: Gadgets': '⚙️',
  'Entertainment: Japanese Anime & Manga': '🗾',
  'Entertainment: Cartoon & Animations': '🎪',
};

function catEmoji(name: string): string {
  return CAT_EMOJI[name] ?? '❓';
}

function catLabel(name: string): string {
  return name.replace(/^(Entertainment|Science): /, '');
}

type Step = 1 | 2 | 3;

export default function HomeScreen({ g }: { g: GameAPI }) {
  const [step, setStep] = useState<Step>(1);
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');

  const loggedIn = !!g.user;
  const isCustom = loggedIn && g.gameMode === 'custom';
  const completeCats = g.builderCategories.filter(c => c.questions.length === 6);
  const canPlayCustom = completeCats.length >= 1;

  function handleStart() {
    if (isCustom) g.startCustomGame(t1, t2);
    else          g.startGame(t1, t2);
  }

  // Loading screen while fetching questions
  if (g.isLoading) {
    return (
      <div className="screen" style={{ justifyContent: 'center', minHeight: '60vh' }}>
        <div className="loading-overlay">
          <div className="spinner" />
          <span>{g.t('lbl_loading')}</span>
        </div>
      </div>
    );
  }

  const selectedCount = g.selectedCategories.length;

  return (
    <div className="screen" style={{ paddingTop: 10 }}>

      {/* Header row: greeting + logout */}
      <div className="home-header">
        <div className="home-greeting">
          {loggedIn
            ? <>{g.t('home_welcome')} <span className="gold">{g.user!.name}</span></>
            : <span style={{ color: 'var(--muted)' }}>{g.t('home_guest')}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {loggedIn && (
            <button className="btn btn-ghost btn-sm" onClick={g.goLeaderboard}>🏆</button>
          )}
          {loggedIn && (
            <button className="btn btn-ghost btn-sm" onClick={g.doLogout}>
              {g.t('btn_logout')}
            </button>
          )}
        </div>
      </div>

      {/* API error notice */}
      {g.apiError && (
        <div className="feedback show fb-timeout" style={{ pointerEvents: 'auto' }}>
          {g.t(g.apiError)}
        </div>
      )}

      {/* Custom game mode toggle (logged-in only) */}
      {loggedIn && (
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button
            className={`diff-btn${g.gameMode === 'ready' ? ' sel-medium' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { g.setGameMode('ready'); setStep(1); }}
          >
            🎯 {g.t('mode_ready')}
          </button>
          <button
            className={`diff-btn${g.gameMode === 'custom' ? ' sel-easy' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { g.setGameMode('custom'); setStep(1); }}
          >
            ✏️ {g.t('mode_custom')}
          </button>
        </div>
      )}

      {/* ── CUSTOM GAME FLOW ──────────────── */}
      {isCustom ? (
        <>
          <div className="home-section" style={{ width: '100%' }}>
            <div className="section-label">{g.t('lbl_teams')}</div>
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
          {!canPlayCustom && (
            <p className="builder-play-note">{g.t('builder_play_note')}</p>
          )}
        </>
      ) : (
        /* ── READY-MADE 3-STEP FLOW ──────── */
        <>
          {/* Step indicator */}
          <div className="step-indicator">
            {([1, 2, 3] as Step[]).map((s, idx) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: idx < 2 ? 1 : 'none' }}>
                <div className={`step-dot${step === s ? ' active' : step > s ? ' done' : ''}`}>
                  {step > s ? '✓' : s}
                </div>
                {idx < 2 && <div className={`step-line${step > s ? ' done' : ''}`} />}
              </div>
            ))}
          </div>

          {/* ── STEP 1: TEAMS ── */}
          {step === 1 && (
            <div className="step-container">
              <div className="step-heading">
                <h2>{g.t('step_teams')}</h2>
                <p>{g.t('step_teams_sub')}</p>
              </div>

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
                <button className="btn btn-gold btn-full" onClick={() => setStep(2)}>
                  {g.t('lbl_next')}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: DIFFICULTY ── */}
          {step === 2 && (
            <div className="step-container">
              <div className="step-heading">
                <h2>{g.t('step_difficulty')}</h2>
                <p>{g.t('step_difficulty_sub')}</p>
              </div>

              <div className="diff-cards">
                {([
                  { d: 'easy',   icon: '🌱', lbl: g.t('diff_easy'),   desc: g.t('diff_easy_desc')   },
                  { d: 'medium', icon: '⚡', lbl: g.t('diff_medium'), desc: g.t('diff_medium_desc') },
                  { d: 'hard',   icon: '🔥', lbl: g.t('diff_hard'),   desc: g.t('diff_hard_desc')   },
                ] as const).map(({ d, icon, lbl, desc }) => (
                  <div
                    key={d}
                    className={`diff-card${g.difficulty === d ? ` sel-${d}` : ''}`}
                    onClick={() => g.setDifficulty(d)}
                  >
                    <div className="diff-card-icon">{icon}</div>
                    <div className="diff-card-label">{lbl}</div>
                    <div className="diff-card-desc">{desc}</div>
                  </div>
                ))}
              </div>

              <div className="step-nav">
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>
                  {g.t('btn_back')}
                </button>
                <button className="btn btn-gold" style={{ flex: 2 }} onClick={() => setStep(3)}>
                  {g.t('lbl_next')}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: CATEGORIES ── */}
          {step === 3 && (
            <div className="step-container">
              <div className="step-heading">
                <h2>{g.t('step_categories')}</h2>
                <p>{g.t('step_categories_sub')}</p>
              </div>

              <div className="cat-select-toolbar">
                <span className="cat-select-info">
                  {selectedCount > 0
                    ? <><strong>{selectedCount}</strong> {selectedCount === 1 ? 'topic' : 'topics'} selected</>
                    : <span>{g.t('cats_none_hint')}</span>}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={g.clearCategories}>
                    {g.t('cat_clear')}
                  </button>
                </div>
              </div>

              {g.categoriesLoading ? (
                <div className="loading-overlay">
                  <div className="spinner" />
                  <span>{g.t('cats_loading')}</span>
                </div>
              ) : (
                <div className="cat-pills">
                  {g.availableCategories.map(cat => (
                    <button
                      key={cat.id}
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
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(2)}>
                  {g.t('btn_back')}
                </button>
                <button className="btn btn-gold" style={{ flex: 2 }} onClick={handleStart}>
                  {g.t('lbl_start')}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Guest promo */}
      {!loggedIn && (
        <div className="guest-promo">
          <span>{g.t('guest_promo')} </span>
          <button onClick={g.goLogin}>{g.t('btn_login_now')}</button>
        </div>
      )}
    </div>
  );
}
