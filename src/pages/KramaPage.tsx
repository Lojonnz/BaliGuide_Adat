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
          <button
            onClick={() => setActiveSection('banjar')}
            style={{
              flex: 1,
              padding: '14px 20px',
              background:
                activeSection === 'banjar' ? 'var(--color-primary)' : 'transparent',
              color: activeSection === 'banjar' ? '#FFFFFF' : 'var(--color-text)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              minHeight: '44px',
            }}
          >
            <Building2 size={20} />
            {t('Smart Banjar', 'Banjar Pintar')}
          </button>
          <button
            onClick={() => setActiveSection('subak')}
            style={{
              flex: 1,
              padding: '14px 20px',
              background:
                activeSection === 'subak' ? 'var(--color-primary)' : 'transparent',
              color: activeSection === 'subak' ? '#FFFFFF' : 'var(--color-text)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              minHeight: '44px',
            }}
          >
            <Droplets size={20} />
            {t('Subak & Marketplace', 'Subak & Pasar')}
          </button>
        </div>

        {/* Content Area */}
        <div
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
