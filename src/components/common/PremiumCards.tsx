import { useRef, type ReactNode, type MouseEvent, type CSSProperties } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function SpotlightCard({ children, className = '', style }: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      className={`spotlight-card ${className}`}
      onMouseMove={handleMouseMove}
      style={style}
    >
      {children}
    </div>
  );
}

interface GlowingBorderCardProps {
  children: ReactNode;
  glowColor?: string;
  className?: string;
}

export function GlowingBorderCard({
  children,
  glowColor = 'var(--color-primary)',
  className = ''
}: GlowingBorderCardProps) {
  return (
    <div
      className={`glass-card relative overflow-hidden ${className}`}
      style={{
        position: 'relative',
      }}
    >
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${glowColor}20, transparent)`,
          animation: 'shimmer 3s infinite linear',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

interface PulseGlowProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function PulseGlow({ children, color = 'currentColor', className = '' }: PulseGlowProps) {
  return (
    <div
      className={`pulse-glow ${className}`}
      style={{ color }}
    >
      {children}
    </div>
  );
}
