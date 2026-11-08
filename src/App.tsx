import { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { Gate } from './types';
import { I18nProvider } from './context/I18nContext';
import { LenisProvider, scrollToTop } from './context/LenisContext';
import { Layout } from './components/common/Layout';

// Lazy load gate pages
const WisatawanPage = lazy(() =>
  import('./pages/WisatawanPage').then((m) => ({ default: m.WisatawanPage }))
);
const KramaPage = lazy(() =>
  import('./pages/KramaPage').then((m) => ({ default: m.KramaPage }))
);
const PelestariPage = lazy(() =>
  import('./pages/PelestariPage').then((m) => ({ default: m.PelestariPage }))
);
const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((m) => ({ default: m.AdminPage }))
);

function App() {
  const [activeGate, setActiveGate] = useState<Gate>('wisatawan');
  const contentRef = useRef<HTMLDivElement>(null);

  // Animate the whole main content region on every gate switch, then scroll top.
  useEffect(() => {
    if (!contentRef.current) return;
    scrollToTop();
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity' }
    );
  }, [activeGate]);

  const renderGatePage = () => {
    switch (activeGate) {
      case 'wisatawan':
        return <WisatawanPage />;
      case 'krama':
        return <KramaPage />;
      case 'pelestari':
        return <PelestariPage />;
      case 'admin':
        return <AdminPage />;
    }
  };

  return (
    <LenisProvider>
      <I18nProvider>
        <Layout activeGate={activeGate} onGateChange={setActiveGate}>
          <div ref={contentRef}>
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-live="polite"
                  aria-label="Loading… / Memuat…"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    minHeight: '200px',
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid var(--color-border)',
                      borderTopColor: 'var(--color-primary)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span className="sr-only">Loading…</span>
                  <style>{`
                    @keyframes spin {
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              }
            >
              {renderGatePage()}
            </Suspense>
          </div>
        </Layout>
      </I18nProvider>
    </LenisProvider>
  );
}

export default App;
