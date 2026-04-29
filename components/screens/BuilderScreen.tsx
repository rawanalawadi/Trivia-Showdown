import type { GameAPI } from '@/hooks/useGame';

export default function BuilderScreen({ g }: { g: GameAPI }) {
  const completeCats = g.builderCategories.filter(c => c.questions.length === 6);
  const canPlay = completeCats.length >= 1;

  return (
    <div className="screen" style={{ paddingTop: 10 }}>
      <div className="builder-header">
        <h2>{g.t('builder_title')}</h2>
        <button className="btn btn-ghost btn-sm" onClick={g.goHome}>{g.t('btn_back')}</button>
      </div>
      <p className="builder-info">{g.t('builder_sub')}</p>

      {/* Category list */}
      {g.builderCategories.length === 0 ? (
        <div className="builder-empty">{g.t('builder_no_cats')}</div>
      ) : (
        <div className="cat-grid">
          {g.builderCategories.map(cat => {
            const qCount = cat.questions.length;
            const isComplete = qCount === 6;
            const fillPct = (qCount / 6) * 100;

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
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => g.openAddQModal(cat.id)}
                      >
                        {g.t('btn_add_q')}
                      </button>
                    )}
                    <button
                      className="cat-del-btn"
                      onClick={() => g.deleteBuilderCategory(cat.id)}
                      title="Delete category"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                {/* Questions list for this category */}
                {cat.questions.length > 0 && (
                  <div className="cat-q-list">
                    {cat.questions.map((q, qi) => (
                      <div className="q-item" key={qi}>
                        <div className="q-num">{qi + 1}</div>
                        <div className="q-body">
                          <div className="q-text">{q.question}</div>
                        </div>
                        <button
                          className="q-del"
                          onClick={() => g.deleteQuestionFromCategory(cat.id, qi)}
                          title="Delete question"
                        >
                          🗑
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="builder-actions">
        <button className="btn btn-outline" onClick={g.openAddCategoryModal}>
          {g.t('btn_add_category')}
        </button>
        <button
          className="btn btn-gold"
          disabled={!canPlay}
          onClick={g.goHome}
        >
          {g.t('btn_play_custom')}
        </button>
      </div>

      {!canPlay && (
        <p className="builder-play-note">{g.t('builder_play_note')}</p>
      )}
    </div>
  );
}
