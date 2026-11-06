import type {
  TempleZone,
  Citizen,
  LedgerEntry,
  ParumanEvent,
  SubakTelemetry,
  HarvestProduct,
  HeritageItem,
  AksaraMapping,
  WianjanaLetter,
} from '../types';

/* ──────── Gate 1 — Wisatawan data ──────── */

export const temples: TempleZone[] = [
  {
    id: 'besakih',
    name: 'Pura Besakih',
    nameId: 'Pura Besakih',
    status: 'open',
    lat: -8.3744,
    lng: 115.4507,
    zones: [
      { name: 'Perimeter',      nameId: 'Batas Luar',     color: '#059669', opacity: 0.12, radius: 500 },
      { name: 'Nista Mandala',   nameId: 'Nista Mandala',  color: '#F59E0B', opacity: 0.18, radius: 350 },
      { name: 'Madya Mandala',   nameId: 'Madya Mandala',  color: '#D97706', opacity: 0.25, radius: 200 },
      { name: 'Utama Mandala',   nameId: 'Utama Mandala',  color: '#DC2626', opacity: 0.35, radius: 80 },
    ],
    rules: [
      { id: 'r1', textEn: 'Wear kamen (sarong) and senteng (sash) at all times', textId: 'Kenakan kamen (sarung) dan senteng (selendang) setiap saat', icon: 'shirt' },
      { id: 'r2', textEn: 'Shoulders and knees must be covered', textId: 'Bahu dan lutut harus tertutup', icon: 'shield-check' },
      { id: 'r3', textEn: 'No flash photography near shrines', textId: 'Dilarang menggunakan flash di dekat pura', icon: 'camera-off' },
      { id: 'r4', textEn: 'Do not stand higher than the Pemangku', textId: 'Jangan berdiri lebih tinggi dari Pemangku', icon: 'arrow-down' },
      { id: 'r5', textEn: 'Do not step on canang sari offerings', textId: 'Jangan menginjak canang sari', icon: 'flower-2' },
    ],
  },
  {
    id: 'uluwatu',
    name: 'Pura Uluwatu',
    nameId: 'Pura Uluwatu',
    status: 'restricted',
    lat: -8.8291,
    lng: 115.0849,
    zones: [
      { name: 'Perimeter',      nameId: 'Batas Luar',     color: '#059669', opacity: 0.12, radius: 400 },
      { name: 'Nista Mandala',   nameId: 'Nista Mandala',  color: '#F59E0B', opacity: 0.18, radius: 280 },
      { name: 'Madya Mandala',   nameId: 'Madya Mandala',  color: '#D97706', opacity: 0.25, radius: 150 },
      { name: 'Utama Mandala',   nameId: 'Utama Mandala',  color: '#DC2626', opacity: 0.35, radius: 60 },
    ],
    rules: [
      { id: 'r1', textEn: 'Wear kamen (sarong) and senteng (sash) at all times', textId: 'Kenakan kamen (sarung) dan senteng (selendang) setiap saat', icon: 'shirt' },
      { id: 'r2', textEn: 'Keep belongings secure — monkeys may grab items', textId: 'Jaga barang bawaan — monyet bisa mengambil barang Anda', icon: 'alert-triangle' },
      { id: 'r3', textEn: 'Restricted area: ceremony in progress', textId: 'Area terbatas: upacara sedang berlangsung', icon: 'lock' },
    ],
  },
  {
    id: 'tirta-empul',
    name: 'Tirta Empul',
    nameId: 'Pura Tirta Empul',
    status: 'closed',
    lat: -8.4153,
    lng: 115.3153,
    zones: [
      { name: 'Perimeter',      nameId: 'Batas Luar',     color: '#059669', opacity: 0.12, radius: 350 },
      { name: 'Nista Mandala',   nameId: 'Nista Mandala',  color: '#F59E0B', opacity: 0.18, radius: 240 },
      { name: 'Madya Mandala',   nameId: 'Madya Mandala',  color: '#D97706', opacity: 0.25, radius: 130 },
      { name: 'Utama Mandala',   nameId: 'Utama Mandala',  color: '#DC2626', opacity: 0.35, radius: 50 },
    ],
    rules: [
      { id: 'r1', textEn: 'Temple is currently closed for Piodalan ceremony', textId: 'Pura sedang ditutup untuk upacara Piodalan', icon: 'x-circle' },
    ],
  },
];

