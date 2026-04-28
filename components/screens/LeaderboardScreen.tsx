import type { GameAPI } from '@/hooks/useGame';

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
}

export default function LeaderboardScreen({ g }: { g: GameAPI }) {
  const records = [...g.leaderboard].sort((a, b) => b.timestamp - a.timestamp);
  const mine = g.user ? records.filter(r => r.mobile === g.user!.mobile) : [];
  const best = mine.length ? Math.max(...mine.map(r => Math.max(r.teams[0].score, r.teams[1].score))) : 0;
  const avg  = mine.length
    ? Math.round(mine.reduce((a, r) => a + Math.max(r.teams[0].score, r.teams[1].score), 0) / mine.length * 10) / 10
    : 0;

  const diffLabel = (d: string) => {
    if (d === 'custom') return g.t('custom_lb');
    return g.t(`diff_${d}_lb`);
  };
  const modeLabel = (m: string) => m === 'custom' ? g.t('mode_custom_lb') : g.t('mode_ready_lb');

  return (
    <div className="screen" style={{ paddingTop: 10 }}>
      <div className="lb-header">
        <h2>{g.t('lb_title')}</h2>
        <button className="btn btn-ghost btn-sm" onClick={g.goHome}>{g.t('btn_back')}</button>
      </div>

      {/* My stats */}
      {g.user && (
        <div className="lb-stats">
          <div className="stat-box">
            <div className="stat-label">{g.t('stat_games')}</div>
            <div className="stat-val">{mine.length}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">{g.t('stat_best')}</div>
            <div className="stat-val">{best}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">{g.t('stat_avg')}</div>
            <div className="stat-val">{avg}</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-wrap">
        {records.length === 0 ? (
          <div className="lb-empty">{g.t('lb_empty')}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{g.t('lb_col_date')}</th>
                <th>{g.t('lb_col_player')}</th>
                <th>{g.t('lb_col_scores')}</th>
                <th>{g.t('lb_col_diff')}</th>
                <th>{g.t('lb_col_mode')}</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--muted)', fontSize: '.78rem', whiteSpace: 'nowrap' }}>
                    {formatDate(r.timestamp)}
                  </td>
                  <td style={{ fontWeight: 700 }}>{r.playerName}</td>
                  <td>
                    <div className="score-cell">
                      <div><span className="score-t1">{r.teams[0].name}</span>: {r.teams[0].score}/{r.total}</div>
                      <div><span className="score-t2">{r.teams[1].name}</span>: {r.teams[1].score}/{r.total}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${r.diff === 'easy' ? 'green' : r.diff === 'hard' ? 'red' : r.diff === 'custom' ? 'blue' : 'gold'}`}>
                      {diffLabel(r.diff)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '.82rem' }}>{modeLabel(r.mode)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button className="btn btn-danger btn-sm" onClick={g.openClearModal}>
        {g.t('btn_clear')}
      </button>
    </div>
  );
}
