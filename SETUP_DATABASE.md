# Setup Database Connection - BaliGuide Adat

Panduan lengkap untuk menyambungkan web BaliGuide Adat ke database MySQL Laragon.

---

## ✅ Yang Sudah Dibuat

### 1. **Backend API (PHP)**
Lokasi: `C:\laragon\www\baliguide-api\`

**File-file:**
- `config.php` - Database connection & CORS configuration
- `aturan.php` - Endpoint untuk mengambil data aturan adat
- `komunitas.php` - Endpoint untuk data komunitas adat
- `kategori.php` - Endpoint untuk data kategori
- `README.md` - Dokumentasi API

**Base URL:** `http://localhost/baliguide-api/`

### 2. **Frontend Service Layer**
Lokasi: `C:\Projek\BaliGuide_Adat\src\services\api.ts`

TypeScript service dengan fungsi:
- `getAturanAdat()` - Fetch aturan dengan filter
- `getKomunitasAdat()` - Fetch komunitas
- `getKategoriAdat()` - Fetch kategori
- `searchAturan()` - Search aturan by keyword

### 3. **React Component**
Lokasi: `C:\Projek\BaliGuide_Adat\src\components\wisatawan\AturanList.tsx`

Komponen yang menampilkan:
- List aturan adat dari database
- Filter berdasarkan kategori
- Detail modal untuk setiap aturan
- Loading & error states

### 4. **Integration ke WisatawanPage**
File sudah diupdate untuk menampilkan section baru "Traditional Rules & Regulations" dengan data dari database.

### 5. **Environment Configuration**
- `.env` file sudah dibuat
- `VITE_API_BASE_URL=http://localhost/baliguide-api` sudah dikonfigurasi

---

## 🚀 Langkah-Langkah Setup

### Step 1: Start Laragon

1. **Buka Laragon Control Panel**
2. **Klik "Start All"** untuk menjalankan:
   - Apache (web server untuk PHP)
   - MySQL (database server)
3. **Verifikasi**: Lampu indikator harus hijau untuk Apache & MySQL

### Step 2: Pastikan Database Sudah Ada

Database `db_adatnusa` harus sudah ada dengan tabel:
- `aturan_adat`
- `sumber_informasi`
- `komunitas_adat`
- `kategori_adat`
- `wilayah`
- `aturan_sumber`

**Cara cek:**

```bash
# Buka MySQL di Laragon
# Atau via command line:
mysql -u root -h 127.0.0.1 -P 3306 -e "SHOW DATABASES;"
mysql -u root -h 127.0.0.1 -P 3306 db_adatnusa -e "SHOW TABLES;"
```

**Atau via HeidiSQL/phpMyAdmin:**
- Buka: `http://localhost/phpmyadmin`
- Login: user=`root`, password=(kosong)
- Cek database `db_adatnusa`

### Step 3: Sync Data PDF ke Database (Opsional)

Jika database masih kosong, jalankan script Python untuk sync PDF:

```bash
cd C:\Projek\BaliGuide_Adat

# Dry run (preview only)
python scripts/sync_aturan.py --dry-run

# Execute (write to database)
python scripts/sync_aturan.py --execute --limit 10

# Full sync dengan full text
python scripts/sync_aturan.py --execute --full-text
```

**Note:** Pastikan folder `aturan/` berisi file PDF yang akan di-sync.

### Step 4: Test API Backend

Buka browser dan test endpoint:

```
http://localhost/baliguide-api/aturan.php
http://localhost/baliguide-api/komunitas.php
http://localhost/baliguide-api/kategori.php
```

**Expected response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

**Jika error:**
- Pastikan Laragon Apache running
- Cek file `C:\laragon\www\baliguide-api\config.php` - kredensial database benar
- Cek MySQL running di port 3306

### Step 5: Install Dependencies & Run React App

```bash
cd C:\Projek\BaliGuide_Adat

# Install dependencies (jika belum)
npm install

# Run development server
npm run dev
```

### Step 6: Test Web Application

1. Buka: `http://localhost:5173`
2. Navigate ke **Wisatawan** page (tab pertama)
3. Scroll ke bawah, seharusnya muncul section:
   - **"Traditional Rules & Regulations"**
   - Filter kategori
   - List aturan dari database
4. Klik salah satu aturan untuk melihat detail

---

## 🐛 Troubleshooting

### Problem 1: CORS Error di Browser Console

