import { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import { temples } from '../../data';
import { useI18n } from '../../context/I18nContext';
import { getWilayahAturan, getAturanByKabupaten, type WilayahAturan, type AturanAdat } from '../../services/api';
import L from 'leaflet';
import { gsap } from 'gsap';
import { FileText, MapPin, Tag, X, ChevronRight, ExternalLink } from 'lucide-react';

// Fix for default marker icon in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom icon for Aturan markers (different color)
const aturanIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'aturan-marker',
});

// Component to handle map flyTo on wilayah selection
function MapController({ selectedWilayah }: { selectedWilayah: WilayahAturan | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedWilayah) {
      map.flyTo([selectedWilayah.coordinates.lat, selectedWilayah.coordinates.lng], 10, {
        duration: 1.5,
      });
    }
  }, [selectedWilayah, map]);

  return null;
}

export function TempleMap() {
  const { t, lang } = useI18n();
  const legendRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [wilayahList, setWilayahList] = useState<WilayahAturan[]>([]);
  const [selectedWilayah, setSelectedWilayah] = useState<WilayahAturan | null>(null);
  const [aturanList, setAturanList] = useState<AturanAdat[]>([]);
  const [selectedAturan, setSelectedAturan] = useState<AturanAdat | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAturanPanel, setShowAturanPanel] = useState(false);

  // Track "activated" state so first tap/click enables scroll-wheel zoom
  const mapActivatedRef = useRef(false);

  const statusLabels = {
    open: { en: 'Open', id: 'Buka' },
    restricted: { en: 'Restricted Access', id: 'Akses Terbatas' },
    closed: { en: 'Closed for Worship', id: 'Ditutup untuk Ibadah' },
  };

  // Fetch wilayah dengan aturan
  useEffect(() => {
    async function fetchWilayah() {
      try {
        const response = await getWilayahAturan();
        setWilayahList(response.data);
      } catch (error) {
        console.error('Failed to fetch wilayah:', error);
      }
    }
    fetchWilayah();
  }, []);

  // Fetch aturan ketika wilayah dipilih
  useEffect(() => {
    if (!selectedWilayah) {
      setAturanList([]);
      setShowAturanPanel(false);
      return;
    }

    async function fetchAturan() {
      try {
        setLoading(true);
        const aturan = await getAturanByKabupaten(selectedWilayah.kabupaten);
        setAturanList(aturan);
        setShowAturanPanel(true);
      } catch (error) {
        console.error('Failed to fetch aturan:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAturan();
  }, [selectedWilayah]);

  useEffect(() => {
    if (legendRef.current) {
      gsap.fromTo(
        legendRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.3, ease: 'power3.out', clearProps: 'transform,opacity' }
      );
    }

    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out', clearProps: 'opacity' }
      );
    }
  }, []);

  const handleMapClick = () => {
    if (!mapActivatedRef.current && mapRef.current) {
      mapRef.current.scrollWheelZoom.enable();
      mapActivatedRef.current = true;
    }
  };

  const handleWilayahClick = (wilayah: WilayahAturan) => {
    setSelectedWilayah(wilayah);
  };

  const handleCloseAturanPanel = () => {
    setShowAturanPanel(false);
    setSelectedWilayah(null);
    setAturanList([]);
  };

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      className="relative w-full h-full"
      onClick={handleMapClick}
      style={{ position: 'relative', zIndex: 1 }}
    >
      <MapContainer
        center={[-8.4095, 115.1889]}
        zoom={9}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        scrollWheelZoom={false}
        touchZoom={true}
        dragging={true}
        doubleClickZoom={true}
        zoomControl={true}
        ref={(m) => { mapRef.current = m; }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapController selectedWilayah={selectedWilayah} />

        {/* Temple markers & zones */}
        {temples.map((temple) => (
          <div key={temple.id}>
            {/* Render zones from outermost to innermost */}
            {[...temple.zones].reverse().map((zone, idx) => (
              <Circle
                key={`${temple.id}-${idx}`}
                center={[temple.lat, temple.lng]}
                radius={zone.radius}
                pathOptions={{
                  color: zone.color,
                  fillColor: zone.color,
                  fillOpacity: zone.opacity,
                  weight: 2,
                }}
              />
            ))}

            {/* Temple marker */}
            <Marker position={[temple.lat, temple.lng]}>
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <strong
                    className="text-base font-semibold block mb-1"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {lang === 'en' ? temple.name : temple.nameId}
                  </strong>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {t(statusLabels[temple.status].en, statusLabels[temple.status].id)}
                  </span>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}

        {/* Wilayah markers for aturan adat */}
        {wilayahList.map((wilayah) => (
          <Marker
            key={wilayah.kabupaten}
            position={[wilayah.coordinates.lat, wilayah.coordinates.lng]}
            icon={aturanIcon}
            eventHandlers={{
              click: () => handleWilayahClick(wilayah),
            }}
          >
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                  <strong
                    className="text-base font-semibold"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {wilayah.kabupaten.replace('Kabupaten ', '')}
                  </strong>
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-text-muted)',
                    marginBottom: '8px',
                  }}
                >
                  {wilayah.jumlah_aturan} {t('traditional rules', 'aturan adat')}
                </div>
                <button
                  onClick={() => handleWilayahClick(wilayah)}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  {t('View Rules', 'Lihat Aturan')}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend Overlay with Glass Card */}
      <div
        ref={legendRef}
        aria-label={t('Zone layers legend', 'Legenda lapisan zona')}
        className="glass-card absolute bottom-5 right-5 p-4 rounded-xl"
        style={{
          zIndex: 1000,
          minWidth: '220px',
          maxWidth: 'calc(100vw - 40px)',
        }}
      >
        <h4
          className="text-sm font-bold mb-3"
          style={{ color: 'var(--color-text)' }}
        >
          {t('Map Legend', 'Legenda Peta')}
        </h4>
        <div className="flex flex-col gap-2">
          {[
            { name: 'Perimeter', nameId: 'Batas Luar', color: '#059669' },
            { name: 'Nista Mandala', nameId: 'Nista Mandala', color: '#F59E0B' },
            { name: 'Madya Mandala', nameId: 'Madya Mandala', color: '#D97706' },
            { name: 'Utama Mandala', nameId: 'Utama Mandala', color: '#DC2626' },
          ].map((zone) => (
            <div key={zone.name} className="flex items-center gap-2">
              <div
                className="flex-shrink-0 rounded-full border-2"
                style={{
                  width: '16px',
                  height: '16px',
                  background: zone.color,
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: `0 0 8px ${zone.color}50`,
                }}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                {t(zone.name, zone.nameId)}
              </span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '8px', paddingTop: '8px' }}>
            <div className="flex items-center gap-2">
              <FileText size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                {t('Traditional Rules', 'Aturan Adat')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Aturan Panel - Sidebar untuk list aturan di wilayah yang dipilih */}
      {showAturanPanel && (
        <div
          className="glass-card absolute top-0 left-0 bottom-0 overflow-y-auto"
          style={{
            zIndex: 2000,
            width: 'min(400px, 90vw)',
            padding: 'clamp(16px, 3vw, 24px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <h3
                  className="editorial-heading"
                  style={{ fontSize: '18px', marginBottom: '4px', color: 'var(--color-text)' }}
                >
                  {selectedWilayah?.kabupaten.replace('Kabupaten ', '')}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {selectedWilayah?.jumlah_aturan} {t('traditional rules', 'aturan adat')}
                </p>
              </div>
              <button
                onClick={handleCloseAturanPanel}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} style={{ color: 'var(--color-text)' }} />
              </button>
            </div>

            {selectedWilayah && selectedWilayah.kecamatan.length > 0 && (
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                <span style={{ fontWeight: 600 }}>{t('Districts:', 'Kecamatan:')}</span>{' '}
                {selectedWilayah.kecamatan.join(', ')}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid var(--color-primary-light)',
                  borderTop: '3px solid var(--color-primary)',
                  borderRadius: '50%',
                  margin: '0 auto 12px',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                {t('Loading rules...', 'Memuat aturan...')}
              </p>
            </div>
          )}

          {/* Aturan List */}
          {!loading && aturanList.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aturanList.map((aturan) => (
                <button
                  key={aturan.id}
                  onClick={() => setSelectedAturan(aturan)}
                  className="glass-card"
                  style={{
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: '1px solid var(--color-border)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <h4
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      marginBottom: '8px',
                      lineHeight: 1.4,
                    }}
                  >
                    {aturan.nama}
                  </h4>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.5,
                      marginBottom: '8px',
                    }}
                  >
                    {aturan.ringkasan.substring(0, 120)}...
                  </p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ color: 'var(--color-text-muted)' }}>{aturan.komunitas.nama}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={12} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ color: 'var(--color-text-muted)' }}>{aturan.kategori.nama}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600 }}>
                    <span>{t('Read more', 'Selengkapnya')}</span>
                    <ChevronRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && aturanList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <FileText size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                {t('No rules found in this region', 'Tidak ada aturan di wilayah ini')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal untuk aturan yang diklik */}
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
              maxHeight: '85vh',
              overflow: 'auto',
              padding: 'clamp(20px, 4vw, 32px)',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
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
                style={{ color: 'var(--color-text)', marginBottom: '12px', fontSize: '20px' }}
              >
                {selectedAturan.nama}
              </h2>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} />
                  <span>{selectedAturan.komunitas.nama}</span>
                </div>
                <div>
                  {selectedAturan.wilayah.kecamatan}, {selectedAturan.wilayah.kabupaten}
                </div>
              </div>
            </div>

            {/* Ringkasan */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                {t('Summary', 'Ringkasan')}
              </h3>
              <p
                style={{
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  lineHeight: 1.7,
                }}
              >
                {selectedAturan.ringkasan}
              </p>
            </div>

            {/* Isi Lengkap */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                {t('Full Content', 'Isi Lengkap')}
              </h3>
              <div
                style={{
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  maxHeight: '400px',
                  overflow: 'auto',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                }}
              >
                {selectedAturan.isi}
              </div>
            </div>

            {/* Sumber PDF Link */}
            {selectedAturan.sumber && selectedAturan.sumber.url && (
              <div style={{ marginBottom: '20px' }}>
                <a
                  href={selectedAturan.sumber.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--color-primary)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--color-primary-light)';
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                >
                  <ExternalLink size={16} />
                  <span>{t('View Original PDF', 'Lihat PDF Asli')}</span>
                </a>
              </div>
            )}

            <button
              onClick={() => setSelectedAturan(null)}
              style={{
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

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .aturan-marker {
          filter: hue-rotate(200deg) brightness(1.2);
        }
      `}</style>
    </div>
  );
}
