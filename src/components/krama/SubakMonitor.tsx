import { useState, useEffect } from 'react';
import { useI18n } from '../../context/I18nContext';
import { subakTelemetry, harvestProducts } from '../../data';
import { Droplets, AlertTriangle, Store, Wheat, Coffee, Phone, FileText } from 'lucide-react';
import type { SubakTelemetry } from '../../types';

export function SubakMonitor() {
  const { t } = useI18n();
  const [telemetryData, setTelemetryData] = useState<SubakTelemetry[]>(subakTelemetry);

  // Auto-refresh simulation: randomize flow rates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryData((prev) =>
        prev.map((entry) => {
          const variance = (Math.random() - 0.5) * 1.5; // ±0.75 variation
          const newFlowRate = Math.max(0, entry.flowRate + variance);
          const newDeviation = ((newFlowRate - entry.quota) / entry.quota) * 100;
          const newAlertLevel =
            Math.abs(newDeviation) > 15
              ? 'critical'
              : Math.abs(newDeviation) > 10
              ? 'warning'
              : 'normal';

          return {
            ...entry,
            flowRate: parseFloat(newFlowRate.toFixed(1)),
            deviation: parseFloat(newDeviation.toFixed(1)),
            alertLevel: newAlertLevel as 'normal' | 'warning' | 'critical',
            timestamp: new Date().toISOString(),
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const alertVar: Record<string, string> = {
    normal: 'var(--color-open)',
    warning: 'var(--color-restricted)',
    critical: 'var(--color-closed)',
  };

  const getAlertColor = (level: 'normal' | 'warning' | 'critical') => alertVar[level];

  const getProductIcon = (productName: string) => {
    if (productName.toLowerCase().includes('coffee')) return Coffee;
    if (productName.toLowerCase().includes('rice')) return Wheat;
    return Store;
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Section 1: Tektek Flow Monitor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Droplets size={28} style={{ color: 'var(--color-primary)' }} />
          <h2
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            {t('Tektek Flow Monitor', 'Monitor Aliran Tektek')}
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {telemetryData.map((entry) => {
            const flowPercentage = (entry.flowRate / entry.quota) * 100;
            const isAlert = entry.alertLevel !== 'normal';

            return (
              <div
                key={entry.id}
                style={{
                  background: 'var(--color-surface)',
                  border: `2px solid ${isAlert ? getAlertColor(entry.alertLevel) : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                  boxShadow: 'var(--shadow)',
                  position: 'relative',
                  animation: isAlert ? 'pulse 2s ease-in-out infinite' : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: 'var(--color-text)',
                      }}
                    >
                      {t(entry.gateName, entry.gateNameId)}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-text-muted)',
                        marginTop: '4px',
                      }}
                    >
                      {new Date(entry.timestamp).toLocaleString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </div>
                  </div>

                  {isAlert && (
                    <div
                      role="status"
                      aria-live="polite"
                      aria-label={`${t(entry.gateName, entry.gateNameId)}: ${
                        entry.alertLevel === 'warning'
                          ? t('Warning', 'Peringatan')
                          : t('Critical', 'Kritis')
                      }`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'rgba(220,38,38,0.12)',
                        color: getAlertColor(entry.alertLevel),
                        border: `1px solid ${getAlertColor(entry.alertLevel)}`,
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      <AlertTriangle size={16} aria-hidden="true" />
                      {entry.alertLevel === 'warning'
                        ? t('Warning', 'Peringatan')
                        : t('Critical', 'Kritis')}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {t('Flow Rate', 'Debit Air')}
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                      {entry.flowRate} / {entry.quota} L/s
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(Math.min(flowPercentage, 100))}
                    aria-label={t('Flow vs quota', 'Aliran vs kuota')}
                    style={{
                      width: '100%',
                      height: '12px',
                      background: 'var(--color-border)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(flowPercentage, 100)}%`,
                        height: '100%',
                        background: getAlertColor(entry.alertLevel),
                        transition: 'width 0.5s ease, background 0.5s ease',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {t('Deviation', 'Deviasi')}:
                  </span>
                  <span
                    style={{
                      fontWeight: '700',
                      color: getAlertColor(entry.alertLevel),
                    }}
                  >
                    {entry.deviation > 0 ? '+' : ''}
                    {entry.deviation}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: B2B Harvest Showcase */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Store size={28} style={{ color: 'var(--color-primary)' }} />
          <h2
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            {t('B2B Harvest Marketplace', 'Pasar Hasil Panen B2B')}
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          {harvestProducts.map((product) => {
            const ProductIcon = getProductIcon(product.product);

            return (
              <div
                key={product.id}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  opacity: product.available ? 1 : 0.7,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius)',
                      background: 'var(--color-primary)' + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ProductIcon size={28} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: 'var(--color-text)',
                      }}
                    >
                      {t(product.product, product.productId)}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-text-muted)',
                        marginTop: '4px',
                      }}
                    >
                      {product.farmName}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {t('Available', 'Tersedia')}:
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                      {product.quantity}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {t('Price/kg', 'Harga/kg')}:
                    </span>
                    <span
                      style={{
                        fontWeight: '700',
                        fontSize: '16px',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {formatRupiah(product.pricePerKg)}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignSelf: 'flex-start',
                    padding: '4px 12px',
                    background: product.available ? 'rgba(5,150,105,0.12)' : 'rgba(220,38,38,0.12)',
                    color: product.available ? 'var(--color-open)' : 'var(--color-closed)',
                    border: `1px solid ${product.available ? 'var(--color-open)' : 'var(--color-closed)'}`,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  {product.available
                    ? t('Available', 'Tersedia')
                    : t('Sold Out', 'Habis')}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={!product.available}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: product.available
                        ? 'var(--color-primary)'
                        : 'var(--color-border)',
                      color: product.available ? '#FFFFFF' : 'var(--color-text-muted)',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      cursor: product.available ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      minHeight: '44px',
                    }}
                  >
                    <Phone size={16} />
                    {t('Contact', 'Hubungi')}
                  </button>
                  <button
                    disabled={!product.available}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: product.available
                        ? 'var(--color-surface)'
                        : 'var(--color-border)',
                      color: product.available
                        ? 'var(--color-primary)'
                        : 'var(--color-text-muted)',
                      border: product.available
                        ? '1px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                      cursor: product.available ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      minHeight: '44px',
                    }}
                  >
                    <FileText size={16} />
                    {t('Quote', 'Penawaran')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