**Error:**
```
Access to fetch at 'http://localhost/baliguide-api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
Edit `C:\laragon\www\baliguide-api\config.php` line 7:
```php
header('Access-Control-Allow-Origin: http://localhost:5173');
```

Pastikan port Vite sesuai (default: 5173).

---

### Problem 2: Database Connection Failed

**Error di API response:**
```json
{
  "error": "Database connection failed",
  "message": "..."
}
```

**Solution:**
1. Pastikan MySQL running di Laragon
2. Cek kredensial di `config.php`:
   ```php
   define('DB_HOST', '127.0.0.1');
   define('DB_PORT', '3306');
   define('DB_USER', 'root');
   define('DB_PASS', ''); // kosong untuk Laragon default
   define('DB_NAME', 'db_adatnusa');
   ```
3. Test koneksi manual:
   ```bash
   mysql -u root -h 127.0.0.1 -P 3306 db_adatnusa -e "SELECT COUNT(*) FROM aturan_adat;"
   ```

---

### Problem 3: API Returns Empty Data

**Response:**
```json
{
  "success": true,
  "data": [],
  "pagination": { "total": 0, ... }
}
```

**Solution:**
Database belum ada data. Jalankan sync script:
```bash
python scripts/sync_aturan.py --execute --limit 10
```

---

### Problem 4: Component Shows "Failed to load data"

**Error message:**
```
Failed to load data
Make sure Laragon (Apache + MySQL) is running...
```

**Checklist:**
- ✅ Laragon Apache running (lampu hijau)
- ✅ Laragon MySQL running (lampu hijau)
- ✅ API accessible: `http://localhost/baliguide-api/aturan.php`
- ✅ `.env` file exists dengan `VITE_API_BASE_URL=http://localhost/baliguide-api`
- ✅ Restart Vite dev server setelah edit `.env`

---

### Problem 5: Changes to .env Not Applied

**Solution:**
Environment variables di Vite hanya di-load saat startup. Setelah edit `.env`:
```bash
# Stop dev server (Ctrl+C)
# Start again
npm run dev
```

---

## 📊 API Endpoints Reference

### GET /aturan.php

**Query Parameters:**
- `komunitas_id` (int) - Filter by komunitas
- `kategori_id` (int) - Filter by kategori
- `limit` (int, max 100) - Limit results
- `offset` (int) - Pagination offset

**Example:**
```
http://localhost/baliguide-api/aturan.php?kategori_id=3&limit=20
```

---

### GET /komunitas.php

Returns all communities with their rule count.

**Example:**
```
http://localhost/baliguide-api/komunitas.php
```

---

### GET /kategori.php

Returns all categories with their rule count.

**Example:**
```
http://localhost/baliguide-api/kategori.php
```

---

## 🎯 Next Steps

Setelah semua berjalan:

1. **Add More Features:**
   - Search functionality
   - Advanced filters (by wilayah, status, date)
   - Pagination for large datasets
   - Export data (PDF, JSON)

2. **Integrate to Other Pages:**
   - Krama Page: Show komunitas-specific rules
   - Pelestari Page: Archive & documentation

3. **Add Admin Panel:**
   - CRUD operations for aturan
   - Approve/verify rules
   - User management

4. **Performance:**
   - Add caching (Redis, memcached)
   - Database indexing
   - API rate limiting

5. **Security:**
   - Add authentication (JWT, OAuth)
   - Input validation & sanitization
   - SQL injection prevention (already using prepared statements)

---

## 📝 File Structure

```
C:\Projek\BaliGuide_Adat\
├── src/
│   ├── services/
│   │   └── api.ts                    ← API service layer
│   ├── components/
│   │   └── wisatawan/
│   │       └── AturanList.tsx        ← List component
│   └── pages/
│       └── WisatawanPage.tsx         ← Updated page
├── .env                              ← Environment config
└── SETUP_DATABASE.md                 ← This file

C:\laragon\www\baliguide-api\
├── config.php                        ← Database connection
├── aturan.php                        ← Aturan endpoint
├── komunitas.php                     ← Komunitas endpoint
├── kategori.php                      ← Kategori endpoint
└── README.md                         ← API docs
```

---

## 💡 Tips

1. **Development Workflow:**
   ```bash
   # Terminal 1: Laragon (always running in background)
   # Terminal 2: Vite dev server
   npm run dev
   ```

2. **Check API Logs:**
   Laragon Apache logs: `C:\laragon\www\error.log`

3. **Database GUI:**
   - HeidiSQL (bundled with Laragon)
   - phpMyAdmin: `http://localhost/phpmyadmin`
   - TablePlus, DBeaver, etc.

4. **Hot Reload:**
   Vite auto-reloads saat ada perubahan di `.tsx` files.
   Tapi tidak untuk `.env` - harus restart manual.

---

## ✨ Summary

**Langkah pertama yang HARUS dilakukan:**

1. ✅ Start Laragon (Apache + MySQL)
2. ✅ Cek database `db_adatnusa` ada dan berisi data
3. ✅ Test API: `http://localhost/baliguide-api/aturan.php`
4. ✅ Run React: `npm run dev`
5. ✅ Buka browser: `http://localhost:5173`
6. ✅ Navigate ke Wisatawan page → scroll ke section "Traditional Rules"

**Semua file sudah dibuat dan siap digunakan!** 🎉

Jika ada error, cek bagian Troubleshooting di atas.
