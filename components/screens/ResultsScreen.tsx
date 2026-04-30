'use client';

import { useState, useEffect } from 'react';
import { fetchRandomGif } from '@/lib/giphy';
import type { GameAPI } from '@/hooks/useGame';

export default function ResultsScreen({ g }: { g: GameAPI }) {
  const [celebGif, setCelebGif] = useState<string | null>(null);

  useEffect(() => {
    fetchRandomGif('celebration confetti party winner').then(setCelebGif);
  }, []);

  const [s0, s1] = g.scores;
  let bannerCls = 'winner-banner wb-draw';
  let bannerTxt = g.t('draw_msg');
  if (s0 > s1) { bannerCls = 'winner-banner wb-t1'; bannerTxt = `🏆 ${g.teamNames[0]} ${g.t('winner_wins')}`; }
  if (s1 > s0) { bannerCls = 'winner-banner wb-t2'; bannerTxt = `🏆 ${g.teamNames[1]} ${g.t('winner_wins')}`; }

  return (
    <div className="screen" style={{ paddingTop: 20, textAlign: 'center' }}>
      <div className="results-title">{g.t('results_title')}</div>
      <div className={bannerCls}>{bannerTxt}</div>

      {celebGif && (
        <div className="results-gif">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={celebGif} alt="🎉" />
        </div>
      )}

      <div className="final-scores">
        <div className={`fs-card${s0 > s1 ? ' winner' : ''}`}>
          <div className="fs-team-lbl">{g.t('score_lbl')}</div>
          <div className="fs-team-name fs-t1">{g.teamNames[0]}</div>
          <div className="fs-pts fs-t1">{s0}</div>
        </div>
        <div className={`fs-card${s1 > s0 ? ' winner' : ''}`}>
          <div className="fs-team-lbl">{g.t('score_lbl')}</div>
          <div className="fs-team-name fs-t2">{g.teamNames[1]}</div>
          <div className="fs-pts fs-t2">{s1}</div>
        </div>
      </div>

      <div className="results-actions">
        <button className="btn btn-gold" style={{ flex: 1 }} onClick={g.playAgain}>
          {g.t('btn_again')}
        </button>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={g.goHome}>
          {g.t('btn_home')}
        </button>
      </div>
    </div>
  );
}