/* ──────── Gate 2 — Krama data ──────── */

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=B45309&textColor=ffffff`;

export const citizens: Citizen[] = [
  { id: 'c1', name: 'I Made Suardana',    banjar: 'Banjar Kaja',  classification: 'Krama Adat',  avatar: avatarUrl('MS') },
  { id: 'c2', name: 'Ni Luh Ketut Sari',  banjar: 'Banjar Kelod', classification: 'Krama Adat',  avatar: avatarUrl('NS') },
  { id: 'c3', name: 'I Wayan Darma',      banjar: 'Banjar Kaja',  classification: 'Krama Tamiu', avatar: avatarUrl('WD') },
  { id: 'c4', name: 'Kadek Arya Putra',   banjar: 'Banjar Tengah',classification: 'Krama Adat',  avatar: avatarUrl('KA') },
  { id: 'c5', name: 'Ahmad Setiawan',     banjar: 'Banjar Kelod', classification: 'Tamiu',        avatar: avatarUrl('AS') },
  { id: 'c6', name: 'Ni Made Devi',       banjar: 'Banjar Tengah',classification: 'Krama Adat',  avatar: avatarUrl('MD') },
];

export const ledgerEntries: LedgerEntry[] = [
  { id: 'l1', date: '2026-11-01', description: 'Monthly Adat Dues Collection',        descriptionId: 'Pengumpulan Iuran Adat Bulanan',        type: 'income',  amount: 15000000, category: 'Iuran Adat',   categoryId: 'Iuran Adat' },
  { id: 'l2', date: '2026-11-02', description: 'Odalan Ceremony Supplies',             descriptionId: 'Perlengkapan Upacara Odalan',            type: 'expense', amount: 8500000,  category: 'Ceremony',      categoryId: 'Upacara' },
  { id: 'l3', date: '2026-11-03', description: 'Banjar Hall Repair Fund',              descriptionId: 'Dana Perbaikan Bale Banjar',             type: 'expense', amount: 5000000,  category: 'Infrastructure',categoryId: 'Infrastruktur' },
  { id: 'l4', date: '2026-11-04', description: 'Tourist Donation',                     descriptionId: 'Donasi Wisatawan',                       type: 'income',  amount: 3200000,  category: 'Donation',      categoryId: 'Donasi' },
  { id: 'l5', date: '2026-11-05', description: 'Gamelan Instrument Maintenance',       descriptionId: 'Perawatan Alat Gamelan',                 type: 'expense', amount: 2000000,  category: 'Cultural',      categoryId: 'Budaya' },
  { id: 'l6', date: '2026-11-06', description: 'Nyepi Day Preparation',                descriptionId: 'Persiapan Hari Raya Nyepi',              type: 'expense', amount: 12000000, category: 'Ceremony',      categoryId: 'Upacara' },
];

export const parumanEvents: ParumanEvent[] = [
  {
    id: 'p1', title: 'Monthly Banjar Assembly', titleId: 'Paruman Banjar Bulanan',
    date: '2026-11-15', time: '19:00', location: 'Bale Banjar Kaja',
    agenda: ['Financial report review', 'Odalan ceremony planning', 'New member registration'],
    agendaId: ['Laporan keuangan', 'Perencanaan upacara Odalan', 'Pendaftaran anggota baru'],
    attendees: 45, invited: 62,
  },
  {
    id: 'p2', title: 'Subak Water Allocation Meeting', titleId: 'Rapat Alokasi Air Subak',
    date: '2026-11-22', time: '08:00', location: 'Pura Ulun Swi',
    agenda: ['Dry season water schedule', 'Tektek maintenance report', 'Harvest coordination'],
    agendaId: ['Jadwal air musim kemarau', 'Laporan perawatan tektek', 'Koordinasi panen'],
    attendees: 28, invited: 35,
  },
];

export const subakTelemetry: SubakTelemetry[] = [
  { id: 's1', gateName: 'Tektek Hulu (Upstream)',  gateNameId: 'Tektek Hulu',      flowRate: 12.4, quota: 12.0, deviation: 3.3,  timestamp: '2026-11-06T10:30:00', alertLevel: 'normal' },
  { id: 's2', gateName: 'Tektek Tengah (Middle)',   gateNameId: 'Tektek Tengah',     flowRate: 8.1,  quota: 10.0, deviation: -19.0, timestamp: '2026-11-06T10:30:00', alertLevel: 'critical' },
  { id: 's3', gateName: 'Tektek Hilir (Downstream)',gateNameId: 'Tektek Hilir',      flowRate: 6.8,  quota: 7.0,  deviation: -2.9,  timestamp: '2026-11-06T10:30:00', alertLevel: 'normal' },
  { id: 's4', gateName: 'Tektek Sawah Barat',       gateNameId: 'Tektek Sawah Barat',flowRate: 5.2,  quota: 4.5,  deviation: 15.6,  timestamp: '2026-11-06T10:30:00', alertLevel: 'warning' },
];

export const harvestProducts: HarvestProduct[] = [
  { id: 'h1', farmName: 'Subak Jatiluwih Collective', product: 'Red Rice (Beras Merah)', productId: 'Beras Merah', quantity: '2,500 kg', pricePerKg: 18000, available: true,  imageUrl: '' },
  { id: 'h2', farmName: 'Subak Pakerisan Group',      product: 'White Rice (Beras Putih)',productId: 'Beras Putih', quantity: '5,000 kg', pricePerKg: 14000, available: true,  imageUrl: '' },
  { id: 'h3', farmName: 'Kintamani Highland Farm',     product: 'Arabica Coffee Beans',   productId: 'Kopi Arabika',  quantity: '800 kg',  pricePerKg: 95000, available: true,  imageUrl: '' },
  { id: 'h4', farmName: 'Tabanan Organik',             product: 'Organic Salak (Snake Fruit)',productId: 'Salak Organik', quantity: '1,200 kg', pricePerKg: 25000, available: false, imageUrl: '' },
];

/* ──────── Gate 3 — Pelestari data ──────── */

export const aksaraMappings: AksaraMapping[] = [
  // Wianjana (consonants)
  { latin: 'ka', aksara: 'ᬓ', category: 'wianjana' },
  { latin: 'ga', aksara: 'ᬕ', category: 'wianjana' },
  { latin: 'nga', aksara: 'ᬗ', category: 'wianjana' },
  { latin: 'ca', aksara: 'ᬘ', category: 'wianjana' },
  { latin: 'ja', aksara: 'ᬚ', category: 'wianjana' },
  { latin: 'nya', aksara: 'ᬜ', category: 'wianjana' },
  { latin: 'ta', aksara: 'ᬢ', category: 'wianjana' },
  { latin: 'da', aksara: 'ᬤ', category: 'wianjana' },
  { latin: 'na', aksara: 'ᬦ', category: 'wianjana' },
  { latin: 'pa', aksara: 'ᬧ', category: 'wianjana' },
  { latin: 'ba', aksara: 'ᬩ', category: 'wianjana' },
  { latin: 'ma', aksara: 'ᬫ', category: 'wianjana' },
  { latin: 'ya', aksara: 'ᬬ', category: 'wianjana' },
  { latin: 'ra', aksara: 'ᬭ', category: 'wianjana' },
  { latin: 'la', aksara: 'ᬮ', category: 'wianjana' },
  { latin: 'wa', aksara: 'ᬯ', category: 'wianjana' },
  { latin: 'sa', aksara: 'ᬲ', category: 'wianjana' },
  { latin: 'ha', aksara: 'ᬳ', category: 'wianjana' },
  // Suara (vowels / diacritics as standalone)
  { latin: 'a',  aksara: 'ᬅ', category: 'suara' },
  { latin: 'i',  aksara: 'ᬇ', category: 'suara' },
  { latin: 'u',  aksara: 'ᬉ', category: 'suara' },
  { latin: 'e',  aksara: 'ᬏ', category: 'suara' },
  { latin: 'o',  aksara: 'ᬑ', category: 'suara' },
  // Numerals
  { latin: '0', aksara: '᭐', category: 'numeral' },
  { latin: '1', aksara: '᭑', category: 'numeral' },
  { latin: '2', aksara: '᭒', category: 'numeral' },
  { latin: '3', aksara: '᭓', category: 'numeral' },
  { latin: '4', aksara: '᭔', category: 'numeral' },
  { latin: '5', aksara: '᭕', category: 'numeral' },
  { latin: '6', aksara: '᭖', category: 'numeral' },
  { latin: '7', aksara: '᭗', category: 'numeral' },
  { latin: '8', aksara: '᭘', category: 'numeral' },
  { latin: '9', aksara: '᭙', category: 'numeral' },
  // Signs
  { latin: 'pepet (ə)', aksara: 'ᬾ', category: 'sign' },
  { latin: 'taling',     aksara: 'ᬾ', category: 'sign' },
  { latin: 'cecek (ṁ)',  aksara: 'ᬂ', category: 'sign' },
  { latin: 'bisah (ḥ)',  aksara: 'ᬄ', category: 'sign' },
];

export const wianjanaLetters: WianjanaLetter[] = [
  { latin: 'ka', aksara: 'ᬓ', strokes: 'M10 40 Q25 10 40 40 Q55 10 70 40' },
  { latin: 'ga', aksara: 'ᬕ', strokes: 'M15 40 Q30 15 45 40 L60 20 L75 40' },
  { latin: 'nga', aksara: 'ᬗ', strokes: 'M10 35 C20 10 50 10 60 35 Q65 50 70 35' },
  { latin: 'ca', aksara: 'ᬘ', strokes: 'M15 20 Q40 10 55 30 Q45 50 25 45 L15 20' },
  { latin: 'ja', aksara: 'ᬚ', strokes: 'M20 15 Q35 10 40 25 L50 40 Q35 50 20 40 Z' },
  { latin: 'na', aksara: 'ᬦ', strokes: 'M15 35 Q25 15 40 35 Q55 15 70 35 L70 50' },
  { latin: 'pa', aksara: 'ᬧ', strokes: 'M20 45 L20 15 Q35 10 45 25 Q35 40 20 35' },
  { latin: 'ba', aksara: 'ᬩ', strokes: 'M25 15 L25 45 Q40 50 50 35 Q55 20 40 15 L25 15' },
  { latin: 'ma', aksara: 'ᬫ', strokes: 'M10 40 Q20 15 30 40 Q40 15 50 40 Q60 15 70 40' },
  { latin: 'sa', aksara: 'ᬲ', strokes: 'M20 45 Q15 20 35 15 Q55 10 60 30 Q55 45 35 45' },
];

export const heritageItems: HeritageItem[] = [
  {
    id: 'hr1', title: 'Pura Besakih 3D Spatial Model', titleId: 'Model Spasial 3D Pura Besakih',
    description: 'High-resolution photogrammetric 3D model of the Mother Temple complex',
    descriptionId: 'Model 3D fotogrametrik resolusi tinggi dari kompleks Pura Agung Besakih',
    type: '3d-model', imageUrl: '', license: 'CC BY-NC-SA 4.0', owner: 'Bali Heritage Foundation', year: '2024',
  },
  {
    id: 'hr2', title: 'Lontar Aji Saraswati', titleId: 'Lontar Aji Saraswati',
    description: 'Digitized ancient palm-leaf manuscript on knowledge and wisdom',
    descriptionId: 'Naskah lontar kuno yang didigitalisasi tentang ilmu pengetahuan dan kebijaksanaan',
    type: 'lontar', imageUrl: '', license: 'CC BY 4.0', owner: 'Museum Gedong Kirtya', year: '18th century',
  },
  {
    id: 'hr3', title: 'Kecak Dance VR Experience', titleId: 'Pengalaman VR Tari Kecak',
    description: 'Interactive VR recording of the sacred Kecak fire dance at Uluwatu',
    descriptionId: 'Rekaman VR interaktif tarian sakral Kecak api di Uluwatu',
    type: '3d-model', imageUrl: '', license: 'CC BY-NC 4.0', owner: 'Dinas Kebudayaan Bali', year: '2025',
  },
  {
    id: 'hr4', title: 'Lontar Usana Bali', titleId: 'Lontar Usana Bali',
    description: 'Creation myth of Bali recorded on palm leaves',
    descriptionId: 'Mitos penciptaan Bali yang dicatat pada daun lontar',
    type: 'lontar', imageUrl: '', license: 'Public Domain', owner: 'National Library of Indonesia', year: '15th century',
  },
  {
    id: 'hr5', title: 'Subak Irrigation 3D Terrain', titleId: 'Terrain 3D Irigasi Subak',
    description: 'Topographic 3D model showing the UNESCO-listed Subak water system',
    descriptionId: 'Model 3D topografi sistem irigasi Subak yang terdaftar di UNESCO',
    type: '3d-model', imageUrl: '', license: 'CC BY-SA 4.0', owner: 'UNESCO Indonesia', year: '2023',
  },
  {
    id: 'hr6', title: 'Ancient Temple Photograph c.1920', titleId: 'Foto Pura Kuno c.1920',
    description: 'Rare colonial-era photograph of Balinese temple compound',
    descriptionId: 'Foto langka era kolonial dari kompleks pura Bali',
    type: 'photo', imageUrl: '', license: 'Public Domain', owner: 'KITLV Archives', year: '1920',
  },
];
