import { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { MapCoordinateManager } from '../components/admin/MapCoordinateManager';
import { FadeIn } from '../components/common/AnimationWrappers';
import { ShieldCheck, MapPin, Compass, FileText } from 'lucide-react';
import type { Wilayah } from '../services/api';

export function AdminPage() {
  const { t } = useI18n();

  const [stats, setStats] = useState({
    totalWilayah: 9,
    mappedWilayah: 9,
    totalAturan: 16,
  });

  const handleWilayahUpdated = (list: Wilayah[]) => {
    const totalWilayah = list.length;
    const mappedWilayah = list.filter(
      (w) => w.latitude !== null && w.longitude !== null && !isNaN(w.latitude) && !isNaN(w.longitude)
    ).length;
    const totalAturan = list.reduce((sum, w) => sum + (w.aturan_count || 0), 0);
    setStats({ totalWilayah, mappedWilayah, totalAturan });
  };

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
                {t('Admin Management Portal (db_adatnusa)', 'Portal Manajemen Admin (db_adatnusa)')}
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
              {t('Bali Adat Territory & Coordinate Settings (db_adatnusa)', 'Pengaturan Kordinat Wilayah Adat Bali (db_adatnusa)')}
            </h1>
            <p
              style={{
                fontSize: 'clamp(14px, 1.8vw, 16px)',
                color: 'var(--color-text-muted)',
                maxWidth: '740px',
                lineHeight: 1.6,
              }}
            >
              {t(
                'Configure geospatial GPS coordinates for all 9 regencies and cities in Bali stored in db_adatnusa (wilayah table). Updates are synchronized live with the public tourist map and traditional adat regulations.',
                'Atur kordinat GPS spasial nyata untuk seluruh 9 Kabupaten dan Kota di Bali pada database db_adatnusa (tabel wilayah). Perubahan kordinat otomatis tersinkronisasi langsung ke peta publik wisatawan dan aturan adat terkait.'
              )}
            </p>
          </FadeIn>

          {/* Quick Metrics Bar */}
          <FadeIn delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-[var(--color-border)]">
              {/* Stat 1: Total Wilayah */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl glass-card border border-[var(--color-border)]">
                <div className="p-2.5 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                  <MapPin size={22} />
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-muted)] font-medium">
                    {t('Total Wilayah', 'Total Wilayah')}
                  </div>
                  <div className="text-sm font-bold text-[var(--color-text)]">
                    {stats.totalWilayah} {t('Regencies / Cities', 'Kabupaten / Kota')}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    {t('Bali Province (parent_id: 17)', 'Provinsi Bali (parent_id: 17)')}
                  </div>
                </div>
              </div>

              {/* Stat 2: Wilayah Terpetakan */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl glass-card border border-[var(--color-border)]">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <Compass size={22} />
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-muted)] font-medium">
                    {t('Mapped Regions', 'Wilayah Terpetakan')}
                  </div>
                  <div className="text-sm font-bold text-[var(--color-text)]">
                    {stats.mappedWilayah} / {stats.totalWilayah} {t('Mapped', 'Terpetakan')}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {t('Valid WGS84 GPS Coordinates', 'Kordinat GPS Valid')}
                  </div>
                </div>
              </div>

              {/* Stat 3: Total Aturan Terkait */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl glass-card border border-[var(--color-border)]">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <FileText size={22} />
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-muted)] font-medium">
                    {t('Total Associated Rules', 'Total Aturan Terkait')}
                  </div>
                  <div className="text-sm font-bold text-[var(--color-text)]">
                    {stats.totalAturan} {t('Customary Rules', 'Aturan Adat')}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    {t('Synced with db_adatnusa', 'Tersinkron dengan db_adatnusa')}
                  </div>
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
            <MapCoordinateManager onWilayahUpdated={handleWilayahUpdated} />
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
