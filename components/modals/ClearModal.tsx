import Modal from './Modal';
import type { GameAPI } from '@/hooks/useGame';

export default function ClearModal({ g }: { g: GameAPI }) {
  return (
    <Modal open={g.clearModal}>
      <div className="modal-title">{g.t('clear_title')}</div>
      <div className="modal-msg">{g.t('clear_msg')}</div>
      <div className="modal-actions">
        <button className="btn btn-danger" onClick={g.clearLeaderboard}>{g.t('clear_confirm')}</button>
        <button className="btn btn-outline" onClick={g.closeClearModal}>{g.t('btn_cancel')}</button>
      </div>
    </Modal>
  );
}
