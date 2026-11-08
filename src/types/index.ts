/* ── Zone types ── */
export type TempleStatus = 'open' | 'restricted' | 'closed';

export interface TempleZone {
  id: string;
  name: string;
  nameId: string;
  status: TempleStatus;
  lat: number;
  lng: number;
  zones: ZoneLayer[];
  rules: AwigAwigRule[];
}

export interface ZoneLayer {
  name: string;
  nameId: string;
  color: string;
  opacity: number;
  radius: number; // metres
}

export interface AwigAwigRule {
  id: string;
  textEn: string;
  textId: string;
  icon: string; // lucide icon name
}

/* ── Krama types ── */
export type KramaClass = 'Krama Adat' | 'Krama Tamiu' | 'Tamiu';

export interface Citizen {
  id: string;
  name: string;
  banjar: string;
  classification: KramaClass;
  avatar: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  descriptionId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  categoryId: string;
}

export interface ParumanEvent {
  id: string;
  title: string;
  titleId: string;
  date: string;
  time: string;
  location: string;
  agenda: string[];
  agendaId: string[];
  attendees: number;
  invited: number;
}

/* ── Subak types ── */
export interface SubakTelemetry {
  id: string;
  gateName: string;
  gateNameId: string;
  flowRate: number;     // litres/sec
  quota: number;        // litres/sec
  deviation: number;    // percentage
  timestamp: string;
  alertLevel: 'normal' | 'warning' | 'critical';
}

export interface HarvestProduct {
  id: string;
  farmName: string;
  product: string;
  productId: string;
  quantity: string;
  pricePerKg: number;
  available: boolean;
  imageUrl: string;
}

/* ── Pelestari types ── */
export interface AksaraMapping {
  latin: string;
  aksara: string;
  category: 'wianjana' | 'suara' | 'numeral' | 'sign';
}

export interface WianjanaLetter {
  latin: string;
  aksara: string;
  strokes: string; // SVG path data
}

export interface HeritageItem {
  id: string;
  title: string;
  titleId: string;
  description: string;
  descriptionId: string;
  type: '3d-model' | 'lontar' | 'photo';
  imageUrl: string;
  license: string;
  owner: string;
  year: string;
}

/* ── i18n ── */
export type Lang = 'en' | 'id';
export type Gate = 'wisatawan' | 'krama' | 'pelestari' | 'admin';
