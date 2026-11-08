import { Map, Users, BookOpen, Settings } from 'lucide-react';
import type { Gate } from '../../types';
import { useI18n } from '../../context/I18nContext';

interface NavbarProps {
  activeGate: Gate;
  onGateChange: (gate: Gate) => void;
}

export function Navbar({ activeGate, onGateChange }: NavbarProps) {
  const { t } = useI18n();

  const tabs: { gate: Gate; icon: typeof Map; labelEn: string; labelId: string }[] = [
    { gate: 'wisatawan', icon: Map, labelEn: 'Tourist', labelId: 'Wisatawan' },
    { gate: 'krama', icon: Users, labelEn: 'Village', labelId: 'Krama' },
    { gate: 'pelestari', icon: BookOpen, labelEn: 'Preserver', labelId: 'Pelestari' },
    { gate: 'admin', icon: Settings, labelEn: 'Admin Map', labelId: 'Admin Peta' },
  ];

  return (
    <nav
      className="navbar-responsive"
      aria-label={t('Main navigation', 'Navigasi utama')}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--color-border)',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-around',
        gap: '8px',
        zIndex: 100,
      }}
    >
      {tabs.map(({ gate, icon: Icon, labelEn, labelId }) => {
        const isActive = activeGate === gate;
        return (
          <button
            key={gate}
            onClick={() => onGateChange(gate)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px',
              border: 'none',
              background: isActive ? 'var(--color-sand)' : 'transparent',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.2s ease',
              position: 'relative',
              minHeight: '44px',
              minWidth: '44px',
            }}
            aria-label={t(labelEn, labelId)}
          >
            {isActive && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '32px',
                  height: '3px',
                  background: 'var(--color-terracotta)',
                  borderRadius: '0 0 3px 3px',
                }}
              />
            )}
            <Icon
              size={24}
              strokeWidth={isActive ? 2.5 : 2}
              style={{ transition: 'all 0.2s ease' }}
              aria-hidden="true"
            />
            <span
              className="navbar-label"
              style={{
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.2s ease',
              }}
            >
              {t(labelEn, labelId)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
