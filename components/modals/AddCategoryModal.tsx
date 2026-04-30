'use client';

import { useState } from 'react';
import Modal from './Modal';
import { searchPexels, type PexelsPhoto } from '@/lib/pexels';
import type { GameAPI } from '@/hooks/useGame';

export default function AddCategoryModal({ g }: { g: GameAPI }) {
  const [name,          setName]          = useState('');
  const [imageUrl,      setImageUrl]      = useState('');
  const [nameErr,       setNameErr]       = useState(false);
  const [pexelsPhotos,  setPexelsPhotos]  = useState<PexelsPhoto[]>([]);
  const [pexelsLoading, setPexelsLoading] = useState(false);

  function reset() {
    setName(''); setImageUrl(''); setNameErr(false);
    setPexelsPhotos([]); setPexelsLoading(false);
  }

  function submit() {
    if (!name.trim()) { setNameErr(true); return; }
    g.addBuilderCategory(name, imageUrl.trim());
    reset();
    g.closeAddCategoryModal();
  }

  function handleClose() { reset(); g.closeAddCategoryModal(); }

  async function handlePexelsSearch() {
    const query = name.trim() || 'trivia';
    setPexelsLoading(true);
    const photos = await searchPexels(query);
    setPexelsPhotos(photos);
    setPexelsLoading(false);
  }

  return (
    <Modal open={g.addCategoryModal}>
      <div className="modal-title">{g.t('addcat_title')}</div>

      {/* Category name */}
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

      {/* Image URL + Pexels search */}
      <div className="field">
        <label>{g.t('lbl_cat_image')}</label>

        <div className="pexels-search-row">
          <input
            className="input"
            type="url"
            placeholder={g.t('ph_cat_image')}
            value={imageUrl}
            onChange={e => { setImageUrl(e.target.value); }}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          <button
            className="btn btn-outline btn-sm"
            type="button"
            onClick={handlePexelsSearch}
            disabled={pexelsLoading}
            style={{ flexShrink: 0 }}
          >
            {pexelsLoading ? '…' : g.t('pexels_find')}
          </button>
        </div>

        {/* Pexels photo grid */}
        {pexelsPhotos.length > 0 && (
          <div className="pexels-grid">
            {pexelsPhotos.map(p => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={p.src.small}
                alt={p.alt}
                className={`pexels-photo${imageUrl === p.src.medium ? ' selected' : ''}`}
                onClick={() => setImageUrl(p.src.medium)}
              />
            ))}
          </div>
        )}

        {/* URL preview */}
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
