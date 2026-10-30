'use client';
import { useEffect, useId, useRef } from 'react';

/**
 * Accessible confirmation modal built on the native <dialog> element:
 * focus is trapped, Escape closes it, and focus returns to the trigger.
 */
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="modal" aria-labelledby={titleId} onCancel={(e) => { e.preventDefault(); onCancel && onCancel(); }} onClose={() => open && onCancel && onCancel()}>
      <div className="modal-body">
        <h2 id={titleId} style={{ fontSize: '1.25rem' }}>{title}</h2>
        <div>{children}</div>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </button>
        <button type="button" className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
