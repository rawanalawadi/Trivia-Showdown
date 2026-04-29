'use client';

import { useState } from 'react';
import Modal from './Modal';
import type { GameAPI } from '@/hooks/useGame';

export default function AddCategoryModal({ g }: { g: GameAPI }) {
  const [name,     setName]     = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [nameErr,  setNameErr]  = useState(false);

  function reset() { setName(''); setImageUrl(''); setNameErr(false); }

  function submit() {
    if (!name.trim()) { setNameErr(true); return; }
    g.addBuilderCategory(name, imageUrl.trim());
    reset();
    g.closeAddCategoryModal();
  }

  function handleClose() { reset(); g.closeAddCategoryModal(); }

  return (
    <Modal open={g.addCategoryModal}>
      <div className="modal-title">{g.t('addcat_title')}</div>

      <div className="field">
        <label>{g.t('lbl_cat_name')}</label>
        <input
          className={`input${nameErr ? ' input-err' : ''}`}
          type="text"
          placeholder={g.t('ph_cat_name')}
          value={name}
          maxLength={40}
          onChange={e => { setName(e.target.value); setNameErr(false); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        {nameErr && <span className="err-msg">{g.t('err_cat_name')}</span>}
      </div>

      <div className="field">
        <label>{g.t('lbl_cat_image')}</label>
        <input
          className="input"
          type="url"
          placeholder={g.t('ph_cat_image')}
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        {imageUrl && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="preview"
              style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', background: 'var(--card2)' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Preview</span>
          </div>
        )}
      </div>

      <div className="modal-actions">
        <button className="btn btn-gold" onClick={submit}>{g.t('btn_add_cat_submit')}</button>
        <button className="btn btn-outline" onClick={handleClose}>{g.t('btn_cancel')}</button>
      </div>
    </Modal>
  );
}
