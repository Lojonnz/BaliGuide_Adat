# 🎉 FITUR BARU: Integrasi Aturan Adat di Peta Bali

## ✅ Status: SELESAI & SIAP DIGUNAKAN

Sekarang **semua aturan adat sudah terintegrasi ke dalam peta Bali**! 

---

## 🗺️ Cara Menggunakan

### 1. Buka Web:
```
http://localhost:5173
```

### 2. Navigate ke Halaman **Wisatawan** (tab pertama)

### 3. Scroll ke section **"Interactive Map: Temples & Traditional Rules"**

### 4. Di Peta, Akan Ada 2 Jenis Marker:

#### 🔴 **Marker Merah** = Pura (Temple)
- Pura Besakih
- Pura Uluwatu  
- Tirta Empul
- Dengan zona suci (Nista, Madya, Utama Mandala)

#### 🔵 **Marker Biru** = Wilayah dengan Aturan Adat
- **Kabupaten Bangli** - 6 aturan
- **Kabupaten Tabanan** - 5 aturan
- **Kabupaten Buleleng** - 4 aturan
- **Kabupaten Karangasem** - 1 aturan

### 5. **KLIK MARKER BIRU** (Wilayah):

Popup akan muncul menampilkan:
```
📄 Kabupaten Bangli
   6 traditional rules
   [View Rules]
```

### 6. **KLIK TOMBOL "View Rules"**:

**Sidebar panel muncul di sisi kiri** dengan:
- ✅ Nama wilayah
- ✅ Jumlah aturan
- ✅ List semua aturan di wilayah itu
- ✅ Ringkasan singkat tiap aturan
- ✅ Info komunitas & kategori

### 7. **KLIK SALAH SATU ATURAN**:

**Modal detail muncul** dengan:
- ✅ Nama lengkap aturan
- ✅ Ringkasan
- ✅ **Isi lengkap** (scrollable)
- ✅ Informasi komunitas & wilayah
- ✅ **Link ke PDF sumber asli** dari JIDHAT
- ✅ Tombol "Tutup"

### 8. **Navigasi**:
- **X** di sidebar → tutup panel, kembali ke peta
- **Klik di luar modal** → tutup detail
- **Tombol "Tutup"** → tutup detail modal

---

## 📊 Data yang Tersedia

**Total:** 16 aturan adat dari 4 kabupaten

### Kabupaten Bangli (6 aturan):
- Kecamatan: Bangli, Tembuku
- Contoh: Pararem Desa Adat Geria Kelempung, Pararem Pengelolaan Sampah Cempaga

### Kabupaten Tabanan (5 aturan):
- Kecamatan: Kediri, Penebel, Pupuan, Selemadeg Barat
- Berbagai aturan kelembagaan dan kehidupan sosial

### Kabupaten Buleleng (4 aturan):
- Kecamatan: Banjar, Buleleng, Sukasada
- Pararem tentang tata cara pemilihan prajuru

### Kabupaten Karangasem (1 aturan):
- Kecamatan: Karangasem

---

## 🎯 Fitur Utama

### ✨ **Geospasial Context**
Aturan tidak lagi terpisah dari peta - sekarang user bisa:
- Lihat **di mana** aturan berlaku
- Explore berdasarkan wilayah
- Zoom langsung ke kabupaten

### 📍 **Click to Explore**
1. Klik wilayah → zoom + list aturan
2. Klik aturan → detail lengkap
3. Klik PDF → buka dokumen asli

### 🔗 **Link ke Sumber Resmi**
Setiap aturan punya link ke PDF asli dari:
- **JIDHAT** (Jaringan Dokumentasi dan Informasi Hukum Adat Provinsi Bali)
- URL format: `https://jidhat.baliprov.go.id/storage/perarem/...`

### 🎨 **UI yang Intuitif**
- Glass morphism design
- Smooth animations (GSAP)
- Auto zoom ke wilayah
- Responsive layout
- Loading states

---

## 🛠️ Technical Stack

### Backend:
- **PHP** (Laragon Apache)
- **MySQL** (db_adatnusa)
- **REST API** endpoints

