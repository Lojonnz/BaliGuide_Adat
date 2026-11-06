import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import { temples } from '../../data';
import { useI18n } from '../../context/I18nContext';
import L from 'leaflet';
import { gsap } from 'gsap';

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

export function TempleMap() {
  const { t, lang } = useI18n();
  const legendRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const statusLabels = {
    open: { en: 'Open', id: 'Buka' },
    restricted: { en: 'Restricted Access', id: 'Akses Terbatas' },
    closed: { en: 'Closed for Worship', id: 'Ditutup untuk Ibadah' },
  };

  useEffect(() => {
    if (legendRef.current) {
      gsap.fromTo(
        legendRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.3, ease: 'power3.out' }
      );
    }

    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <MapContainer
        center={[-8.4095, 115.1889]}
        zoom={9}
        style={{ width: '100%', height: '100%' }}
        // Safeguard #4: scrollWheelZoom disabled so mobile users can scroll
        // the page without getting trapped in the map. touchZoom stays on.
        scrollWheelZoom={false}
        touchZoom={true}
        dragging={true}
        doubleClickZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

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
          {t('Zone Layers', 'Lapisan Zona')}
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
        </div>
      </div>
    </div>
  );
}
