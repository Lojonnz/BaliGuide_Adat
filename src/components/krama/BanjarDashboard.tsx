import { useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import { citizens, ledgerEntries, parumanEvents } from '../../data';
import { TrendingUp, TrendingDown, Wallet, Calendar, MapPin, Mail, QrCode } from 'lucide-react';
import type { KramaClass } from '../../types';
import { Modal } from '../common/Modal';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('') || '?';
}

function Avatar({ name, src }: { name: string; src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={name}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--color-terracotta)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '16px',
          flexShrink: 0,
        }}
      >
        {initials(name)}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
    />
  );
}

export function BanjarDashboard() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'citizens' | 'ledger' | 'paruman'>('citizens');
  const [selectedClass, setSelectedClass] = useState<KramaClass | 'All'>('All');
  const [showQrisModal, setShowQrisModal] = useState(false);

  const filteredCitizens = selectedClass === 'All'
    ? citizens
    : citizens.filter((c) => c.classification === selectedClass);

  const totalIncome = ledgerEntries
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = ledgerEntries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  const classColors: Record<KramaClass, string> = {
    'Krama Adat': 'var(--color-terracotta)',
    'Krama Tamiu': 'var(--color-amber)',
    'Tamiu': 'var(--color-gray-500)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tabs */}
      <div
        role="tablist"
        aria-label={t('Banjar sections', 'Bagian Banjar')}
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
        }}
      >
        {([
          { id: 'citizens' as const, en: 'Citizens', idLabel: 'Warga' },
          { id: 'ledger' as const, en: 'Financial Ledger', idLabel: 'Keuangan' },
          { id: 'paruman' as const, en: 'Paruman Events', idLabel: 'Paruman' },
        ] as const).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                fontSize: '15px',
                whiteSpace: 'nowrap',
                minHeight: '44px',
              }}
            >
              {t(tab.en, tab.idLabel)}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Citizens */}
      {activeTab === 'citizens' && (
        <div role="tabpanel" id="panel-citizens" aria-labelledby="tab-citizens" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filter buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} role="group" aria-label={t('Filter by classification', 'Filter berdasarkan klasifikasi')}>
            {(['All', 'Krama Adat', 'Krama Tamiu', 'Tamiu'] as const).map((cls) => {
              const isActive = selectedClass === cls;
              return (
                <button
                  key={cls}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedClass(cls)}
                  style={{
                    padding: '8px 16px',
                    background: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: isActive ? '#FFFFFF' : 'var(--color-text)',
                    border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isActive ? 700 : 500,
                    minHeight: '44px',
                  }}
                >
                  {cls === 'All' ? t('All', 'Semua') : cls}
                </button>
              );
            })}
          </div>

          {filteredCitizens.length === 0 && (
            <div role="status" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius)' }}>
              {t('No citizens match this filter.', 'Tidak ada warga yang cocok dengan filter ini.')}
            </div>
          )}

          {/* Citizen cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredCitizens.map((citizen) => (
              <div
                key={citizen.id}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar name={citizen.name} src={citizen.avatar} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--color-text)',
                      }}
                    >
                      {citizen.name}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        color: 'var(--color-text-muted)',
                        marginTop: '2px',
                      }}
                    >
                      {citizen.banjar}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignSelf: 'flex-start',
                    padding: '4px 12px',
                    background: classColors[citizen.classification] + '20',
                    color: classColors[citizen.classification],
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                >
                  {citizen.classification}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Financial Ledger */}
      {activeTab === 'ledger' && (
        <div role="tabpanel" id="panel-ledger" aria-labelledby="tab-ledger" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <TrendingUp size={20} style={{ color: 'var(--color-open)' }} aria-hidden="true" />
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                  {t('Total Income', 'Total Pemasukan')}
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-open)', fontVariantNumeric: 'tabular-nums' }}>
                {formatRupiah(totalIncome)}
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <TrendingDown size={20} style={{ color: 'var(--color-closed)' }} aria-hidden="true" />
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                  {t('Total Expenses', 'Total Pengeluaran')}
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-closed)', fontVariantNumeric: 'tabular-nums' }}>
                {formatRupiah(totalExpense)}
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Wallet size={20} style={{ color: 'var(--color-terracotta)' }} aria-hidden="true" />
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                  {t('Balance', 'Saldo')}
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-terracotta)', fontVariantNumeric: 'tabular-nums' }}>
                {formatRupiah(balance)}
              </div>
            </div>
          </div>

          {/* Entries list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ledgerEntries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: entry.type === 'income' ? 'rgba(5,150,105,0.12)' : 'rgba(220,38,38,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {entry.type === 'income' ? (
                    <TrendingUp size={20} style={{ color: 'var(--color-open)' }} />
                  ) : (
                    <TrendingDown size={20} style={{ color: 'var(--color-closed)' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text)' }}>
                    {t(entry.description, entry.descriptionId)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {new Date(entry.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    • {t(entry.category, entry.categoryId)}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: entry.type === 'income' ? 'var(--color-open)' : 'var(--color-closed)',
                    textAlign: 'right',
                    flexShrink: 0,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {entry.type === 'income' ? '+' : '-'}
                  {formatRupiah(entry.amount)}
                </div>
              </div>
            ))}
          </div>

          {/* QRIS Payment button */}
          <button
            type="button"
            onClick={() => setShowQrisModal(true)}
            style={{
              padding: '14px 24px',
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow)',
              minHeight: '44px',
            }}
          >
            <QrCode size={20} aria-hidden="true" />
            {t('Pay with QRIS', 'Bayar dengan QRIS')}
          </button>
        </div>
      )}

      {/* Tab 3: Paruman Events */}
      {activeTab === 'paruman' && (
        <div role="tabpanel" id="panel-paruman" aria-labelledby="tab-paruman" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {parumanEvents.map((event) => {
            const attendancePercentage = (event.attendees / event.invited) * 100;
            return (
              <div
                key={event.id}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)' }}>
                    {t(event.title, event.titleId)}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-text-muted)',
                      marginTop: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} />
                      {new Date(event.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}{' '}
                      • {event.time}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} />
                      {event.location}
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--color-text)',
                      marginBottom: '8px',
                    }}
                  >
                    {t('Agenda', 'Agenda')}:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {event.agenda.map((item, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: '14px',
                          color: 'var(--color-text-muted)',
                          marginBottom: '4px',
                        }}
                      >
                        {t(item, event.agendaId[idx])}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {t('Attendance', 'Kehadiran')}
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                      {event.attendees} / {event.invited}
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      background: 'var(--color-border)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${attendancePercentage}%`,
                        height: '100%',
                        background: 'var(--color-primary)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    padding: '12px 20px',
                    background: 'var(--color-primary)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    minHeight: '44px',
                  }}
                >
                  <Mail size={18} aria-hidden="true" />
                  {t('Send Digital Invitation', 'Kirim Undangan Digital')}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* QRIS Modal */}
      {showQrisModal && (
        <Modal
          title={t('Scan QRIS Code', 'Scan Kode QRIS')}
          subtitle={t('Use any QRIS-compatible wallet', 'Gunakan dompet apa pun yang mendukung QRIS')}
          onClose={() => setShowQrisModal(false)}
          maxWidth={400}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              role="img"
              aria-label="QRIS"
              style={{
                width: '200px',
                height: '200px',
                background: '#fff',
                border: '2px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrCode size={120} style={{ color: '#1F2937' }} aria-hidden="true" />
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
              {t('Simulated QRIS payment placeholder', 'Placeholder pembayaran QRIS simulasi')}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
