'use client';

import { useState } from 'react';
import type { GameAPI } from '@/hooks/useGame';

export default function HomeScreen({ g }: { g: GameAPI }) {
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');
  const loggedIn = !!g.user;
  const isCustom = loggedIn && g.gameMode === 'custom';

  const completeCats = g.builderCategories.filter(c => c.questions.length === 6);
  const canPlayCustom = completeCats.length >= 1;

  function handleStart() {
    if (isCustom) {
      g.startCustomGame(t1, t2);
    } else {
      g.startGame(t1, t2);
    }
  }

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

  return (
    <div className="screen" style={{ paddingTop: 10 }}>
      {/* Header */}
      <div className="home-header">
        <div className="home-greeting">
          {loggedIn
            ? <>{g.t('home_welcome')} <span className="gold">{g.user!.name}</span></>
            : <span style={{ color: 'var(--muted)' }}>{g.t('home_guest')}</span>}
        </div>
        {loggedIn && (
          <button className="btn btn-ghost btn-sm" onClick={g.doLogout}>
            {g.t('btn_logout')}
          </button>
        )}
      </div>

      {/* API error notice */}
      {g.apiError && (
        <div className="feedback show fb-timeout" style={{ pointerEvents: 'auto' }}>
          {g.t(g.apiError)}
        </div>
      )}

      {/* Game mode (logged-in only) */}
      {loggedIn && (
        <div className="home-section">
          <div className="section-label">{g.t('lbl_mode')}</div>
          <div className="mode-row">
            <div
              className={`mode-card${g.gameMode === 'ready' ? ' selected' : ''}`}
              onClick={() => g.setGameMode('ready')}
            >
              <div className="mode-icon">🎯</div>
              <div className="mode-label">{g.t('mode_ready')}</div>
              <div className="mode-desc">{g.t('mode_ready_desc')}</div>
            </div>
            <div
              className={`mode-card${g.gameMode === 'custom' ? ' selected' : ''}`}
              onClick={() => g.setGameMode('custom')}
            >
              <div className="mode-icon">✏️</div>
              <div className="mode-label">{g.t('mode_custom')}</div>
              <div className="mode-desc">{g.t('mode_custom_desc')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Difficulty (ready-made only) */}
      {!isCustom && (
        <div className="home-section">
          <div className="section-label">{g.t('lbl_difficulty')}</div>
          <div className="diff-row">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                className={`diff-btn${g.difficulty === d ? ` sel-${d}` : ''}`}
                onClick={() => g.setDifficulty(d)}
              >
                {g.t(`diff_${d}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Team names */}
      <div className="home-section">
        <div className="section-label">{g.t('lbl_teams')}</div>
        <div className="team-row">
          <div className="field">
            <label className="lbl-t1">{g.t('label_t1')}</label>
            <input
              className="input" type="text" placeholder={g.t('ph_t1')}
              value={t1} maxLength={20} onChange={e => setT1(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="lbl-t2">{g.t('label_t2')}</label>
            <input
              className="input" type="text" placeholder={g.t('ph_t2')}
              value={t2} maxLength={20} onChange={e => setT2(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Start button */}
      <button
        className="btn btn-gold btn-full"
        onClick={handleStart}
        disabled={isCustom && !canPlayCustom}
      >
        {g.t('btn_start')}
      </button>

      {/* Custom builder link (logged in) */}
      {loggedIn && (
        <button className="btn btn-purple btn-full" onClick={g.goBuilder}>
          {g.t('btn_build')}
        </button>
      )}

      {/* Footer actions */}
      {loggedIn ? (
        <div className="home-footer">
          <button className="btn btn-blue btn-full" style={{ flex: 1 }} onClick={g.goLeaderboard}>
            <span>🏆</span><span>{g.t('btn_lb')}</span>
          </button>
        </div>
      ) : (
        <div className="guest-promo">
          <span>{g.t('guest_promo')} </span>
          <button onClick={g.goLogin}>{g.t('btn_login_now')}</button>
        </div>
      )}
    </div>
  );
}
