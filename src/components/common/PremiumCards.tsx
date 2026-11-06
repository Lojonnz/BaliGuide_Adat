import { useRef, useEffect, type ReactNode, type MouseEvent, type CSSProperties } from 'react';
import { gsap } from 'gsap';

/* ── SpotlightCard — clean lift on hover, NO mouse-tracking glow blob ── */
interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function SpotlightCard({ children, className = '', style }: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.set(el, { transformOrigin: '50% 100%' });
    }, el);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: -4,
      boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={cardRef}
      className={`spotlight-card ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      {children}
    </div>
  );
}

/* ── GlowingBorderCard — kept as a subtle elevation card (no shimmer) ── */
export function GlowingBorderCard({
  children,
  className = '',
}: {
  children: ReactNode;
  glowColor?: string;
  className?: string;
}) {
  return <div className={`glass-card ${className}`}>{children}</div>;
}

/* ── PulseGlow — small status-dot pulse ring ── */
interface PulseGlowProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function PulseGlow({ children, color = 'currentColor', className = '' }: PulseGlowProps) {
  return (
    <div className={`pulse-glow ${className}`} style={{ color }}>
      {children}
    </div>
  );
}

/* ── HoverPressable — GSAP scale feedback for desktop-only (no-op on touch) ── */
export function HoverPressable({
  children,
  className = '',
  onClick,
  ariaLabel,
  style,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (!ref.current || !window.matchMedia('(pointer: fine)').matches) return;
    gsap.to(ref.current, { scale: 1.02, duration: 0.15, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { scale: 1, duration: 0.15, ease: 'power2.out' });
  };

  const handleDown = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { scale: 0.98, duration: 0.1 });
  };

  const handleUp = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { scale: 1.02, duration: 0.15 });
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      style={style}
    >
      {children}
    </button>
  );
}

// Re-export for callers that pass (e: MouseEvent) handlers
export type { MouseEvent };
