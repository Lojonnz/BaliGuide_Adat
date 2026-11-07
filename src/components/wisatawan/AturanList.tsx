import { useState, useEffect } from 'react';
import { useI18n } from '../../context/I18nContext';
import { getAturanAdat, getKategoriAdat, type AturanAdat, type KategoriAdat } from '../../services/api';
import { ChevronRight, FileText, MapPin, Tag, Loader2, AlertCircle } from 'lucide-react';

export function AturanList() {
  const { t, lang } = useI18n();
  const [aturan, setAturan] = useState<AturanAdat[]>([]);
  const [kategori, setKategori] = useState<KategoriAdat[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAturan, setSelectedAturan] = useState<AturanAdat | null>(null);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [aturanResponse, kategoriResponse] = await Promise.all([
          getAturanAdat({ limit: 50 }),
          getKategoriAdat(),
        ]);

        setAturan(aturanResponse.data);
        setKategori(kategoriResponse.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter by kategori
  useEffect(() => {
    if (selectedKategori === null) return;

    async function fetchFiltered() {
      try {
        setLoading(true);
        const response = await getAturanAdat({
          kategori_id: selectedKategori,
          limit: 50,
        });
        setAturan(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to filter data');
      } finally {
        setLoading(false);
      }
    }

    fetchFiltered();
  }, [selectedKategori]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
        <span className="ml-3" style={{ color: 'var(--color-text-muted)' }}>
          {t('Loading traditional rules...', 'Memuat aturan adat...')}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#DC2626' }} />
        <h3 style={{ color: 'var(--color-text)', marginBottom: '8px' }}>
          {t('Failed to load data', 'Gagal memuat data')}
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          {error}
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '12px' }}>
          {t(
            'Make sure Laragon (Apache + MySQL) is running and API is accessible at http://localhost/baliguide-api',
            'Pastikan Laragon (Apache + MySQL) sudah berjalan dan API dapat diakses di http://localhost/baliguide-api'
          )}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Kategori Filter */}
      <div className="mb-6">
        <h3
          className="editorial-heading"
          style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--color-text)' }}
        >
          {t('Filter by Category', 'Filter berdasarkan Kategori')}
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedKategori(null)}
            className="glass-card"
            style={{
              padding: '8px 16px',
              border: selectedKategori === null ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              background: selectedKategori === null ? 'var(--color-primary-light)' : 'transparent',
              color: selectedKategori === null ? 'var(--color-primary)' : 'var(--color-text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {t('All', 'Semua')} ({aturan.length})
          </button>
          {kategori.map(kat => (
            <button
              key={kat.id}
              onClick={() => setSelectedKategori(kat.id)}
              className="glass-card"
              style={{
                padding: '8px 16px',
                border: selectedKategori === kat.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                background: selectedKategori === kat.id ? 'var(--color-primary-light)' : 'transparent',
                color: selectedKategori === kat.id ? 'var(--color-primary)' : 'var(--color-text)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {kat.nama} ({kat.jumlah_aturan})
            </button>
          ))}
        </div>
      </div>

      {/* Aturan List */}
      {aturan.length === 0 ? (
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>
            {t('No traditional rules found', 'Tidak ada aturan adat ditemukan')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {aturan.map(rule => (
            <button
              key={rule.id}
              onClick={() => setSelectedAturan(rule)}
              className="glass-card"
              style={{
                padding: '20px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      color: 'var(--color-text)',
                      fontSize: '16px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      lineHeight: 1.4,
                    }}
                  >
                    {rule.nama}
                  </h4>

                  <p
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      marginBottom: '12px',
                    }}
                  >
                    {rule.ringkasan.substring(0, 200)}
                    {rule.ringkasan.length > 200 ? '...' : ''}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ color: 'var(--color-text-muted)' }}>{rule.komunitas.nama}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag size={14} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ color: 'var(--color-text-muted)' }}>{rule.kategori.nama}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight size={20} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedAturan && (
        <div
          onClick={() => setSelectedAturan(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass-card"
            style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: 'clamp(20px, 4vw, 32px)',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}
              >
                {selectedAturan.kategori.nama}
              </span>
              <h2
                className="editorial-heading"
                style={{ color: 'var(--color-text)', marginBottom: '12px' }}
              >
                {selectedAturan.nama}
              </h2>
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} />
                  <span>{selectedAturan.komunitas.nama}</span>
                </div>
                <div>
                  {selectedAturan.wilayah.jenis}: {selectedAturan.wilayah.nama}
                </div>
              </div>
            </div>

            <div
              style={{
                color: 'var(--color-text)',
                fontSize: '15px',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedAturan.isi || selectedAturan.ringkasan}
            </div>

            <button
              onClick={() => setSelectedAturan(null)}
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('Close', 'Tutup')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
