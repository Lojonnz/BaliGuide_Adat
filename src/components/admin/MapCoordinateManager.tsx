import { useState, useId, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { isBaliCoordinate } from '../../services/locationStorage';
import {
  getWilayah,
  updateWilayahCoordinates,
  type Wilayah,
  FALLBACK_BALI_WILAYAH,
} from '../../services/api';
import { useI18n } from '../../context/I18nContext';
import {
  MapPin,
  Check,
  AlertTriangle,
  RotateCcw,
  Compass,
  FileText,
  Save,
  Search,
  ChevronRight,
  Crosshair,
  RefreshCw,
} from 'lucide-react';

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

// Interactive map click listener for coordinate picking
function LocationPickerEvents({
  selectedWilayah,
  onPick,
}: {
  selectedWilayah: Wilayah | null;
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (selectedWilayah) {
        onPick(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
      }
    },
  });
  return null;
}

// Controller to smoothly animate map center to selected wilayah coordinates
function FlyToMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lng)) {
      map.flyTo([lat, lng], 10, { duration: 1.2 });
    }
  }, [lat, lng, map]);
  return null;
}

// Custom DivIcon for Wilayah pins on the map
function createWilayahPinIcon(isSelected: boolean, nama: string) {
  const shortName = nama.replace('Kabupaten ', '');
  const bg = isSelected ? '#ea580c' : '#4f46e5';
  const border = isSelected ? '#ffffff' : 'rgba(255,255,255,0.9)';

  return L.divIcon({
    className: 'wilayah-custom-pin',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
        pointer-events: auto;
        cursor: pointer;
      ">
        <div style="
          background: ${bg};
          color: #ffffff;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          border: 2px solid ${border};
          margin-bottom: 2px;
          transition: transform 0.2s ease;
        ">
          ${shortName}
        </div>
        <div style="
          width: ${isSelected ? '18px' : '14px'};
          height: ${isSelected ? '18px' : '14px'};
          background: ${bg};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

interface MapCoordinateManagerProps {
  onWilayahUpdated?: (wilayahList: Wilayah[]) => void;
}

export function MapCoordinateManager({ onWilayahUpdated }: MapCoordinateManagerProps) {
  const { t } = useI18n();

  const [wilayahList, setWilayahList] = useState<Wilayah[]>([]);
  const [selectedWilayah, setSelectedWilayah] = useState<Wilayah | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for selected wilayah
  const [lat, setLat] = useState<number>(-8.4543);
  const [lng, setLng] = useState<number>(115.3549);

  // Feedback notifications
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const latInputId = useId();
  const lngInputId = useId();
  const searchInputId = useId();
  const formRef = useRef<HTMLDivElement>(null);
  const isCoordValid = isBaliCoordinate(lat, lng);

  // Fetch all 9 Kabupaten/Kota in Bali from database db_adatnusa
  const fetchWilayahData = async () => {
    setLoading(true);
    try {
      const response = await getWilayah(17);
      if (response && response.success && response.data) {
        setWilayahList(response.data);
        if (onWilayahUpdated) {
          onWilayahUpdated(response.data);
        }
      }
    } catch (err) {
      console.error('Failed to load wilayah data:', err);
      setFeedbackMsg({
        type: 'error',
        text: t('Failed to load wilayah from database. Using fallback data.', 'Gagal memuat wilayah dari database. Menggunakan data cadangan.'),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      setLoading(true);
      try {
        const response = await getWilayah(17);
        if (!isMounted) return;
        if (response && response.success && response.data) {
          setWilayahList(response.data);
          if (onWilayahUpdated) {
            onWilayahUpdated(response.data);
          }
          if (response.data.length > 0) {
            const first = response.data[0];
            setSelectedWilayah(first);
            setLat(first.latitude ?? -8.4543);
            setLng(first.longitude ?? 115.3549);
          }
        }
      } catch (err) {
        console.error('Failed to load initial wilayah:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [onWilayahUpdated]);

  // Handle selecting a wilayah from list, table, or map marker
  const handleSelectWilayah = (wilayah: Wilayah, scrollToForm = false) => {
    setSelectedWilayah(wilayah);
    const targetLat = wilayah.latitude !== null && !isNaN(wilayah.latitude) ? wilayah.latitude : -8.4095;
    const targetLng = wilayah.longitude !== null && !isNaN(wilayah.longitude) ? wilayah.longitude : 115.1889;
    setLat(targetLat);
    setLng(targetLng);
    setFeedbackMsg(null);

    if (scrollToForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Revert coordinates to default fallback seed coordinates
  const handleResetToFallback = () => {
    if (!selectedWilayah) return;
    const fallback = FALLBACK_BALI_WILAYAH.find((f) => f.id === selectedWilayah.id);
    if (fallback) {
      setLat(fallback.latitude ?? fallback.coordinates.lat);
      setLng(fallback.longitude ?? fallback.coordinates.lng);
      setFeedbackMsg({
        type: 'success',
        text: t(
          `Reverted coordinates to default for ${selectedWilayah.nama}. Click "Save" to persist to database.`,
          `Kordinat dikembalikan ke bawaan untuk ${selectedWilayah.nama}. Klik "Simpan" untuk menerapkan ke database.`
        ),
      });
    }
  };

  // Save updated coordinates to db_adatnusa via API
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWilayah) return;

    if (isNaN(lat) || isNaN(lng)) {
      setFeedbackMsg({
        type: 'error',
        text: t('Please enter valid numeric latitude and longitude', 'Masukkan latitude dan longitude numerik yang valid'),
      });
      return;
    }

    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const response = await updateWilayahCoordinates(selectedWilayah.id, lat, lng);

      if (response && response.success) {
        const updatedList = wilayahList.map((w) =>
          w.id === selectedWilayah.id
            ? {
                ...w,
                latitude: lat,
                longitude: lng,
                coordinates: { lat, lng },
              }
            : w
        );

        setWilayahList(updatedList);
        setSelectedWilayah({
          ...selectedWilayah,
          latitude: lat,
          longitude: lng,
          coordinates: { lat, lng },
        });

        if (onWilayahUpdated) {
          onWilayahUpdated(updatedList);
        }

        setFeedbackMsg({
          type: 'success',
          text: t(
            `Coordinates for "${selectedWilayah.nama}" (ID: ${selectedWilayah.id}) successfully updated in db_adatnusa!`,
            `Kordinat "${selectedWilayah.nama}" (ID: ${selectedWilayah.id}) berhasil diperbarui di database db_adatnusa!`
          ),
        });
      } else {
        throw new Error(response.message || response.error || 'Failed to update coordinates');
      }
    } catch (err: unknown) {
      console.error('Update coordinates failed:', err);
      const errMsg = err instanceof Error ? err.message : 'Server error';
      setFeedbackMsg({
        type: 'error',
        text: t(
          `Failed to save coordinates: ${errMsg}`,
          `Gagal menyimpan kordinat: ${errMsg}`
        ),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredWilayah = wilayahList.filter((w) =>
    w.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.kode && w.kode.toLowerCase().includes(searchQuery.toLowerCase())) ||
    String(w.id).includes(searchQuery)
  );

  return (
    <div className="space-y-8" style={{ color: 'var(--color-text)' }}>
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="text-[var(--color-primary)]" size={24} />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t('Adat Territory Coordinate Management', 'Manajemen Kordinat Wilayah Adat')}
            </h2>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            {t(
              'Manage and update genuine GPS coordinates for all 9 Bali Regencies/Cities in db_adatnusa (wilayah table). Updates sync live to the tourist map.',
              'Kelola dan perbarui kordinat GPS asli untuk 9 Kabupaten/Kota Bali di db_adatnusa (tabel wilayah). Perubahan langsung tersinkron ke peta publik.'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchWilayahData}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
            title={t('Refresh data from database', 'Muat ulang data dari database')}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>{t('Refresh Data', 'Muat Ulang')}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          role="status"
          className={`p-4 rounded-xl flex items-center gap-3 border transition-all ${
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
            className="ml-auto text-xs opacity-75 hover:opacity-100 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Map & Editor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Map */}
        <div className="lg:col-span-7 glass-card p-4 rounded-2xl flex flex-col" style={{ minHeight: '460px' }}>
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[var(--color-primary)]" />
              <h3 className="font-bold text-sm">
                {t('Geospatial Wilayah Map', 'Peta Geospasial Wilayah')}
              </h3>
            </div>
            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
              <Crosshair size={13} />
              {selectedWilayah
                ? t('Click anywhere on map to reposition coordinates', 'Klik peta untuk memilih kordinat baru')
                : t('Select a wilayah to edit', 'Pilih wilayah untuk mengedit')}
            </span>
          </div>

          <div className="relative flex-1 w-full rounded-xl overflow-hidden border border-[var(--color-border)]" style={{ minHeight: '380px' }}>
            <MapContainer
              center={[-8.45, 115.18]}
              zoom={9}
              style={{ width: '100%', height: '100%', minHeight: '380px' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {/* Fly to selected coords */}
              {selectedWilayah && (
                <FlyToMarker lat={lat} lng={lng} />
              )}

              {/* Click to pick location */}
              <LocationPickerEvents
                selectedWilayah={selectedWilayah}
                onPick={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                  setFeedbackMsg({
                    type: 'success',
                    text: t(
                      `Picked coordinate: [${newLat}, ${newLng}]. Click "Save Coordinates" to apply.`,
                      `Kordinat terpilih: [${newLat}, ${newLng}]. Klik "Simpan Kordinat" untuk menyimpan.`
                    ),
                  });
                }}
              />

              {/* Highlight Circle around currently edited coordinates */}
              {selectedWilayah && !isNaN(lat) && !isNaN(lng) && (
                <Circle
                  center={[lat, lng]}
                  radius={4000}
                  pathOptions={{
                    color: '#ea580c',
                    fillColor: '#ea580c',
                    fillOpacity: 0.15,
                    weight: 2,
                    dashArray: '4, 6',
                  }}
                />
              )}

              {/* Wilayah Markers */}
              {wilayahList.map((wilayah) => {
                const isSelected = selectedWilayah?.id === wilayah.id;
                const markerLat = isSelected ? lat : (wilayah.latitude ?? -8.4095);
                const markerLng = isSelected ? lng : (wilayah.longitude ?? 115.1889);

                return (
                  <Marker
                    key={wilayah.id}
                    position={[markerLat, markerLng]}
                    icon={createWilayahPinIcon(isSelected, wilayah.nama)}
                    eventHandlers={{
                      click: () => handleSelectWilayah(wilayah),
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-1.5" style={{ minWidth: '170px' }}>
                        <div className="font-bold text-sm">{wilayah.nama}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          ID: <span className="font-mono font-semibold">{wilayah.id}</span>
                        </div>
                        <div className="text-xs font-mono">
                          GPS: {markerLat.toFixed(4)}, {markerLng.toFixed(4)}
                        </div>
                        <div className="text-xs text-[var(--color-primary)] font-semibold">
                          {wilayah.aturan_count || 0} {t('rules registered', 'aturan adat')}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectWilayah(wilayah, true)}
                          className="w-full mt-2 px-2.5 py-1 text-xs font-semibold rounded bg-[var(--color-primary)] text-white hover:opacity-90"
                        >
                          {t('Edit Coordinates', 'Ubah Kordinat')}
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Right: Form Editor */}
        <div ref={formRef} className="lg:col-span-5 glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {selectedWilayah
                      ? t(`Edit: ${selectedWilayah.nama}`, `Ubah: ${selectedWilayah.nama}`)
                      : t('Select a Wilayah', 'Pilih Wilayah')}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {t('Wilayah ID in db_adatnusa:', 'ID Wilayah di db_adatnusa:')}{' '}
                    <span className="font-mono font-bold text-[var(--color-text)]">
                      {selectedWilayah ? selectedWilayah.id : '-'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {selectedWilayah ? (
              <form onSubmit={handleSave} className="space-y-4">
                {/* Wilayah Info Card */}
                <div className="p-3.5 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border)] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--color-text-muted)]">{t('Region Name', 'Nama Wilayah')}:</span>
                    <span className="font-bold text-[var(--color-text)]">{selectedWilayah.nama}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--color-text-muted)]">{t('Region Code / Type', 'Kode / Jenis')}:</span>
                    <span className="font-mono text-[var(--color-text-muted)]">
                      {selectedWilayah.kode || selectedWilayah.jenis}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--color-text-muted)]">{t('Associated Rules', 'Aturan Terdaftar')}:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedWilayah.aturan_count || 0} {t('rules', 'aturan')}
                    </span>
                  </div>
                </div>

                {/* Coordinate Inputs */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor={latInputId} className="text-xs font-semibold uppercase tracking-wider">
                      Latitude
                    </label>
                    <span className="text-[11px] text-[var(--color-text-muted)]">WGS84 GPS</span>
                  </div>
                  <input
                    id={latInputId}
                    type="number"
                    step="0.000001"
                    required
                    value={isNaN(lat) ? '' : lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="-8.454300"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <label htmlFor={lngInputId} className="text-xs font-semibold uppercase tracking-wider">
                      Longitude
                    </label>
                    <span className="text-[11px] text-[var(--color-text-muted)]">WGS84 GPS</span>
                  </div>
                  <input
                    id={lngInputId}
                    type="number"
                    step="0.000001"
                    required
                    value={isNaN(lng) ? '' : lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="115.354900"
                  />
                </div>

                {/* Coordinate Validation Badge */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  {isCoordValid ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Check size={14} />
                      {t('Valid Bali coordinates', 'Kordinat valid di Pulau Bali')}
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {t('Coordinates outside Bali bounds', 'Kordinat berada di luar wilayah Bali')}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetToFallback}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] flex items-center gap-1 transition-colors"
                    title={t('Reset to original default coordinates', 'Kembalikan ke kordinat bawaan')}
                  >
                    <RotateCcw size={12} />
                    <span>{t('Reset', 'Kordinat Asli')}</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 space-y-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm shadow-sm transition-all"
                  >
                    <Save size={16} />
                    <span>
                      {isSaving
                        ? t('Saving to db_adatnusa...', 'Menyimpan ke database...')
                        : t('Save Coordinates to Database', 'Simpan Kordinat ke Database')}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 text-[var(--color-text-muted)] text-sm">
                {t('Please select a wilayah from the list or map to edit coordinates.', 'Silakan pilih wilayah dari daftar atau peta untuk mengubah kordinat.')}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
            💡 {t('Tip: Click anywhere on the map above to accurately reposition the GPS pin for the selected wilayah.', 'Tips: Klik di bagian manapun pada peta di atas untuk memindahkan titik kordinat GPS secara akurat.')}
          </div>
        </div>
      </div>

      {/* Wilayah List / Table (9 Regencies/Cities of Bali) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <span>{t('Bali Regencies & Cities (db_adatnusa)', 'Daftar 9 Wilayah Kabupaten & Kota Bali')}</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                {wilayahList.length}
              </span>
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {t('Table `wilayah` in db_adatnusa with associated customary rules count', 'Data tabel `wilayah` di db_adatnusa dengan jumlah aturan adat')}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              id={searchInputId}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search wilayah...', 'Cari wilayah...')}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto glass-card rounded-2xl border border-[var(--color-border)] shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">{t('Region Name', 'Nama Wilayah')}</th>
                <th className="py-3 px-4">{t('Coordinates (Latitude, Longitude)', 'Kordinat (Lat, Lng)')}</th>
                <th className="py-3 px-4">{t('Rules Count', 'Jumlah Aturan')}</th>
                <th className="py-3 px-4">{t('Status', 'Status GPS')}</th>
                <th className="py-3 px-4 text-right">{t('Action', 'Aksi')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredWilayah.map((wilayah) => {
                const isSelected = selectedWilayah?.id === wilayah.id;
                const hasValidCoord =
                  wilayah.latitude !== null &&
                  wilayah.longitude !== null &&
                  !isNaN(wilayah.latitude) &&
                  !isNaN(wilayah.longitude);

                return (
                  <tr
                    key={wilayah.id}
                    onClick={() => handleSelectWilayah(wilayah, true)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--color-primary-light)]/40 font-medium'
                        : 'hover:bg-[var(--color-surface-alt)]'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--color-surface-alt)] border border-[var(--color-border)]">
                        {wilayah.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[var(--color-text)]">{wilayah.nama}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{wilayah.jenis}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {hasValidCoord ? (
                        <span>
                          {wilayah.latitude?.toFixed(5)}, {wilayah.longitude?.toFixed(5)}
                        </span>
                      ) : (
                        <span className="text-amber-500 italic">{t('Unset', 'Belum diset')}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <FileText size={12} />
                        {wilayah.aturan_count || 0} {t('rules', 'aturan')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {hasValidCoord ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check size={14} />
                          {t('Mapped', 'Terpetakan')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <AlertTriangle size={14} />
                          {t('No GPS', 'Tanpa GPS')}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectWilayah(wilayah, true);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold inline-flex items-center gap-1 transition-colors ${
                          isSelected
                            ? 'bg-[var(--color-primary)] text-white border-transparent'
                            : 'border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] text-[var(--color-primary)]'
                        }`}
                      >
                        <span>{isSelected ? t('Selected', 'Terpilih') : t('Edit', 'Pilih & Ubah')}</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredWilayah.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                    {t('No wilayah found matching your search.', 'Tidak ada wilayah yang cocok dengan pencarian.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
