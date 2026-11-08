import { useState, useId, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import type { TempleZone, TempleStatus, ZoneLayer } from '../../types';
import { useTempleLocations, isBaliCoordinate } from '../../services/locationStorage';
import { useI18n } from '../../context/I18nContext';
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  MapPin,
  Check,
  AlertTriangle,
  Info,
  Layers,
  Compass,
} from 'lucide-react';
import { SpotlightCard } from '../common/PremiumCards';
import { ConfirmDialog } from '../common/ConfirmDialog';

// Fix for default Leaflet icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const iconDefaultProto = L.Icon.Default.prototype as { _getIconUrl?: unknown };
delete iconDefaultProto._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Interactive map click listener
function LocationPickerEvents({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(
        parseFloat(e.latlng.lat.toFixed(6)),
        parseFloat(e.latlng.lng.toFixed(6))
      );
    },
  });

  return null;
}

function FlyToMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lng)) {
      map.flyTo([lat, lng], map.getZoom(), { duration: 0.8 });
    }
  }, [lat, lng, map]);
  return null;
}

const DEFAULT_ZONES: ZoneLayer[] = [
  { name: 'Perimeter', nameId: 'Batas Luar', color: '#059669', opacity: 0.12, radius: 400 },
  { name: 'Nista Mandala', nameId: 'Nista Mandala', color: '#F59E0B', opacity: 0.18, radius: 250 },
  { name: 'Madya Mandala', nameId: 'Madya Mandala', color: '#D97706', opacity: 0.25, radius: 150 },
  { name: 'Utama Mandala', nameId: 'Utama Mandala', color: '#DC2626', opacity: 0.35, radius: 60 },
];

