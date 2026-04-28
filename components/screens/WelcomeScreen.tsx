import type { GameAPI } from '@/hooks/useGame';

export default function WelcomeScreen({ g }: { g: GameAPI }) {
  return (
    <div className="screen welcome-screen">
      <div>
        <div className="logo-title">{g.t('app_title')}</div>
        <div className="logo-sub">{g.t('app_sub')}</div>
      </div>

      <div className="welcome-actions">
        <button className="btn btn-gold btn-full" onClick={g.goLogin}>
          <span>📱</span><span>{g.t('btn_login')}</span>
        </button>
        <div className="divider"><span>{g.t('or')}</span></div>
        <button className="btn btn-outline btn-full" onClick={g.goGuest}>
          <span>👤</span><span>{g.t('btn_guest')}</span>
        </button>
      </div>

      <p className="guest-note">{g.t('guest_note')}</p>
    </div>
  );
}
