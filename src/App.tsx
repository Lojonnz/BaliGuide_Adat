import { useState, lazy, Suspense } from 'react';
import type { Gate } from './types';
import { I18nProvider } from './context/I18nContext';
import { LenisProvider } from './context/LenisContext';
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

function App() {
  const [activeGate, setActiveGate] = useState<Gate>('wisatawan');

  const renderGatePage = () => {
    switch (activeGate) {
      case 'wisatawan':
        return <WisatawanPage />;
      case 'krama':
        return <KramaPage />;
      case 'pelestari':
        return <PelestariPage />;
    }
  };

  return (
    <LenisProvider>
      <I18nProvider>
        <Layout activeGate={activeGate} onGateChange={setActiveGate}>
          <Suspense
            fallback={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid var(--color-border)',
                    borderTopColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
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
        </Layout>
      </I18nProvider>
    </LenisProvider>
  );
}

export default App;
