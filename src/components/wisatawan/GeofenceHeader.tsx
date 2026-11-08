import { useI18n } from '../../context/I18nContext';
import { useTempleLocations } from '../../services/locationStorage';
import type { TempleZone } from '../../types';
import { Radio } from 'lucide-react';
import { SpotlightCard, PulseGlow } from '../common/PremiumCards';
import { StaggerContainer } from '../common/AnimationWrappers';

interface Props {
  onSimulateEntry: (temple: TempleZone) => void;
}

export function GeofenceHeader({ onSimulateEntry }: Props) {
  const { t } = useI18n();
  const { temples } = useTempleLocations();

  const statusColors = {
    open: 'var(--color-open)',
    restricted: 'var(--color-restricted)',
    closed: 'var(--color-closed)',
  };

  const statusLabels = {
    open: { en: 'Open', id: 'Buka' },
    restricted: { en: 'Restricted Access', id: 'Akses Terbatas' },
    closed: { en: 'Closed for Worship', id: 'Ditutup untuk Ibadah' },
  };

  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
      {/* Pecalang Broadcast Badge */}
      <div
        className="flex items-center gap-2 mb-6"
        style={{
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          fontWeight: 600,
        }}
      >
        <PulseGlow color="var(--color-terracotta)">
          <Radio size={18} />
        </PulseGlow>
        <span>
          {t('PECALANG LIVE BROADCAST', 'SIARAN LANGSUNG PECALANG')}
        </span>
      </div>

      {/* Temple Status Grid */}
      <StaggerContainer>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          {temples.map((temple) => (
            <SpotlightCard
              key={temple.id}
              className="stagger-item glass-card"
              style={{
                padding: '20px',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Temple Name */}
              <h3
                style={{
                  margin: '0 0 12px 0',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                }}
              >
                {t(temple.name, temple.nameId)}
              </h3>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 mb-4" role="status" aria-label={t(statusLabels[temple.status].en, statusLabels[temple.status].id)}>
                <PulseGlow color={statusColors[temple.status]}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: statusColors[temple.status],
                    }}
                  />
                </PulseGlow>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: statusColors[temple.status],
                  }}
                >
                  {t(statusLabels[temple.status].en, statusLabels[temple.status].id)}
                </span>
              </div>

              {/* Simulate Entry Button */}
              <button
                type="button"
                onClick={() => onSimulateEntry(temple)}
                aria-label={`${t('Simulate entry to', 'Simulasi masuk ke')} ${t(temple.name, temple.nameId)}`}
                className="btn-primary"
                style={{
                  width: '100%',
                  fontSize: '14px',
                  padding: '12px 20px',
                  minHeight: '44px',
                }}
              >
                {t('Simulate Entry', 'Simulasi Masuk')}
              </button>
            </SpotlightCard>
          ))}
        </div>
      </StaggerContainer>
    </div>
  );
}
