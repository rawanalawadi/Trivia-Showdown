import type { GameAPI } from '@/hooks/useGame';

export default function BuilderScreen({ g }: { g: GameAPI }) {
  const canPlay = g.customQuestions.length >= 3;
  const canAdd  = g.customQuestions.length < 10;

  return (
    <div className="screen" style={{ paddingTop: 10 }}>
      <div className="builder-header">
        <h2>{g.t('builder_title')}</h2>
        <button className="btn btn-ghost btn-sm" onClick={g.goHome}>{g.t('btn_back')}</button>
      </div>
      <p className="builder-info">{g.t('builder_sub')}</p>

      {/* Question list */}
      {g.customQuestions.length === 0 ? (
        <div className="builder-empty">{g.t('builder_empty')}</div>
      ) : (
        <div className="q-list">
          {g.customQuestions.map((q, i) => (
            <div className="q-item" key={i}>
              <div className="q-num">{i + 1}</div>
              <div className="q-body">
                <div className="q-text">{q.question}</div>
                <div style={{ marginTop: 4 }}>
                  <span className="badge badge-blue">{q.category}</span>
                </div>
              </div>
              <button className="q-del" onClick={() => g.deleteCustomQuestion(i)} title="Delete">🗑</button>
            </div>
          ))}
        </div>
      )}

      <div className="builder-actions">
        <button
          className="btn btn-outline"
          onClick={g.openAddQModal}
          disabled={!canAdd}
        >
          {g.t('btn_add_q')}
        </button>
        <button
          className="btn btn-gold"
          disabled={!canPlay}
          onClick={() => {
            /* team names come from home; builder just triggers custom game from home */
            g.goHome();
          }}
        >
          {g.t('btn_play_custom')}
        </button>
      </div>

      {!canPlay && <p className="min-note">{g.t('builder_min')}</p>}
    </div>
  );
}
