# Integrasi Peta Aturan Adat - Update

## 🎯 Fitur Baru: Aturan Adat Terintegrasi dalam Peta Bali

Semua aturan adat sekarang **terintegrasi langsung ke dalam peta Bali** yang sudah ada. User tidak perlu scroll ke bawah untuk lihat aturan — semua bisa diakses dari peta!

---

## ✨ Cara Kerja

### 1. **Peta Menampilkan 2 Jenis Marker:**
   - 🔴 **Marker Merah** = Pura (temples) dengan zona suci
   - 🔵 **Marker Biru** = Wilayah dengan aturan adat

### 2. **Klik Marker Biru (Wilayah):**
   - Popup muncul dengan nama kabupaten & jumlah aturan
   - Tombol "View Rules" / "Lihat Aturan"
   - Peta akan zoom ke wilayah tersebut

### 3. **Panel Sidebar Muncul:**
   - List semua aturan di wilayah tersebut
   - Bisa scroll kalau banyak
   - Menampilkan: Nama aturan, ringkasan, komunitas, kategori

### 4. **Klik Aturan → Detail Modal:**
   - Nama lengkap aturan
   - Ringkasan
   - Isi lengkap (scrollable)
   - Link ke PDF sumber asli (JIDHAT)
   - Info komunitas, wilayah, kategori

### 5. **Close:**
   - Tombol X di sidebar → tutup panel
   - Klik di luar modal → tutup detail
   - Tombol "Tutup" → tutup detail

---

## 📊 Data yang Ditampilkan

**Wilayah yang punya aturan (saat ini):**

| Wilayah | Jumlah Aturan | Kecamatan |
|---------|---------------|-----------|
| **Kabupaten Bangli** | 6 aturan | Bangli, Tembuku |
| **Kabupaten Tabanan** | 5 aturan | Kediri, Penebel, Pupuan, Selemadeg Barat |
| **Kabupaten Buleleng** | 4 aturan | Banjar, Buleleng, Sukasada |
| **Kabupaten Karangasem** | 1 aturan | Karangasem |

**Total:** 16 aturan adat dari 4 kabupaten

---

## 🛠️ File yang Dibuat/Diubah

### Backend (PHP API):
1. **`C:\laragon\www\baliguide-api\wilayah-aturan.php`** ✨ BARU
   - Endpoint untuk mendapatkan wilayah dengan jumlah aturan
   - Include koordinat untuk markers di peta
   - Response: list kabupaten + jumlah aturan + koordinat

### Frontend (React):
1. **`src\services\api.ts`** ✏️ UPDATED
   - Added: `getWilayahAturan()` - fetch wilayah dengan aturan
   - Added: `getAturanByKabupaten()` - filter aturan by kabupaten
   - Updated: `AturanAdat` interface untuk include sumber & wilayah

2. **`src\components\wisatawan\TempleMap.tsx`** ✏️ MAJOR UPDATE
   - Integrasi markers untuk wilayah aturan adat
   - Sidebar panel untuk list aturan (saat wilayah diklik)
   - Detail modal untuk isi lengkap aturan
   - Auto zoom ke wilayah yang dipilih
   - Legend updated (tambah icon aturan adat)

3. **`src\pages\WisatawanPage.tsx`** ✏️ UPDATED
   - Remove separate `AturanList` component
   - Update heading & description untuk jelaskan fitur baru
   - Map size lebih besar (700px instead of 600px)

---

## 🎨 UI/UX Improvements

### Before:
```
[Hero]
[Temple Cards]
[Temple Map]           ← hanya pura
[Aturan List Section]  ← terpisah di bawah
```

### After:
```
[Hero]
[Temple Cards]
[Integrated Map]       ← pura + aturan dalam 1 map
  ├─ Temple markers (merah)
  ├─ Aturan markers (biru)
  ├─ Sidebar panel (saat klik wilayah)
  └─ Detail modal (saat klik aturan)
```

**Benefits:**
- ✅ Lebih intuitif - semua geospasial dalam 1 tempat
- ✅ Contextualized - user tau persis di mana aturan berlaku
- ✅ Interactive - click → zoom → list → detail
- ✅ Space efficient - tidak perlu scroll jauh

---

## 🚀 How to Test

### 1. Start Server & Database:
```bash
# 1. Pastikan Laragon running (Apache + MySQL)
# 2. Test API
curl "http://localhost/baliguide-api/wilayah-aturan.php"
```

Expected output:
```json
{
  "success": true,
  "data": [
    {
      "kabupaten": "Kabupaten Bangli",
      "jumlah_aturan": 6,
      "coordinates": {"lat": -8.3, "lng": 115.35}
    },
    ...
  ]
}
```

### 2. Run React App:
```bash
cd C:\Projek\BaliGuide_Adat
npm run dev
```

### 3. Test di Browser:
1. Buka: `http://localhost:5173`
2. Navigate ke **Wisatawan** page (tab pertama)
3. Scroll ke section "Interactive Map: Temples & Traditional Rules"
4. **Cari marker biru** di peta (wilayah: Bangli, Tabanan, Buleleng, Karangasem)
5. **Klik marker biru** → popup muncul
6. **Klik "View Rules"** → sidebar panel muncul dengan list aturan
7. **Klik salah satu aturan** → modal detail muncul
8. **Klik link "View Original PDF"** → buka PDF dari JIDHAT

---

## 🐛 Troubleshooting

### Problem: Marker biru tidak muncul
**Cause:** API `wilayah-aturan.php` tidak bisa diakses

**Solution:**
```bash
# Test API
curl "http://localhost/baliguide-api/wilayah-aturan.php"

# Cek Laragon Apache running
# Cek database ada data (16 aturan)
```

---

### Problem: Sidebar panel kosong setelah klik marker
**Cause:** Function `getAturanByKabupaten()` tidak bisa filter

**Check:**
- Browser console untuk error
- Network tab → cek response API `/aturan.php`
- Pastikan nama kabupaten match exactly (case-sensitive)

---

### Problem: Map tidak bisa di-zoom atau drag
**Cause:** `scrollWheelZoom` disabled by default

**Solution:** Klik sekali di map untuk activate scroll wheel zoom

---

## 📝 Future Enhancements

### Short Term:
- [ ] Add search box di sidebar untuk filter aturan by keyword
- [ ] Add kategori filter di sidebar
- [ ] Show loading spinner saat fetch aturan
- [ ] Add clustering untuk markers (kalau banyak)

### Long Term:
- [ ] Add polygon boundaries untuk kabupaten (bukan hanya marker)
- [ ] Add heatmap layer berdasarkan jumlah aturan
- [ ] Add filter by status verifikasi
- [ ] Add comparison mode (compare 2 aturan side by side)
- [ ] Add print/export PDF untuk aturan yang dipilih
- [ ] Add bookmark/favorite aturan
- [ ] Add share link untuk specific aturan

---

## 🎉 Summary

**Sekarang web kamu punya:**

✅ Peta interaktif Bali dengan **temple zones + aturan adat terintegrasi**  
✅ Klik wilayah → langsung lihat **semua aturan di wilayah itu**  
✅ Detail lengkap setiap aturan dengan **link ke PDF sumber**  
✅ 16 aturan adat dari 4 kabupaten **tersambung ke database MySQL**  
✅ UI yang **intuitif dan contextual** - tidak perlu scroll terpisah  

**Next Step:** Add more aturan ke database pakai script Python `sync_aturan.py` → otomatis muncul di peta! 🚀
