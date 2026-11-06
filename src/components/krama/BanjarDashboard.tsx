import { useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import { citizens, ledgerEntries, parumanEvents } from '../../data';
import { TrendingUp, TrendingDown, Wallet, Calendar, MapPin, Mail, QrCode, X } from 'lucide-react';
import type { KramaClass } from '../../types';

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
    'Tamiu': '#6B7280',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('citizens')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'citizens' ? '2px solid var(--color-primary)' : 'none',
            color: activeTab === 'citizens' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'citizens' ? '600' : '400',
            cursor: 'pointer',
            fontSize: '15px',
            whiteSpace: 'nowrap',
            minHeight: '44px',
          }}
        >
          {t('Citizens', 'Warga')}
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'ledger' ? '2px solid var(--color-primary)' : 'none',
            color: activeTab === 'ledger' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'ledger' ? '600' : '400',
            cursor: 'pointer',
            fontSize: '15px',
            whiteSpace: 'nowrap',
            minHeight: '44px',
          }}
        >
          {t('Financial Ledger', 'Keuangan')}
        </button>
        <button
          onClick={() => setActiveTab('paruman')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'paruman' ? '2px solid var(--color-primary)' : 'none',
            color: activeTab === 'paruman' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'paruman' ? '600' : '400',
            cursor: 'pointer',
            fontSize: '15px',
            whiteSpace: 'nowrap',
            minHeight: '44px',
          }}
        >
          {t('Paruman Events', 'Paruman')}
        </button>
      </div>

      {/* Tab 1: Citizens */}
      {activeTab === 'citizens' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filter buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['All', 'Krama Adat', 'Krama Tamiu', 'Tamiu'] as const).map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                style={{
                  padding: '8px 16px',
                  background: selectedClass === cls ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: selectedClass === cls ? '#FFFFFF' : 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  minHeight: '44px',
                }}
              >
                {cls === 'All' ? t('All', 'Semua') : cls}
              </button>
            ))}
          </div>

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
                  <img
                    src={citizen.avatar}
                    alt={citizen.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                <TrendingUp size={20} style={{ color: '#059669' }} />
                <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                  {t('Total Income', 'Total Pemasukan')}
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
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
                <TrendingDown size={20} style={{ color: '#DC2626' }} />
                <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                  {t('Total Expenses', 'Total Pengeluaran')}
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#DC2626' }}>
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
                <Wallet size={20} style={{ color: 'var(--color-terracotta)' }} />
                <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                  {t('Balance', 'Saldo')}
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-terracotta)' }}>
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
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: entry.type === 'income' ? '#05966920' : '#DC262620',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {entry.type === 'income' ? (
                    <TrendingUp size={20} style={{ color: '#059669' }} />
                  ) : (
                    <TrendingDown size={20} style={{ color: '#DC2626' }} />
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
                    fontWeight: '700',
                    color: entry.type === 'income' ? '#059669' : '#DC2626',
                    textAlign: 'right',
                    flexShrink: 0,
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
            onClick={() => setShowQrisModal(true)}
            style={{
              padding: '14px 24px',
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow)',
              minHeight: '44px',
            }}
          >
            <QrCode size={20} />
            {t('Pay with QRIS', 'Bayar dengan QRIS')}
          </button>
        </div>
      )}

      {/* Tab 3: Paruman Events */}
      {activeTab === 'paruman' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  style={{
                    padding: '12px 20px',
                    background: 'var(--color-primary)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    minHeight: '44px',
                  }}
                >
                  <Mail size={18} />
                  {t('Send Digital Invitation', 'Kirim Undangan Digital')}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* QRIS Modal */}
      {showQrisModal && (
        <div
          onClick={() => setShowQrisModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowQrisModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: 'var(--color-text-muted)',
                minHeight: '44px',
                minWidth: '44px',
              }}
            >
              <X size={24} />
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: 'var(--color-text)' }}>
                {t('Scan QRIS Code', 'Scan Kode QRIS')}
              </div>
              <div
                style={{
                  width: '200px',
                  height: '200px',
                  background: '#FFFFFF',
                  border: '2px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QrCode size={120} style={{ color: '#1F2937' }} />
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                {t(
                  'Simulated QRIS payment placeholder',
                  'Placeholder pembayaran QRIS simulasi'
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
