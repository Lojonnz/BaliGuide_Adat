/**
 * API Service Layer
 * Connects React frontend to PHP API backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/baliguide-api';

export interface AturanAdat {
  id: number;
  nama: string;
  slug: string;
  ringkasan: string;
  isi: string;
  tanggal_berlaku: string | null;
  status_berlaku: string;
  status_verifikasi: string;
  created_at: string;
  updated_at: string;
  komunitas: {
    id: number;
    kode: string | null;
    nama: string;
  };
  kategori: {
    id: number;
    nama: string;
    deskripsi: string | null;
  };
  wilayah: {
    id: number;
    nama: string;
    jenis: string;
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
  return fetchAPI<AturanResponse>(endpoint);
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
  return fetchAPI<KategoriResponse>('/kategori.php');
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
