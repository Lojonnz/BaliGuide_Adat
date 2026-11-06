import { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import type { TempleZone } from '../types';
import { GeofenceHeader } from '../components/wisatawan/GeofenceHeader';
import { TempleMap } from '../components/wisatawan/TempleMap';
import { AwigAwigModal } from '../components/wisatawan/AwigAwigModal';
import { FadeIn } from '../components/common/AnimationWrappers';

export function WisatawanPage() {
  const { t } = useI18n();
  const [selectedTemple, setSelectedTemple] = useState<TempleZone | null>(null);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Cinematic Hero Section */}
      <section className="relative overflow-hidden" style={{ padding: '80px 16px 60px' }}>
        <div aria-hidden="true" className="absolute inset-0 grid-bg" style={{ opacity: 0.2, pointerEvents: 'none' }} />

        <FadeIn delay={0.2}>
          <div className="max-w-6xl mx-auto">
            <h1 className="hero-title" style={{ color: 'var(--color-primary)', marginBottom: '20px' }}>
              {t('SACRED ZONES', 'ZONA SUCI')}
              <br />
              {t('OF BALI', 'BALI')}
            </h1>
            <p className="editorial-heading" style={{ color: 'var(--color-text-muted)', maxWidth: '600px' }}>
              {t('Navigate with Respect & Tradition', 'Navigasi dengan Hormat & Tradisi')}
            </p>
          </div>
        </FadeIn>
      </section>

      {/* Geofence Status Header */}
      <FadeIn delay={0.4}>
        <div style={{ padding: '0 16px 24px' }}>
          <GeofenceHeader onSimulateEntry={setSelectedTemple} />
        </div>
      </FadeIn>

      {/* Temple Map Section */}
      <section style={{ padding: '0 16px 80px' }}>
        <FadeIn delay={0.6}>
          <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <h2 className="editorial-heading" style={{ marginBottom: '20px', fontSize: '2rem' }}>
              {t('Interactive Temple Map', 'Peta Pura Interaktif')}
            </h2>
            <div style={{ height: 'min(600px, 60vh)', minHeight: '320px', borderRadius: 'var(--radius)', position: 'relative', zIndex: 1 }}>
              <TempleMap />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Awig-Awig Modal */}
      <AwigAwigModal temple={selectedTemple} onClose={() => setSelectedTemple(null)} />
    </div>
  );
}
