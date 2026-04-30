'use client';

import { useRef, useState } from 'react';
import type { GameAPI } from '@/hooks/useGame';
import type { CustomQuestion } from '@/lib/types';

/** Parse an Excel/CSV file into category buckets (max 6 questions each).
 *  Expected columns: Category | Question | A | B | C | D | Answer (A–D or 1–4)
 */
async function parseExcelFile(
  file: File,
): Promise<Array<{ name: string; questions: CustomQuestion[] }>> {
  const XLSX = await import('xlsx');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb   = XLSX.read(e.target?.result, { type: 'binary' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });

        const map = new Map<string, CustomQuestion[]>();

        for (const row of rows) {
          const str  = (k: string) => String(row[k] ?? row[k.toLowerCase()] ?? '').trim();
          const cat  = str('Category') || 'Imported';
          const q    = str('Question');
          const a    = str('A');
          const b    = str('B');
          const c    = str('C');
          const d    = str('D');
          const ans  = str('Answer').toUpperCase();

          if (!q || !a || !b || !c || !d || !ans) continue;

          const ansIdx = ans === 'A' || ans === '1' ? 0
                       : ans === 'B' || ans === '2' ? 1
                       : ans === 'C' || ans === '3' ? 2
                       : ans === 'D' || ans === '4' ? 3
                       : -1;
          if (ansIdx === -1) continue;

          if (!map.has(cat)) map.set(cat, []);
          const bucket = map.get(cat)!;
          if (bucket.length < 6) {
            bucket.push({ question: q, options: [a, b, c, d], answer: ansIdx, category: cat });
          }
        }

        resolve(Array.from(map.entries()).map(([name, questions]) => ({ name, questions })));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

/** Create and trigger download of a blank Excel template */
async function downloadTemplate() {
  const XLSX = await import('xlsx');
  const ws   = XLSX.utils.aoa_to_sheet([
    ['Category', 'Question', 'A', 'B', 'C', 'D', 'Answer'],
    ['Science', 'What is H₂O?', 'Water', 'Salt', 'Sugar', 'Oil', 'A'],
    ['History', 'Year WWII ended?', '1943', '1944', '1945', '1946', 'C'],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');
  XLSX.writeFile(wb, 'trivia-template.xlsx');
}

export default function BuilderScreen({ g }: { g: GameAPI }) {
  const fileRef            = useRef<HTMLInputElement>(null);
  const [importing, setImporting]  = useState(false);
  const [importMsg, setImportMsg]  = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const completeCats = g.builderCategories.filter(c => c.questions.length === 6);
  const canPlay      = completeCats.length >= 1;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';      // reset so same file can be re-uploaded
    setImporting(true);
    setImportMsg(null);
    try {
      const parsed = await parseExcelFile(file);
      if (parsed.length === 0 || parsed.every(c => c.questions.length === 0)) {
        setImportMsg({ type: 'err', text: g.t('import_error') });
      } else {
        g.importFromExcel(parsed);
        const total = parsed.reduce((s, c) => s + c.questions.length, 0);
        setImportMsg({ type: 'ok', text: `${g.t('import_success')} (${total} questions across ${parsed.length} categories)` });
      }
    } catch {
      setImportMsg({ type: 'err', text: g.t('import_error') });
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="screen" style={{ paddingTop: 10 }}>
      <div className="builder-header">
        <h2>{g.t('builder_title')}</h2>
        <button className="btn btn-ghost btn-sm" onClick={g.goHome}>{g.t('btn_back')}</button>
      </div>
      <p className="builder-info">{g.t('builder_sub')}</p>

      {/* Excel import section */}
      <div className="import-box">
        <div className="import-box-label">
          <span>📊</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '.9rem' }}>
              {g.t('btn_import_excel')}
            </div>
            <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 2 }}>
              {g.t('import_hint')}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            {importing ? '…' : g.t('btn_import_excel')}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={downloadTemplate}>
            {g.t('btn_template')}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {importMsg && (
          <div className={`import-msg${importMsg.type === 'ok' ? ' ok' : ' err'}`}>
            {importMsg.type === 'ok' ? '✔ ' : '✘ '}{importMsg.text}
          </div>
        )}
      </div>

      {/* Category list */}
      {g.builderCategories.length === 0 ? (
        <div className="builder-empty">{g.t('builder_no_cats')}</div>
      ) : (
        <div className="cat-grid">
          {g.builderCategories.map(cat => {
            const qCount     = cat.questions.length;
            const isComplete = qCount === 6;
            const fillPct    = (qCount / 6) * 100;

            return (
              <div className="cat-card" key={cat.id}>
                <div className="cat-card-header">
                  {cat.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.imageUrl} alt={cat.name} className="cat-img" />
                  ) : (
                    <div className="cat-img-placeholder">📂</div>
                  )}
                  <div className="cat-info">
                    <div className="cat-name">{cat.name}</div>
                    <div className="cat-progress">
                      <div className="cat-progress-bar">
                        <div
                          className={`cat-progress-fill${isComplete ? ' complete' : ''}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                      <span className="cat-progress-label">{qCount} / 6</span>
                    </div>
                  </div>
                  <div className="cat-actions">
                    {qCount < 6 && (
                      <button className="btn btn-outline btn-sm" onClick={() => g.openAddQModal(cat.id)}>
                        {g.t('btn_add_q')}
                      </button>
                    )}
                    <button className="cat-del-btn" onClick={() => g.deleteBuilderCategory(cat.id)} title="Delete">🗑</button>
                  </div>
                </div>

                {cat.questions.length > 0 && (
                  <div className="cat-q-list">
                    {cat.questions.map((q, qi) => (
                      <div className="q-item" key={qi}>
                        <div className="q-num">{qi + 1}</div>
                        <div className="q-body"><div className="q-text">{q.question}</div></div>
                        <button className="q-del" onClick={() => g.deleteQuestionFromCategory(cat.id, qi)}>🗑</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="builder-actions">
        <button className="btn btn-outline" onClick={g.openAddCategoryModal}>
          {g.t('btn_add_category')}
        </button>
        <button className="btn btn-gold" disabled={!canPlay} onClick={g.goHome}>
          {g.t('btn_play_custom')}
        </button>
      </div>

      {!canPlay && <p className="builder-play-note">{g.t('builder_play_note')}</p>}
    </div>
  );
}
