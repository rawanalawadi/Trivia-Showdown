import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  children: ReactNode;
}

export default function Modal({ open, children }: Props) {
  return (
    <div className={`modal-overlay${open ? ' open' : ''}`}>
      <div className="modal-box">{children}</div>
    </div>
  );
}
