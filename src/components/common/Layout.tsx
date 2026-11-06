import type { ReactNode } from 'react';
import type { Gate } from '../../types';
import { useI18n } from '../../context/I18nContext';
import { Navbar } from './Navbar';
import { LanguageToggle } from './LanguageToggle';

interface LayoutProps {
  activeGate: Gate;
  onGateChange: (gate: Gate) => void;
  children: ReactNode;
}

export function Layout({ activeGate, onGateChange, children }: LayoutProps) {
  const { t } = useI18n();

  const getSubtitle = (gate: Gate) => {
    switch (gate) {
      case 'wisatawan':
        return t('Sacred Zones & Etiquette', 'Zona Suci & Tata Krama');
      case 'krama':
        return t('Village Administration', 'Administrasi Desa');
      case 'pelestari':
        return t('Cultural Preservation', 'Pelestarian Budaya');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--color-bg)',
      }}
    >
      <a href="#main-content" className="skip-link">
        {t('Skip to main content', 'Lewati ke konten utama')}
      </a>

      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          zIndex: 50,
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            BaliGuide Adat
          </h1>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {getSubtitle(activeGate)}
          </p>
        </div>
        <LanguageToggle />
      </header>

      {/* Main content — let Lenis own the page scroll; do NOT set overflowY
          on <main> or we get double scroll containers that fight each other
          and break ScrollTrigger pinning/measurements. */}
      <main
        id="main-content"
        className="layout-main"
        style={{
          flex: 1,
          padding: '16px',
          paddingBottom: 'calc(16px + 68px)',
        }}
      >
        {children}
      </main>

      {/* Bottom navigation */}
      <Navbar activeGate={activeGate} onGateChange={onGateChange} />
    </div>
  );
}
