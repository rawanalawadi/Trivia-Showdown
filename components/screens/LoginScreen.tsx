'use client';

import { useState } from 'react';
import type { GameAPI } from '@/hooks/useGame';

export default function LoginScreen({ g }: { g: GameAPI }) {
  const [mobile, setMobile] = useState('');
  const [name,   setName]   = useState('');
  const [mobileErr, setMobileErr] = useState(false);
  const [nameErr,   setNameErr]   = useState(false);

  function submit() {
    const result = g.doLogin(mobile, name);
    setMobileErr(result === 'err_mobile');
    setNameErr(result === 'err_name');
  }

  return (
    <div className="screen" style={{ paddingTop: 20, maxWidth: 440, margin: 'auto', width: '100%' }}>
      <div className="login-header">
        <h2>{g.t('login_title')}</h2>
        <p>{g.t('login_sub')}</p>
      </div>

      <div className="login-form">
        <div className="field">
          <label>{g.t('label_mobile')}</label>
          <input
            className={`input${mobileErr ? ' input-err' : ''}`}
            type="tel"
            placeholder={g.t('ph_mobile')}
            value={mobile}
            maxLength={15}
            onChange={e => { setMobile(e.target.value); setMobileErr(false); }}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          {mobileErr && <span className="err-msg">{g.t('err_mobile')}</span>}
        </div>

        <div className="field">
          <label>{g.t('label_name')}</label>
          <input
            className={`input${nameErr ? ' input-err' : ''}`}
            type="text"
            placeholder={g.t('ph_name')}
            value={name}
            maxLength={24}
            onChange={e => { setName(e.target.value); setNameErr(false); }}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          {nameErr && <span className="err-msg">{g.t('err_name')}</span>}
        </div>

        <button className="btn btn-gold btn-full" onClick={submit}>
          {g.t('btn_login_go')}
        </button>
        <button className="btn btn-ghost btn-full" onClick={g.goWelcome}>
          {g.t('btn_back')}
        </button>
      </div>
    </div>
  );
}
