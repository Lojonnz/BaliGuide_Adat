import { useEffect } from 'react';
import { Modal } from './Modal';
import { useI18n } from '../../context/I18nContext';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useI18n();
  const fallbackCancel = cancelLabel ?? t('Cancel', 'Batal');

  // Keep dialog mounted briefly for exit animation via visibility state is
  // skipped for brevity — unmount immediately on close is acceptable for a
  // confirm dialog (Modal handles entrance on next open).

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onConfirm]);

  if (!open) return null;

  return (
    <Modal title={title} onClose={onCancel} maxWidth={440}>
      <p style={{ margin: '0 0 24px', fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text)' }}>
        {message}
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '12px 20px',
            borderRadius: '10px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '44px',
            minWidth: '44px',
          }}
        >
          {fallbackCancel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          autoFocus
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            background: danger ? 'var(--color-closed)' : 'var(--color-primary)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: '44px',
            minWidth: '44px',
            boxShadow: 'var(--shadow)',
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
