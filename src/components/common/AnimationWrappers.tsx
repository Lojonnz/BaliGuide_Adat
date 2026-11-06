import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Safeguard: ignore mobile address-bar collapse/expand resize events
ScrollTrigger.config({ ignoreMobileResize: true });

// ── Page-level entrance wrapper ────────────────────────────────────────
export function PageFade({
  children,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [delay, y]);

  return <div ref={ref}>{children}</div>;
}

// ── Scroll-triggered fade-in ───────────────────────────────────────────
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}

export function FadeIn({ children, delay = 0, duration = 0.7, y = 24, className = '', style }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [delay, duration, y]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

// ── Staggered reveal for grid/item children ───────────────────────────
interface StaggerContainerProps {
  children: ReactNode;
  stagger?: number;
  className?: string;
  style?: CSSProperties;
}

export function StaggerContainer({ children, stagger = 0.08, className = '', style }: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll('.stagger-item');
    if (!items.length) return;

    const ctx = gsap.context(() => {
      // Start visible so content is never stuck invisible if ScrollTrigger
      // misfires; then animate from hidden in a trigger.
      gsap.set(items, { opacity: 1, y: 0 });
      gsap.fromTo(
        items,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [stagger]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

// ── Subtle scroll parallax (kept, but capped so it never feels drift-y) ──
interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.15, className = '' }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        y: () => -window.innerHeight * speed * 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// ── Number / value counter ─────────────────────────────────────────────
export function AnimatedNumber({
  value,
  format,
  duration = 0.9,
  className = '',
  style,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { v: prevRef.current };
    gsap.to(obj, {
      v: value,
      duration,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        el.textContent = format(obj.v);
      },
    });
    prevRef.current = value;
  }, [value, format, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {format(value)}
    </span>
  );
}
