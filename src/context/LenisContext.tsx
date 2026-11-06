import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Safeguard #2: prevent address-bar collapse/expand from firing ScrollTrigger
// refresh events and causing layout jumps on mobile browsers.
ScrollTrigger.config({ ignoreMobileResize: true });

interface LenisContextType {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextType>({ lenis: null });

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Safeguard #1: syncTouch:false keeps touch on native scroll (no hijacking
    // on iOS Safari / Android Chrome) while mouse/trackpad wheels stay smooth.

    // Respect reduced motion: disable Lenis smoothing entirely
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: prefersReduced ? 0 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !prefersReduced,
      wheelMultiplier: 1,
      // Touch safeguard: native scroll stays native on mobile (iOS Safari /
      // Android Chrome). Lenis smoothTouch is set via options when
      // supported; fallback is syncTouch:false so touches never hijack.
      syncTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);

    gsap.ticker.lagSmoothing(0);

    // Cleanup — also remove the named ticker callback so HMR/StrictMode
    // double-mount doesn't leak RAF loops.
    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current }}>
      {children}
    </LenisContext.Provider>
  );
}

export const useLenis = () => useContext(LenisContext);
