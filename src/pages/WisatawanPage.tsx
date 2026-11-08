import { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import type { TempleZone } from '../types';
import { BackgroundPaths } from '../components/ui/background-paths';
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
      {/* Hero Section with BackgroundPaths */}
      <BackgroundPaths
        title={t('Sacred Zones of Bali', 'Zona Suci Bali')}
        subtitle={t(
          'Navigate Bali\'s temples with reverence. Live status, custom map layers, and mandatory etiquette — before you walk in.',
          'Jelajahi pura-pura Bali dengan hormat. Status langsung, lapisan peta khusus, dan tata krama wajib — sebelum Anda masuk.'
        )}
      >
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
          {t('Sacred Site Guide', 'Panduan Situs Suci')}
        </span>
      </BackgroundPaths>

      {/* Geofence Status — temple cards */}
      <section style={{ padding: '0 16px 32px' }}>
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto' }}>
          <FadeIn delay={0.35}>
            <GeofenceHeader onSimulateEntry={setSelectedTemple} />
          </FadeIn>
        </div>
      </section>

      {/* Temple Map Section with Integrated Aturan Adat */}
      <section style={{ padding: '0 16px clamp(48px, 6vw, 80px)' }}>
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto' }}>
          <FadeIn delay={0.45}>
            <div style={{ marginBottom: '20px' }}>
              <h2
                className="editorial-heading"
                style={{ margin: '0 0 12px 0' }}
              >
                {t('Interactive Map: Temples & Traditional Rules', 'Peta Interaktif: Pura & Aturan Adat')}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                {t(
                  'Explore sacred temples and traditional rules by region. Click on blue markers to view adat rules for each area.',
                  'Jelajahi pura suci dan aturan adat berdasarkan wilayah. Klik marker biru untuk melihat aturan adat di setiap daerah.'
                )}
              </p>
            </div>
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 28px)', overflow: 'hidden' }}>
              <div
                style={{
                  height: 'min(700px, 70vh)',
                  minHeight: '500px',
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

      {/* Traditional Rules Section — Data dari Database db_adatnusa */}
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
                  'Explore authentic adat rules from communities across Bali, sourced directly from local archives and db_adatnusa.',
                  'Jelajahi aturan adat asli dari komunitas di seluruh Bali, bersumber langsung dari arsip lokal dan db_adatnusa.'
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
