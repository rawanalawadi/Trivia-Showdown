import Modal from './Modal';
import type { GameAPI } from '@/hooks/useGame';

export default function QuitModal({ g }: { g: GameAPI }) {
  return (
    <Modal open={g.quitModal}>
      <div className="modal-title">{g.t('quit_title')}</div>
      <div className="modal-msg">{g.t('quit_msg')}</div>
      <div className="modal-actions">
        <button className="btn btn-red" onClick={g.confirmQuit}>{g.t('quit_confirm')}</button>
        <button className="btn btn-outline" onClick={g.closeQuitModal}>{g.t('btn_cancel')}</button>
      </div>
    </Modal>
  );
}
