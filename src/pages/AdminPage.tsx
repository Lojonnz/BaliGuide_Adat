import { useI18n } from '../context/I18nContext';
import { MapCoordinateManager } from '../components/admin/MapCoordinateManager';
import { FadeIn } from '../components/common/AnimationWrappers';
import { ShieldCheck, Database, MapPin } from 'lucide-react';

export function AdminPage() {
  const { t } = useI18n();

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Admin Header / Hero */}
      <section
        className="relative overflow-hidden"
        style={{ padding: 'clamp(40px, 6vw, 64px) 16px clamp(24px, 4vw, 40px)' }}
      >
        <div className="max-w-6xl mx-auto">
          <FadeIn delay={0.1}>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                }}
              >
                <ShieldCheck size={14} />
                {t('Admin Management Portal', 'Portal Manajemen Admin')}
              </span>
            </div>
            <h1
              className="editorial-heading"
              style={{
                fontSize: 'clamp(28px, 4.5vw, 42px)',
                fontWeight: 800,
                color: 'var(--color-text)',
                lineHeight: 1.15,
                marginBottom: '12px',
              }}
            >
              {t('Sacred Coordinates & Boundary Settings', 'Kordinat Suci & Pengaturan Batas')}
            </h1>
            <p
              style={{
                fontSize: 'clamp(14px, 1.8vw, 16px)',
                color: 'var(--color-text-muted)',
                maxWidth: '720px',
                lineHeight: 1.6,
              }}
            >
              {t(
                'Configure geospatial GPS coordinates, geofence mandala zones, and etiquette rules for temples across Bali. Updates reflect instantly on the public tourist map.',
                'Atur kordinat GPS spasial, zona mandala geofence, dan aturan adat tata krama untuk pura di seluruh Bali. Perubahan langsung tercermin di peta publik wisatawan.'
              )}
            </p>
          </FadeIn>

          {/* Quick Metrics Bar */}
          <FadeIn delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-muted)] font-medium">
                    {t('Coordinate Precision', 'Presisi Kordinat')}
                  </div>
                  <div className="text-sm font-bold">WGS84 6-Decimal GPS</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                  <Database size={20} />
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-muted)] font-medium">
                    {t('Storage Persistence', 'Penyimpanan Data')}
                  </div>
                  <div className="text-sm font-bold">{t('Local Admin Storage & Sync', 'Penyimpanan Lokal Admin & Sinkron')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-muted)] font-medium">
                    {t('Map Synchronization', 'Sinkronisasi Peta')}
                  </div>
                  <div className="text-sm font-bold">{t('Realtime Live Reactivity', 'Reaktivitas Peta Langsung')}</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Main Coordinate Manager Section */}
      <section style={{ padding: '0 16px clamp(48px, 6vw, 80px)' }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn delay={0.3}>
            <MapCoordinateManager />
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
