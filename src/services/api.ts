/**
 * API Service Layer
 * Connects React frontend to PHP API backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/baliguide-api';
import { FALLBACK_ATURAN_DATA, FALLBACK_KATEGORI_DATA } from '../data/aturan_fallback';


export interface AturanAdat {
  id: number;
  nama: string;
  slug: string;
  ringkasan: string;
  isi: string;
  tujuan?: string | null;
  penerapan?: string | null;
  konsekuensi?: string | null;
  tanggal_berlaku?: string | null;
  status_berlaku: string;
  status_verifikasi: string;
  created_at: string;
  updated_at: string;
  komunitas: {
    id: number;
    kode?: string | null;
    nama: string;
  };
  kategori: {
    id: number;
    nama: string;
    deskripsi?: string | null;
  };
  wilayah: {
    kecamatan: string;
    kabupaten: string;
    provinsi: string;
  };
  sumber?: {
    id: number;
    judul: string;
    jenis: string;
    tahun: number;
    url: string;
  };
}

export interface KomunitasAdat {
  id: number;
  kode: string | null;
  nama: string;
  deskripsi: string | null;
  alamat: string | null;
  kontak: string | null;
  created_at: string;
  wilayah: {
    id: number;
    nama: string;
    jenis: string;
  };
  jumlah_aturan: number;
}

export interface KategoriAdat {
  id: number;
  nama: string;
  deskripsi: string | null;
  created_at: string;
  jumlah_aturan: number;
}

export interface AturanResponse {
  success: boolean;
  data: AturanAdat[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    count: number;
  };
}

export interface KomunitasResponse {
  success: boolean;
  data: KomunitasAdat[];
  count: number;
}

export interface KategoriResponse {
  success: boolean;
  data: KategoriAdat[];
  count: number;
}

/**
 * Fetch helper with error handling
 */
async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }

    return data as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Get Aturan Adat (Traditional Rules)
 */
export async function getAturanAdat(params?: {
  komunitas_id?: number;
  kategori_id?: number;
  limit?: number;
  offset?: number;
}): Promise<AturanResponse> {
  const query = new URLSearchParams();

  if (params?.komunitas_id) query.set('komunitas_id', params.komunitas_id.toString());
  if (params?.kategori_id) query.set('kategori_id', params.kategori_id.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.offset) query.set('offset', params.offset.toString());

  const endpoint = `/aturan.php${query.toString() ? '?' + query.toString() : ''}`;
  try {
    const response = await fetchAPI<AturanResponse>(endpoint);
    if (response && response.success && response.data && response.data.length > 0) {
      return response;
    }
  } catch (error) {
    console.warn('Backend API offline, using fallback aturan data:', error);
  }

  // Fallback filtering from embedded db_adatnusa seed data
  let filtered = [...FALLBACK_ATURAN_DATA];
  if (params?.kategori_id) {
    filtered = filtered.filter(a => a.kategori.id === params.kategori_id);
  }
  if (params?.komunitas_id) {
    filtered = filtered.filter(a => a.komunitas.id === params.komunitas_id);
  }
  const total = filtered.length;
  const offset = params?.offset || 0;
  const limit = params?.limit || 50;
  filtered = filtered.slice(offset, offset + limit);

  return {
    success: true,
    data: filtered,
    pagination: {
      total,
      limit,
      offset,
      count: filtered.length,
    },
  };
}

/**
 * Get Komunitas Adat (Communities)
 */
export async function getKomunitasAdat(): Promise<KomunitasResponse> {
  return fetchAPI<KomunitasResponse>('/komunitas.php');
}

/**
 * Get Kategori Adat (Categories)
 */
export async function getKategoriAdat(): Promise<KategoriResponse> {
  try {
    const response = await fetchAPI<KategoriResponse>('/kategori.php');
    if (response && response.success && response.data && response.data.length > 0) {
      return response;
    }
  } catch (error) {
    console.warn('Backend API offline, using fallback kategori data:', error);
  }
  return {
    success: true,
    data: FALLBACK_KATEGORI_DATA,
    count: FALLBACK_KATEGORI_DATA.length,
  };
}

/**
 * Get single Aturan by ID (filter from list)
 */
