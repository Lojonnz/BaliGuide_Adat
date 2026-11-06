import { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { BanjarDashboard } from '../components/krama/BanjarDashboard';
import { SubakMonitor } from '../components/krama/SubakMonitor';
import { Building2, Droplets } from 'lucide-react';
import { FadeIn } from '../components/common/AnimationWrappers';

export function KramaPage() {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState<'banjar' | 'subak'>('banjar');

  return (
    <div style={{ background: 'var(--color-bg)', padding: 'clamp(32px, 6vw, 64px) 16px clamp(48px, 6vw, 80px)' }}>
      <div
        style={{
          maxWidth: 'var(--container)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Hero — clean, centered */}
        <FadeIn delay={0.1}>
          <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '6px 14px',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {t('Village Administration', 'Administrasi Desa')}
            </span>
            <h1 className="hero-title" style={{ color: 'var(--color-text)', margin: 0 }}>
              {t('Village Governance', 'Pemerintahan Desa')}
            </h1>
            <p
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
                color: 'var(--color-text-muted)',
                margin: 0,
                maxWidth: '640px',
                lineHeight: 1.6,
              }}
            >
              {t(
                'Smart administration for Banjar community and Subak irrigation systems',
                'Administrasi pintar untuk komunitas Banjar dan sistem irigasi Subak'
              )}
            </p>
          </div>
        </FadeIn>

        {/* Section Toggle */}
        <FadeIn delay={0.2}>
          <div
            role="tablist"
            aria-label={t('Krama sections', 'Bagian Krama')}
            style={{
              display: 'flex',
              gap: '8px',
              background: 'var(--color-surface)',
              padding: '8px',
              borderRadius: '12px',
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
                    borderRadius: '8px',
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
        </FadeIn>

        {/* Content Area */}
        <FadeIn delay={0.3}>
          <div
            role="tabpanel"
            id={`krama-panel-${activeSection}`}
            aria-labelledby={`krama-tab-${activeSection}`}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: 'clamp(16px, 3vw, 28px)',
              boxShadow: 'var(--shadow)',
            }}
          >
            {activeSection === 'banjar' ? <BanjarDashboard /> : <SubakMonitor />}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
