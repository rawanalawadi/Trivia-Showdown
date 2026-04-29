'use client';

import { useState } from 'react';
import Modal from './Modal';
import type { GameAPI } from '@/hooks/useGame';

export default function AddQuestionModal({ g }: { g: GameAPI }) {
  const [qText, setQText]     = useState('');
  const [opts,  setOpts]      = useState(['', '', '', '']);
  const [correct, setCorrect] = useState<number | null>(null);
  const [errors, setErrors]   = useState({ text: false, opts: false, correct: false });

  const activeCat = g.builderCategories.find(c => c.id === g.addQCategoryId);

  function setOpt(i: number, val: string) {
    setOpts(prev => prev.map((o, idx) => idx === i ? val : o));
  }

  function reset() {
    setQText(''); setOpts(['', '', '', '']); setCorrect(null);
    setErrors({ text: false, opts: false, correct: false });
  }

  function submit() {
    const e = {
      text:    !qText.trim(),
      opts:    opts.some(o => !o.trim()),
      correct: correct === null,
    };
    setErrors(e);
    if (e.text || e.opts || e.correct || !g.addQCategoryId) return;

    g.addQuestionToCategory(g.addQCategoryId, {
      question: qText.trim(),
      options: opts.map(o => o.trim()),
      answer: correct!,
      category: activeCat?.name ?? '',
    });

    reset();
    g.closeAddQModal();
  }

  function handleClose() { reset(); g.closeAddQModal(); }

  return (
    <Modal open={g.addQModal}>
      <div className="modal-title">{g.t('addq_title')}</div>

      {activeCat && (
        <div className="modal-cat-tag">
          {activeCat.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeCat.imageUrl} alt="" style={{ width: 20, height: 20, borderRadius: 5, objectFit: 'cover' }} />
          )}
          <span>{g.t('addq_for_cat')} <strong>{activeCat.name}</strong></span>
        </div>
      )}

      {/* Question text */}
      <div className="field">
        <label>{g.t('lbl_q_text')}</label>
        <textarea
          className={`input${errors.text ? ' input-err' : ''}`}
          rows={2}
          style={{ resize: 'vertical' }}
          placeholder={g.t('ph_q_text')}
          value={qText}
          onChange={e => { setQText(e.target.value); setErrors(v => ({ ...v, text: false })); }}
        />
        {errors.text && <span className="err-msg">{g.t('err_q_text')}</span>}
      </div>

      {/* Options */}
      <div className="field">
        <label>{g.t('lbl_q_opts')}</label>
        <div className="opts-input-grid">
          {['A','B','C','D'].map((lbl, i) => (
            <div className="opt-input-row" key={i}>
              <span className="opt-lbl">{lbl}</span>
              <input
                className={`input${errors.opts && !opts[i].trim() ? ' input-err' : ''}`}
                type="text" maxLength={80}
                value={opts[i]}
                onChange={e => { setOpt(i, e.target.value); setErrors(v => ({ ...v, opts: false })); }}
              />
            </div>
          ))}
        </div>
        {errors.opts && <span className="err-msg">{g.t('err_q_opts')}</span>}
      </div>

      {/* Correct answer */}
      <div className="field">
        <label>{g.t('lbl_q_correct')}</label>
        <div className="radio-row">
          {['A','B','C','D'].map((lbl, i) => (
            <label className="radio-label" key={i}>
              <input
                type="radio"
                name="aq-correct"
                checked={correct === i}
                onChange={() => { setCorrect(i); setErrors(v => ({ ...v, correct: false })); }}
              />
              {lbl}
            </label>
          ))}
        </div>
        {errors.correct && <span className="err-msg">{g.t('err_q_correct')}</span>}
      </div>

      <div className="modal-actions">
        <button className="btn btn-gold" onClick={submit}>{g.t('btn_add_q_submit')}</button>
        <button className="btn btn-outline" onClick={handleClose}>{g.t('btn_cancel')}</button>
      </div>
    </Modal>
  );
}