export async function getAturanById(id: number): Promise<AturanAdat | null> {
  const response = await getAturanAdat({ limit: 100 });
  return response.data.find(a => a.id === id) || null;
}

/**
 * Search Aturan by keyword (client-side filter for now)
 */
export async function searchAturan(keyword: string): Promise<AturanAdat[]> {
  const response = await getAturanAdat({ limit: 100 });
  const lower = keyword.toLowerCase();

  return response.data.filter(
    a =>
      a.nama.toLowerCase().includes(lower) ||
      a.ringkasan.toLowerCase().includes(lower) ||
      a.komunitas.nama.toLowerCase().includes(lower) ||
      a.kategori.nama.toLowerCase().includes(lower)
  );
}

/**
 * Wilayah with Aturan count & coordinates
 */
export interface WilayahAturan {
  id?: number;
  kabupaten: string;
  provinsi: string;
  jumlah_aturan: number;
  kecamatan: string[];
  latitude?: number;
  longitude?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface WilayahAturanResponse {
  success: boolean;
  data: WilayahAturan[];
  count: number;
}

/**
 * Wilayah table entity
 */
export interface Wilayah {
  id: number;
  parent_id?: number | null;
  kode?: string | null;
  nama: string;
  jenis: string;
  deskripsi?: string | null;
  latitude: number | null;
  longitude: number | null;
  aturan_count?: number;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
}

export interface WilayahResponse {
  success: boolean;
  data: Wilayah[];
  count: number;
}

export interface WilayahUpdateResponse {
  success: boolean;
  message?: string;
  data?: Wilayah;
  error?: string;
}

/**
 * Fallback coordinates for Bali regencies/cities in case API is unavailable
 */
export const FALLBACK_BALI_WILAYAH: WilayahAturan[] = [
  {
    id: 317,
    kabupaten: 'Kabupaten Bangli',
    provinsi: 'Bali',
    jumlah_aturan: 6,
    kecamatan: ['Bangli', 'Kintamani', 'Susut', 'Tembuku'],
    latitude: -8.4543,
    longitude: 115.3549,
    coordinates: { lat: -8.4543, lng: 115.3549 },
  },
  {
    id: 313,
    kabupaten: 'Kabupaten Tabanan',
    provinsi: 'Bali',
    jumlah_aturan: 5,
    kecamatan: ['Baturiti', 'Kediri', 'Kerambitan', 'Marga', 'Penebel', 'Pupuan', 'Selemadeg', 'Tabanan'],
    latitude: -8.5411,
    longitude: 115.1252,
    coordinates: { lat: -8.5411, lng: 115.1252 },
  },
  {
    id: 319,
    kabupaten: 'Kabupaten Buleleng',
    provinsi: 'Bali',
    jumlah_aturan: 4,
    kecamatan: ['Banjar', 'Buleleng', 'Busungbiu', 'Gerokgak', 'Sawan', 'Seririt', 'Sukasada', 'Tejakula'],
    latitude: -8.1120,
    longitude: 115.0882,
    coordinates: { lat: -8.1120, lng: 115.0882 },
  },
  {
    id: 318,
    kabupaten: 'Kabupaten Karangasem',
    provinsi: 'Bali',
    jumlah_aturan: 1,
    kecamatan: ['Abang', 'Bebandem', 'Karangasem', 'Kubu', 'Manggis', 'Rendang', 'Selat', 'Sidemen'],
    latitude: -8.4475,
    longitude: 115.6141,
    coordinates: { lat: -8.4475, lng: 115.6141 },
  },
  {
    id: 314,
    kabupaten: 'Kabupaten Badung',
    provinsi: 'Bali',
    jumlah_aturan: 0,
    kecamatan: ['Abiansemal', 'Kuta', 'Kuta Selatan', 'Kuta Utara', 'Mengwi', 'Petang'],
    latitude: -8.5819,
    longitude: 115.1771,
    coordinates: { lat: -8.5819, lng: 115.1771 },
  },
  {
    id: 315,
    kabupaten: 'Kabupaten Gianyar',
    provinsi: 'Bali',
    jumlah_aturan: 0,
    kecamatan: ['Blahbatuh', 'Gianyar', 'Payangan', 'Sukawati', 'Tampaksiring', 'Tegallalang', 'Ubud'],
    latitude: -8.5445,
    longitude: 115.3256,
    coordinates: { lat: -8.5445, lng: 115.3256 },
  },
  {
    id: 320,
    kabupaten: 'Kota Denpasar',
    provinsi: 'Bali',
    jumlah_aturan: 0,
    kecamatan: ['Denpasar Barat', 'Denpasar Selatan', 'Denpasar Timur', 'Denpasar Utara'],
    latitude: -8.6705,
    longitude: 115.2126,
    coordinates: { lat: -8.6705, lng: 115.2126 },
  },
  {
    id: 312,
    kabupaten: 'Kabupaten Jembrana',
    provinsi: 'Bali',
    jumlah_aturan: 0,
    kecamatan: ['Jembrana', 'Melaya', 'Mendoyo', 'Negara', 'Pekutatan'],
    latitude: -8.3585,
    longitude: 114.6444,
    coordinates: { lat: -8.3585, lng: 114.6444 },
  },
  {
    id: 316,
    kabupaten: 'Kabupaten Klungkung',
    provinsi: 'Bali',
    jumlah_aturan: 0,
    kecamatan: ['Banjarangkan', 'Dawan', 'Klungkung', 'Nusa Penida'],
    latitude: -8.5366,
    longitude: 115.4050,
    coordinates: { lat: -8.5366, lng: 115.4050 },
  },
];

/**
 * Get Wilayah with Aturan count and coordinates from db_adatnusa
 * With fallback in case backend is unreachable
 */
export async function getWilayahAturan(): Promise<WilayahAturanResponse> {
  try {
    const response = await fetchAPI<WilayahAturanResponse>('/wilayah-aturan.php');
    if (response && response.success && response.data && response.data.length > 0) {
      return response;
    }
    return { success: true, data: FALLBACK_BALI_WILAYAH, count: FALLBACK_BALI_WILAYAH.length };
  } catch (error) {
    console.warn('Backend API offline, using fallback wilayah data:', error);
    return { success: true, data: FALLBACK_BALI_WILAYAH, count: FALLBACK_BALI_WILAYAH.length };
  }
}

/**
 * Get All Wilayah (Kabupaten in Bali by default)
 */
export async function getWilayah(parentId = 17): Promise<WilayahResponse> {
  try {
    return await fetchAPI<WilayahResponse>(`/wilayah.php?parent_id=${parentId}`);
  } catch (error) {
    console.warn('Backend API offline, mapping from fallback:', error);
    const fallbackList: Wilayah[] = FALLBACK_BALI_WILAYAH.map(w => ({
      id: w.id || 0,
      parent_id: 17,
      nama: w.kabupaten,
      jenis: 'KABUPATEN_KOTA',
      latitude: w.latitude ?? w.coordinates.lat,
      longitude: w.longitude ?? w.coordinates.lng,
      aturan_count: w.jumlah_aturan,
      coordinates: w.coordinates,
    }));
    return { success: true, data: fallbackList, count: fallbackList.length };
  }
}

/**
 * Update coordinates for a specific wilayah in db_adatnusa
 */
export async function updateWilayahCoordinates(
  id: number,
  latitude: number,
  longitude: number
): Promise<WilayahUpdateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/wilayah.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        latitude,
        longitude,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as WilayahUpdateResponse;
  } catch (error) {
    console.error('Failed to update wilayah coordinates in DB:', error);
    throw error;
  }
}

/**
 * Get Aturan by Kabupaten
 */
export async function getAturanByKabupaten(kabupaten: string): Promise<AturanAdat[]> {
  try {
    const response = await getAturanAdat({ limit: 100 });
    const target = kabupaten.replace('Kabupaten ', '').replace('Kota ', '').trim().toLowerCase();
    return response.data.filter(a => {
      const current = a.wilayah.kabupaten.replace('Kabupaten ', '').replace('Kota ', '').trim().toLowerCase();
      return current.includes(target) || target.includes(current);
    });
  } catch (error) {
    console.warn('Failed to load aturan for kabupaten:', kabupaten, error);
    return [];
  }
}
