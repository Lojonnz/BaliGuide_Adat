import { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import type { TempleZone } from '../types';
import { GeofenceHeader } from '../components/wisatawan/GeofenceHeader';
import { TempleMap } from '../components/wisatawan/TempleMap';
import { AwigAwigModal } from '../components/wisatawan/AwigAwigModal';
import { AturanList } from '../components/wisatawan/AturanList';
import { FadeIn } from '../components/common/AnimationWrappers';

export function WisatawanPage() {
  const { t } = useI18n();
  const [selectedTemple, setSelectedTemple] = useState<TempleZone | null>(null);

  return (
    <div style={{ background: 'var(--color-bg)' }}>
      {/* Hero Section — clean HBD layout, centered, airy */}
      <section
        className="relative overflow-hidden"
        style={{ padding: 'clamp(48px, 8vw, 80px) 16px clamp(32px, 5vw, 56px)' }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <FadeIn delay={0.1}>
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
                marginBottom: '20px',
              }}
            >
              {t('Sacred Site Guide', 'Panduan Situs Suci')}
            </span>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h1
              className="hero-title"
              style={{ color: 'var(--color-text)', margin: '0 0 16px 0' }}
            >
              {t('Sacred Zones of Bali', 'Zona Suci Bali')}
            </h1>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
                maxWidth: '640px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              {t(
                'Navigate Bali\'s temples with reverence. Live status, custom map layers, and mandatory etiquette — before you walk in.',
                'Jelajahi pura-pura Bali dengan hormat. Status langsung, lapisan peta khusus, dan tata krama wajib — sebelum Anda masuk.'
              )}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Geofence Status — temple cards */}
      <section style={{ padding: '0 16px 32px' }}>
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto' }}>
          <FadeIn delay={0.35}>
            <GeofenceHeader onSimulateEntry={setSelectedTemple} />
          </FadeIn>
        </div>
      </section>

      {/* Temple Map Section */}
      <section style={{ padding: '0 16px 32px' }}>
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto' }}>
          <FadeIn delay={0.45}>
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 28px)', overflow: 'hidden' }}>
              <h2
                className="editorial-heading"
                style={{ margin: '0 0 20px 0' }}
              >
                {t('Interactive Temple Map', 'Peta Pura Interaktif')}
              </h2>
              <div
                style={{
                  height: 'min(600px, 60vh)',
                  minHeight: '320px',
                  borderRadius: 'var(--radius)',
                  position: 'relative',
                  zIndex: 1,
                  overflow: 'hidden',
                }}
              >
                <TempleMap />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Traditional Rules Section — Data dari Database */}
      <section style={{ padding: '0 16px clamp(48px, 6vw, 80px)' }}>
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto' }}>
          <FadeIn delay={0.5}>
            <div style={{ marginBottom: '24px' }}>
              <h2
                className="editorial-heading"
                style={{ color: 'var(--color-text)', marginBottom: '8px' }}
              >
                {t('Traditional Rules & Regulations', 'Aturan Adat & Regulasi')}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                {t(
                  'Explore authentic adat rules from communities across Bali, sourced directly from local archives.',
                  'Jelajahi aturan adat asli dari komunitas di seluruh Bali, bersumber langsung dari arsip lokal.'
                )}
              </p>
            </div>
            <AturanList />
          </FadeIn>
        </div>
      </section>

      {/* Awig-Awig Modal */}
      <AwigAwigModal temple={selectedTemple} onClose={() => setSelectedTemple(null)} />
    </div>
  );
}
