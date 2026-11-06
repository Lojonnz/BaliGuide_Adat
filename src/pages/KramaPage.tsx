import { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { BanjarDashboard } from '../components/krama/BanjarDashboard';
import { SubakMonitor } from '../components/krama/SubakMonitor';
import { Building2, Droplets } from 'lucide-react';

export function KramaPage() {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState<'banjar' | 'subak'>('banjar');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Page Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            {t('Village Governance', 'Pemerintahan Desa')}
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            {t(
              'Smart administration for Banjar community and Subak irrigation systems',
              'Administrasi pintar untuk komunitas Banjar dan sistem irigasi Subak'
            )}
          </p>
        </div>

        {/* Section Toggle */}
        <div
          role="tablist"
          aria-label={t('Krama sections', 'Bagian Krama')}
          style={{
            display: 'flex',
            gap: '8px',
            background: 'var(--color-surface)',
            padding: '8px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          {([
            { id: 'banjar' as const, icon: Building2, en: 'Smart Banjar', idLabel: 'Banjar Pintar' },
            { id: 'subak' as const, icon: Droplets, en: 'Subak & Marketplace', idLabel: 'Subak & Pasar' },
          ] as const).map((sec) => {
            const isActive = activeSection === sec.id;
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`krama-panel-${sec.id}`}
                id={`krama-tab-${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--color-text)',
                  border: `1px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: isActive ? 700 : 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  minHeight: '44px',
                }}
              >
                <Icon size={20} aria-hidden="true" />
                {t(sec.en, sec.idLabel)}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div
          role="tabpanel"
          id={`krama-panel-${activeSection}`}
          aria-labelledby={`krama-tab-${activeSection}`}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            padding: '24px',
            boxShadow: 'var(--shadow)',
          }}
        >
          {activeSection === 'banjar' ? <BanjarDashboard /> : <SubakMonitor />}
        </div>
      </div>
    </div>
  );
}