export function MapCoordinateManager() {
  const { t, lang } = useI18n();
  const { temples, saveTemple, removeTemple, resetDefaults } = useTempleLocations();

  const [editingTempleId, setEditingTempleId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [formId, setFormId] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameId, setNameId] = useState('');
  const [status, setStatus] = useState<TempleStatus>('open');
  const [lat, setLat] = useState<number>(-8.3744);
  const [lng, setLng] = useState<number>(115.4507);
  const [perimeterRadius, setPerimeterRadius] = useState<number>(400);

  // Confirmation dialogs
  const [deleteTarget, setDeleteTarget] = useState<TempleZone | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const latInputId = useId();
  const lngInputId = useId();
  const nameEnInputId = useId();
  const nameIdInputId = useId();
  const statusSelectId = useId();
  const radiusInputId = useId();

  const isFormActive = isCreating || editingTempleId !== null;
  const isCoordValid = isBaliCoordinate(lat, lng);

  const resetForm = () => {
    setEditingTempleId(null);
    setIsCreating(false);
    setFormId('');
    setNameEn('');
    setNameId('');
    setStatus('open');
    setLat(-8.3744);
    setLng(115.4507);
    setPerimeterRadius(400);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsCreating(true);
    // Center of Bali as initial position
    setLat(-8.4095);
    setLng(115.1889);
    setPerimeterRadius(400);
    setFeedbackMsg(null);
  };

  const handleStartEdit = (temple: TempleZone) => {
    setIsCreating(false);
    setEditingTempleId(temple.id);
    setFormId(temple.id);
    setNameEn(temple.name);
    setNameId(temple.nameId);
    setStatus(temple.status);
    setLat(temple.lat);
    setLng(temple.lng);
    const outerZone = temple.zones?.[0]?.radius || 400;
    setPerimeterRadius(outerZone);
    setFeedbackMsg(null);

    // Scroll smoothly to form
    const formElem = document.getElementById('admin-coord-form');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameEn.trim() || !nameId.trim()) {
      setFeedbackMsg({
        type: 'error',
        text: t('Name in English and Indonesian is required', 'Nama dalam Bahasa Inggris dan Indonesia wajib diisi'),
      });
      return;
    }

    if (isNaN(lat) || isNaN(lng)) {
      setFeedbackMsg({
        type: 'error',
        text: t('Latitude and Longitude must be valid numbers', 'Latitude dan Longitude harus berupa angka valid'),
      });
      return;
    }

    const id = isCreating
      ? (formId.trim()
          ? formId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
          : nameEn.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `temple-${Date.now()}`)
      : formId;

    const existingTemple = temples.find((item) => item.id === id);

    // Scale zones proportionally according to outer radius
    const ratio = perimeterRadius / 400;
    const computedZones: ZoneLayer[] = (existingTemple?.zones && existingTemple.zones.length > 0)
      ? existingTemple.zones.map((zone, idx) => ({
          ...zone,
          radius: Math.round((DEFAULT_ZONES[idx]?.radius || 100) * ratio),
        }))
      : DEFAULT_ZONES.map((zone) => ({
          ...zone,
          radius: Math.round(zone.radius * ratio),
        }));

    const templeData: TempleZone = {
      id,
      name: nameEn.trim(),
      nameId: nameId.trim(),
      status,
      lat,
      lng,
      zones: computedZones,
      rules: existingTemple?.rules || [
        {
          id: 'r1',
          textEn: 'Wear kamen (sarong) and senteng (sash) at all times',
          textId: 'Kenakan kamen (sarung) dan senteng (selendang) setiap saat',
          icon: 'shirt',
        },
        {
          id: 'r2',
          textEn: 'Respect holy areas and follow pemangku guidance',
          textId: 'Hormati area suci dan ikuti arahan pemangku',
          icon: 'shield-check',
        },
      ],
    };

    saveTemple(templeData);
    setFeedbackMsg({
      type: 'success',
      text: t(
        `Successfully saved "${templeData.name}" with coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        `Berhasil menyimpan "${templeData.nameId}" dengan kordinat (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      ),
    });
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      removeTemple(deleteTarget.id);
      if (editingTempleId === deleteTarget.id) {
        resetForm();
      }
      setFeedbackMsg({
        type: 'success',
        text: t(`Deleted location "${deleteTarget.name}"`, `Menghapus lokasi "${deleteTarget.nameId}"`),
      });
      setDeleteTarget(null);
    }
  };

  const handleConfirmReset = () => {
    resetDefaults();
    resetForm();
    setShowResetConfirm(false);
    setFeedbackMsg({
      type: 'success',
      text: t('Reset all map locations to default seed data', 'Mengembalikan semua kordinat lokasi pura ke data bawaan'),
    });
  };

  return (
    <div className="space-y-8" style={{ color: 'var(--color-text)' }}>
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="text-[var(--color-primary)]" size={24} />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t('Map Coordinates & Temple Management', 'Manajemen Kordinat & Pura Peta')}
            </h2>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            {t(
              'Input and edit live GPS coordinates and geofence parameters directly reflected on the Tourist Map.',
              'Input dan ubah kordinat GPS serta parameter geofence yang langsung tampil di Peta Wisatawan.'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleStartCreate}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm"
          >
            <Plus size={16} />
            <span>{t('Add New Location', 'Tambah Kordinat Lokasi')}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
            title={t('Reset to seed data', 'Reset ke data awal')}
          >
            <RotateCcw size={16} />
            <span>{t('Reset Defaults', 'Reset Bawaan')}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          role="status"
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800'
          }`}
        >
          {feedbackMsg.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
          <span className="text-sm font-medium">{feedbackMsg.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="ml-auto text-xs opacity-75 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Editor / Form Section */}
      {isFormActive && (
        <div id="admin-coord-form" className="glass-card p-6 sm:p-8 rounded-2xl shadow-lg border border-[var(--color-border)]">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {isCreating
                    ? t('Input New Map Location', 'Input Kordinat Lokasi Baru')
                    : t(`Edit Location: ${nameEn || formId}`, `Ubah Kordinat: ${nameId || formId}`)}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {t(
                    'Click on the map or drag the pin to set exact coordinates, or type latitude & longitude manually.',
                    'Klik pada peta atau ketik latitude & longitude secara langsung untuk menentukan kordinat.'
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs px-3 py-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]"
            >
              {t('Cancel', 'Batal')}
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-6 space-y-4">
                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={nameEnInputId} className="block text-xs font-semibold uppercase tracking-wider mb-1">
                      {t('Temple Name (English)', 'Nama Pura (Inggris)')} *
                    </label>
                    <input
                      id={nameEnInputId}
                      type="text"
                      required
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. Pura Tanah Lot"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label htmlFor={nameIdInputId} className="block text-xs font-semibold uppercase tracking-wider mb-1">
                      {t('Temple Name (Indonesian)', 'Nama Pura (Indonesia)')} *
                    </label>
                    <input
                      id={nameIdInputId}
                      type="text"
                      required
                      value={nameId}
                      onChange={(e) => setNameId(e.target.value)}
                      placeholder="contoh: Pura Tanah Lot"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                </div>

                {/* ID & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="admin-temple-id" className="block text-xs font-semibold uppercase tracking-wider mb-1">
                      {t('Unique ID / Slug', 'ID Unik')}
                    </label>
                    <input
                      id="admin-temple-id"
                      type="text"
                      disabled={!isCreating}
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      placeholder={isCreating ? t('Auto-generated if empty', 'Otomatis jika kosong') : undefined}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label htmlFor={statusSelectId} className="block text-xs font-semibold uppercase tracking-wider mb-1">
                      {t('Access Status', 'Status Akses')} *
                    </label>
                    <select
                      id={statusSelectId}
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TempleStatus)}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="open">{t('Open (Buka)', 'Buka (Open)')}</option>
                      <option value="restricted">{t('Restricted Access (Akses Terbatas)', 'Akses Terbatas')}</option>
                      <option value="closed">{t('Closed for Worship (Ditutup untuk Ibadah)', 'Ditutup untuk Ibadah')}</option>
                    </select>
                  </div>
                </div>

                {/* Coordinates Input */}
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={14} className="text-[var(--color-primary)]" />
                      {t('Coordinates (Latitude & Longitude)', 'Kordinat (Latitude & Longitude)')}
                    </span>
                    {!isCoordValid && (
                      <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {t('Outside typical Bali region', 'Di luar wilayah Bali')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={latInputId} className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        {t('Latitude (e.g. -8.3744)', 'Latitude (contoh: -8.3744)')}
                      </label>
                      <input
                        id={latInputId}
                        type="number"
                        step="0.000001"
                        required
                        value={isNaN(lat) ? '' : lat}
                        onChange={(e) => setLat(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                    <div>
                      <label htmlFor={lngInputId} className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        {t('Longitude (e.g. 115.4507)', 'Longitude (contoh: 115.4507)')}
                      </label>
                      <input
                        id={lngInputId}
                        type="number"
                        step="0.000001"
                        required
                        value={isNaN(lng) ? '' : lng}
                        onChange={(e) => setLng(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                    <Info size={12} />
                    {t(
                      'Tip: Click anywhere on the map to set coordinates automatically.',
                      'Petunjuk: Klik di mana saja pada peta untuk mengatur kordinat otomatis.'
                    )}
                  </p>
                </div>

                {/* Geofence Perimeter Radius */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor={radiusInputId} className="text-xs font-semibold uppercase tracking-wider">
                      {t('Outer Perimeter Radius', 'Radius Batas Luar')} ({perimeterRadius}m)
                    </label>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {t('Mandala zones scale automatically', 'Zona Mandala berskala proporsional')}
                    </span>
                  </div>
                  <input
                    id={radiusInputId}
                    type="range"
                    min="100"
                    max="1200"
                    step="50"
                    value={perimeterRadius}
                    onChange={(e) => setPerimeterRadius(parseInt(e.target.value, 10))}
                    className="w-full accent-[var(--color-primary)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] mt-1">
                    <span>100m</span>
                    <span>400m ({t('Default', 'Bawaan')})</span>
                    <span>1200m</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Leaflet Coordinate Picker Map */}
              <div className="lg:col-span-6 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-[var(--color-primary)]" />
                    {t('Interactive Coordinate Picker', 'Peta Pemilih Kordinat Interaktif')}
                  </span>
                  <span className="text-xs font-mono bg-[var(--color-surface-alt)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </span>
                </div>

                <div
                  className="rounded-xl overflow-hidden border border-[var(--color-border)] flex-1"
                  style={{ minHeight: '340px', height: '100%', position: 'relative' }}
                >
                  <MapContainer
                    center={[lat || -8.3744, lng || 115.4507]}
                    zoom={11}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%', minHeight: '340px' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <LocationPickerEvents
                      onPick={(newLat, newLng) => {
                        setLat(newLat);
                        setLng(newLng);
                      }}
                    />

                    <FlyToMarker lat={lat} lng={lng} />

                    {/* Outer Perimeter Circle Preview */}
                    {!isNaN(lat) && !isNaN(lng) && (
                      <>
                        <Circle
                          center={[lat, lng]}
                          radius={perimeterRadius}
                          pathOptions={{
                            color: '#059669',
                            fillColor: '#059669',
                            fillOpacity: 0.15,
                            weight: 2,
                          }}
                        />
                        <Circle
                          center={[lat, lng]}
                          radius={Math.round(perimeterRadius * 0.2)}
                          pathOptions={{
                            color: '#DC2626',
                            fillColor: '#DC2626',
                            fillOpacity: 0.35,
                            weight: 2,
                          }}
                        />
                        <Marker
                          position={[lat, lng]}
                          draggable={true}
                          eventHandlers={{
                            dragend: (e) => {
                              const marker = e.target;
                              const position = marker.getLatLng();
                              setLat(parseFloat(position.lat.toFixed(6)));
                              setLng(parseFloat(position.lng.toFixed(6)));
                            },
                          }}
                        />
                      </>
                    )}
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary px-4 py-2 text-sm rounded-lg"
              >
                {t('Cancel', 'Batal')}
              </button>
              <button
                type="submit"
                className="btn-primary px-6 py-2 text-sm font-semibold rounded-lg flex items-center gap-2"
              >
                <Check size={16} />
                <span>{t('Save Location & Coordinates', 'Simpan Kordinat & Lokasi')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Stored Coordinates / Temples */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold flex items-center gap-2">
            <span>{t('Configured Locations', 'Daftar Kordinat Lokasi')}</span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              {temples.length}
            </span>
          </h3>
          <span className="text-xs text-[var(--color-text-muted)]">
            {t('All coordinates sync live to map', 'Semua kordinat tersinkron langsung ke peta')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {temples.map((temple) => {
            const isEditingThis = editingTempleId === temple.id;
            return (
              <SpotlightCard
                key={temple.id}
                className={`glass-card p-5 rounded-xl border transition-all ${
                  isEditingThis ? 'ring-2 ring-[var(--color-primary)]' : 'border-[var(--color-border)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-bold text-base leading-snug">
                      {lang === 'en' ? temple.name : temple.nameId}
                    </h4>
                    <span className="text-xs text-[var(--color-text-muted)] font-mono">
                      id: {temple.id}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      temple.status === 'open'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : temple.status === 'restricted'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {temple.status}
                  </span>
                </div>

                {/* Coordinate details */}
                <div className="p-2.5 rounded-lg bg-[var(--color-surface-alt)] mb-4 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)] font-sans">Latitude:</span>
                    <span className="font-semibold">{temple.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)] font-sans">Longitude:</span>
                    <span className="font-semibold">{temple.lng.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--color-border)] pt-1 mt-1 font-sans">
                    <span className="text-[var(--color-text-muted)]">{t('Geofence Zones:', 'Zona Geofence:')}</span>
                    <span className="font-semibold">{temple.zones?.length || 0} {t('layers', 'lapisan')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(temple)}
                    className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] text-[var(--color-primary)] text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Pencil size={14} />
                    <span>{t('Edit Coordinates', 'Ubah Kordinat')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(temple)}
                    className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 text-xs flex items-center gap-1.5 transition-colors"
                    title={t('Delete location', 'Hapus lokasi')}
                  >
                    <Trash2 size={14} />
                    <span className="sr-only sm:not-sr-only">{t('Delete', 'Hapus')}</span>
                  </button>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('Delete Location', 'Hapus Lokasi')}
        message={t(
          `Are you sure you want to remove "${deleteTarget?.name}"? It will no longer appear on the tourist map.`,
          `Apakah Anda yakin ingin menghapus "${deleteTarget?.nameId}"? Lokasi ini tidak akan lagi tampil di peta wisatawan.`
        )}
        confirmLabel={t('Yes, Delete', 'Ya, Hapus')}
        cancelLabel={t('Cancel', 'Batal')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={showResetConfirm}
        title={t('Reset Coordinates to Defaults', 'Reset Kordinat ke Bawaan')}
        message={t(
          'This will overwrite all custom coordinates and restore BaliGuide Adat default seed temples (Besakih, Uluwatu, Tirta Empul). Continue?',
          'Tindakan ini akan menimpa semua kordinat khusus dan memulihkan data bawaan pura BaliGuide Adat (Besakih, Uluwatu, Tirta Empul). Lanjutkan?'
        )}
        confirmLabel={t('Yes, Reset', 'Ya, Reset')}
        cancelLabel={t('Cancel', 'Batal')}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
