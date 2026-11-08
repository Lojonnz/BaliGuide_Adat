import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
  /** Width style (default '100%') */
  width?: string;
}

/**
 * Accessible modal with focus trap, ESC close, backdrop click, and
 * proper role/aria attributes. Manages body scroll lock while open.
 */
export function Modal({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = 560,
  width = '100%',
}: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<Element | null>(null);
  const [visible, setVisible] = useState(false);

  // Lock body, trap focus, wire ESC; restore on unmount
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => setVisible(true));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);

    // Focus the close button on mount
    const t = setTimeout(() => closeRef.current?.focus(), 50);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      cancelAnimationFrame(raf);
      clearTimeout(t);
      if (previouslyFocusedRef.current instanceof HTMLElement) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [onClose]);


  const backdropStyle: CSSProperties = {
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    opacity: visible ? 1 : 0,
    transition: 'opacity 200ms ease',
  };

  const panelStyle: CSSProperties = {
    background: 'var(--glass-bg, rgba(255,255,255,0.85))',
    border: '1px solid var(--glass-border, rgba(255,255,255,0.2))',
    boxShadow: 'var(--glass-shadow, 0 8px 32px rgba(0,0,0,0.08))',
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(12px)',
    transition: 'opacity 220ms ease, transform 220ms cubic-bezier(0.22,1,0.36,1)',
  };

  const headerStyle: CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    padding: '20px 24px',
    borderBottom: '1px solid var(--color-border)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    background: 'var(--glass-bg, rgba(255,255,255,0.85))',
  };

  return (
    <div
      ref={backdropRef}
      data-testid="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        ...backdropStyle,
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: `${maxWidth}px`,
          maxHeight: '90vh',
          overflow: 'auto',
          borderRadius: '16px',
          ...panelStyle,
        }}
      >
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="modal-close-btn"
              style={{
                flexShrink: 0,
                width: '44px',
                height: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                border: '1px solid transparent',
                background: 'transparent',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'background 150ms ease, color 150ms ease, border-color 150ms ease',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}