### Frontend:
- **React** + TypeScript
- **Leaflet** maps
- **GSAP** animations
- **Vite** dev server

### API Endpoints:
```
GET /baliguide-api/aturan.php          - List aturan
GET /baliguide-api/wilayah-aturan.php  - Wilayah dengan aturan
GET /baliguide-api/komunitas.php       - Komunitas adat
GET /baliguide-api/kategori.php        - Kategori aturan
```

---

## 🚀 Next Steps

### Tambah Data:
Untuk menambah lebih banyak aturan ke peta:

```bash
cd C:\Projek\BaliGuide_Adat

# Sync PDF dari folder aturan/
python scripts/sync_aturan.py --execute --limit 50

# Atau full sync dengan isi lengkap
python scripts/sync_aturan.py --execute --full-text
```

Setelah sync → **otomatis muncul di peta!** 🎉

### Future Enhancements:
- [ ] Add search box di sidebar
- [ ] Add kategori filter
- [ ] Add polygon boundaries (bukan hanya marker)
- [ ] Add clustering untuk banyak markers
- [ ] Add bookmark favorite aturan
- [ ] Add print/export PDF

---

## 📸 Screenshot Flow

```
┌─────────────────────────────────────────┐
│  🗺️ PETA BALI                           │
│                                         │
│  🔴 Pura Besakih (with zones)          │
│  🔴 Pura Uluwatu                        │
│  🔵 Kabupaten Bangli (6 aturan) ← KLIK │
│  🔵 Kabupaten Tabanan (5 aturan)       │
│  🔵 Kabupaten Buleleng (4 aturan)      │
│                                         │
└─────────────────────────────────────────┘
              ↓ (klik marker biru)
┌──────────────────┐  ┌─────────────────┐
│ SIDEBAR PANEL    │  │  PETA (zoomed)  │
│                  │  │                 │
│ Kabupaten Bangli │  │  🔵 ← selected  │
│ 6 aturan         │  │                 │
│                  │  │                 │
│ 📄 Pararem...    │  │                 │
│ 📄 Pararem...    │  │                 │
│ 📄 Pararem... ←  │  │                 │
│                  │  │                 │
└──────────────────┘  └─────────────────┘
       ↓ (klik aturan)
┌─────────────────────────────────────────┐
│          DETAIL MODAL                   │
│                                         │
│  Pararem Pengelolaan Sampah Cempaga    │
│                                         │
│  📍 Desa Adat Cempaga                  │
│  🏷️ Lingkungan                         │
│                                         │
│  📝 Ringkasan: ...                     │
│  📄 Isi Lengkap: [scrollable]          │
│                                         │
│  🔗 [View Original PDF]                │
│  [Tutup]                               │
└─────────────────────────────────────────┘
```

---

## ✅ Testing Checklist

- [x] API `wilayah-aturan.php` returns correct data
- [x] API `aturan.php` returns aturan with wilayah info
- [x] Markers muncul di peta (4 marker biru)
- [x] Klik marker → popup muncul
- [x] Klik "View Rules" → sidebar panel muncul
- [x] Sidebar menampilkan list aturan
- [x] Klik aturan → detail modal muncul
- [x] Modal menampilkan isi lengkap
- [x] Link PDF berfungsi (buka di tab baru)
- [x] Close button (X, Tutup) berfungsi
- [x] Map zoom ke wilayah saat dipilih
- [x] Responsive di mobile & desktop
- [x] Loading state saat fetch data
- [x] Legend updated (tambah icon aturan)

---

## 🎊 Summary

**Sekarang web kamu sudah punya:**

✅ **Peta interaktif** dengan temple zones + aturan adat  
✅ **16 aturan adat** dari 4 kabupaten tersambung ke database  
✅ **Click to explore** - wilayah → list → detail → PDF sumber  
✅ **Contextualized** - user tau persis di mana aturan berlaku  
✅ **Integrated** - tidak perlu scroll terpisah, semua dalam 1 peta  

**Database sudah connected ✅**  
**API sudah running ✅**  
**Frontend sudah terintegrasi ✅**  
**Siap digunakan! 🚀**

---

**Test sekarang di:** `http://localhost:5173` → Wisatawan page → klik marker biru! 🎉
