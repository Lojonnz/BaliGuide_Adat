#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sync_aturan.py — Sync PDF rule documents from aturan/ into Laragon MySQL db_adatnusa.

Schema (existing, not modified):
  sumber_informasi  — PDF catalog (title, type, year, file_path)
  aturan_adat       — parsed rules (one row per PDF by default, FK komunitas + kategori)
  aturan_sumber     — link aturan_adat <-> sumber_informasi
  komunitas_adat    — regional communities (mapped from folder name)
  kategori_adat     — categories (mapped from PDF keywords)
  wilayah           — regions (already seeded: Bali + districts)

Steps:
  1. Scan aturan/**/*.pdf (and manifest file_paths already in DB)
  2. Extract up to N pages of text with PyPDF2 (first pages)
  3. Parse title/year/number, classify kategori
  4. Idempotent upsert: sumber_informasi by file_path, komunitas by folder map,
     aturan_adat by (id_komunitas, slug)

Usage:
  python scripts/sync_aturan.py --dry-run          # preview only
  python scripts/sync_aturan.py --execute          # write to DB
  python scripts/sync_aturan.py --execute --limit 3
  python scripts/sync_aturan.py --execute --full-text  # store full text in isi_aturan

Requires:  pip install PyPDF2 pymysql
MySQL:     C:/laragon/bin/mysql/mysql-8.4.3-winx64/bin/mysql.exe  (Laragon 8.x)
"""
import argparse, os, re, sys, json, subprocess, unicodedata
from pathlib import Path

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ATURAN_DIR   = PROJECT_ROOT / "aturan"

# ── MySQL config (Laragon defaults: root / no password) ──
DB_HOST    = os.environ.get("DB_HOST", "127.0.0.1")
DB_PORT    = int(os.environ.get("DB_PORT", "3306"))
DB_USER    = os.environ.get("DB_USER", "root")
DB_PASS    = os.environ.get("DB_PASSWORD", "")
DB_NAME    = os.environ.get("DB_NAME", "db_adatnusa")
MYSQL_BIN  = os.environ.get("MYSQL_BIN",
    "C:/laragon/bin/mysql/mysql-8.4.3-winx64/bin/mysql.exe")

# Folder -> komunitas_adat mapping (kode_komunitas matches existing seed where known)
KOMUNITAS_MAP = {
    "kab.bangli":     {"kode": "0251", "nama": "Desa Adat Bangli (Kabupaten Bangli)", "wilayah": "Bangli"},
    "kab.buleleng":   {"kode": None,   "nama": "Desa Adat Buleleng (Kabupaten Buleleng)", "wilayah": "Buleleng"},
    "kab.karangasem": {"kode": "1260", "nama": "Komunitas Adat Karangasem", "wilayah": "Karangasem"},
    "kab.tabanan":    {"kode": None,   "nama": "Desa Adat Tabanan (Kabupaten Tabanan)", "wilayah": "Tabanan"},
    "umum":           {"kode": None,   "nama": "Bali (Umum / Provinsi)", "wilayah": "Bali"},
}

# Keyword -> (id_kategori, label) — matches kategori_adat seed
KATEGORI_RULES = [
    (r"sampah|kebersihan|lingkungan",        (3,  "Lingkungan")),
    (r"perkawinan|nikah|mejangan",          (1,  "Perkawinan")),
    (r"waris|jiwa|pusaka|warisan",          (2,  "Warisan")),
    (r"upacara|odalan|bayar|piodalan|yadnya",(5,  "Upacara Adat")),
    (r"perdamian|sengketa|konflik|panyurogan",(6, "Penyelesaian Konflik")),
    (r"tanah|subak|irigasi|tegakan|pajajagan",(7, "Kepemilikan Tanah")),
    (r"krama|kasukretan|keanggotaan|soroh|prajuru|pengadegan|kelian|bandesa|bupda|lembaga|pemerintahan|desa adat|pararem", (15, "Kelembagaan dan Pemerintahan Adat")),
    (r"sosial|banjar|gotong royong",        (4,  "Kehidupan Sosial")),
]
DEFAULT_KATEGORI = (15, "Kelembagaan dan Pemerintahan Adat")

MAX_PAGES_PREVIEW = 4     # pages read for title/classification
MAX_FULL_PAGES    = 40    # cap for full-text storage

# ── PDF text extraction ────────────────────────────────────────────
def extract_pdf(path: Path, max_pages: int):
    from PyPDF2 import PdfReader
    reader = PdfReader(str(path))
    n = len(reader.pages)
    text = ""
    for i, page in enumerate(reader.pages[:max_pages]):
        text += (page.extract_text() or "") + "\n"
    return text, n

# ── Parsing helpers ────────────────────────────────────────────────
def clean(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    return re.sub(r"\n{2,}", "\n", text).strip()

def extract_title(text: str) -> str:
    """Best-effort title from PDF first pages."""
    m = re.search(
        r"(PERATURAN GUBERNUR BALI|PERATURAN DAERAH|PERATURAN DESA ADAT|AWIG[ -]?AWIG|PARAREM)\s*(.*?)\s*(?:NOMOR|NO\.|TENTANG)\s*[^\n]{0,60}",
        text, re.I | re.S)
    if m:
        t = " ".join((m.group(1) + " " + m.group(2)).split())
        return t[:180]
    # Fallback: first non-empty meaningful line
    for line in text.split("\n"):
        line = line.strip()
        if len(line) > 12 and "Jdih" not in line:
            return line[:180]
    return "Dokumen Adat (tanpa judul)"

def extract_number(text: str):
    m = re.search(r"(?:NOMOR|NO\.?)\s*([0-9]+[A-Z]?\s*/\s*[0-9]{4})", text, re.I)
    return m.group(1).replace(" ", "") if m else None

def extract_year(text: str, number: str | None):
    if number:
        m = re.search(r"/(\d{4})", number)
        if m:
            return int(m.group(1))
    m = re.search(r"(?:TAHUN|TAHUNAN|WARS[A]?|TANGGAL[^\d]*\d{1,2}\s+\w+\s+)(\d{4})", text, re.I)
    if m and 1900 <= int(m.group(1)) <= 2035:
        return int(m.group(1))
    m = re.search(r"(\d{4})", text)
    return int(m.group(1)) if m and 1900 <= int(m.group(1)) <= 2035 else None

def slugify(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return (s or "dokumen-adat")[:180]

def classify_kategori(text: str, title: str):
    hay = (title + " " + text[:6000]).lower()
    for pattern, result in KATEGORI_RULES:
        if re.search(pattern, hay):
            return result
    return DEFAULT_KATEGORI

def summarize(text: str) -> str:
    head = clean(text)[:1200].replace("\n", " ")
    return head[:480] + ("…" if len(head) > 480 else "")

def pick_wilayah(folder: str):
    return KOMUNITAS_MAP.get(folder, KOMUNITAS_MAP["umum"])["wilayah"]

# ── MySQL via CLI (no extra dependency; works with Laragon out of the box) ──
def mysql_exec(sql: str, db: str = DB_NAME) -> str:
    cmd = [MYSQL_BIN, "-u", DB_USER, "-h", DB_HOST, "-P", str(DB_PORT),
           "--default-character-set=utf8mb4", db, "-e", sql]
    if DB_PASS:
        cmd[2:2] = ["-p" + DB_PASS]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stderr)
        raise SystemExit(f"MySQL error: {r.stderr.strip()}")
    return r.stdout

def q(s: str) -> str:
    """Escape a string literal for MySQL SQL (also enforces varchar(500) cap on ringkasan)."""
    s = s.replace("\\", "\\\\").replace("'", "''").replace("\x00", " ").replace("\r", " ")
    return "'" + s + "'"

def cap(v: str, n: int) -> str:
    return v if len(v.encode('utf-8', 'replace')) <= n else v[:n]

def bytecap(v: str, n: int) -> str:
    b = v.encode('utf-8', 'replace')
    return b[:n].decode('utf-8', 'replace')

# ── Main sync ───────────────────────────────────────────────────────
def find_pdfs() -> list[Path]:
    return sorted(ATURAN_DIR.rglob("*.pdf"))

def scan_pdf(path: Path, full_text: bool) -> dict:
    text, n_pages = extract_pdf(path, MAX_FULL_PAGES if full_text else MAX_PAGES_PREVIEW)
    title = extract_title(text)
    number = extract_number(text)
    year = extract_year(text, number)
    id_kategori, kategori_label = classify_kategori(text, title)
    rel = path.relative_to(PROJECT_ROOT).as_posix()
    folder = path.parent.name
    kode = KOMUNITAS_MAP.get(folder, KOMUNITAS_MAP["umum"])["kode"]
    return {
        "path": path, "rel_path": rel, "folder": folder,
        "n_pages": n_pages, "title": title, "number": number,
        "year": year, "id_kategori": id_kategori, "kategori_label": kategori_label,
        "slug": slugify(title + ("-" + number if number else "")),
        "kode_komunitas": kode, "text": text,
        "ringkasan": summarize(text),
    }

def resolve_komunitas_id(folder: str) -> int | None:
    info = KOMUNITAS_MAP.get(folder, KOMUNITAS_MAP["umum"])
    kode = info["kode"]
    if kode:
        out = mysql_exec(f"SELECT id_komunitas FROM komunitas_adat WHERE kode_komunitas={q(kode)} LIMIT 1;")
        m = re.search(r"\n(\d+)\s*$", out)
        if m:
            return int(m.group(1))
    out = mysql_exec(f"SELECT id_komunitas FROM komunitas_adat WHERE nama_komunitas LIKE '%{info['wilayah']}%' LIMIT 1;")
    m = re.search(r"\n(\d+)\s*$", out)
    return int(m.group(1)) if m else None

def sync(records: list[dict], dry_run: bool, full_text: bool):
    for rec in records:
        k_id = resolve_komunitas_id(rec["folder"])
        if not k_id:
            print(f"  ! komunitas tidak ditemukan untuk folder '{rec['folder']}' — akan dibuat baru")
            k_id = None

        # 1. Upsert sumber_informasi (file_path unique)
        existing = mysql_exec(
            f"SELECT id_sumber FROM sumber_informasi WHERE judul_sumber={q(rec['title'])} "
            f"LIMIT 1;").strip()
        if not dry_run:
            sumber_sql = (
                f"INSERT INTO sumber_informasi (judul_sumber, jenis_sumber, penulis, penerbit, tahun_terbit, url, tanggal_akses, keterangan) "
                f"VALUES ({q(rec['title'])}, 'DOKUMEN_ADAT', NULL, 'JDIH Bali / Desa Adat', "
                f"{rec['year'] or 'NULL'}, NULL, CURDATE(), "
                f"{q('File lokal: ' + rec['rel_path'] + ' (' + str(rec['n_pages']) + ' halaman)')}) "
                f"ON DUPLICATE KEY UPDATE tahun_terbit=VALUES(tahun_terbit), keterangan=VALUES(keterangan);"
            )
            mysql_exec(sumber_sql)
            out = mysql_exec(f"SELECT id_sumber FROM sumber_informasi WHERE judul_sumber={q(rec['title'])} LIMIT 1;")
            m = re.search(r"\n(\d+)\s*$", out)
            id_sumber = int(m.group(1)) if m else None
        else:
            id_sumber = 0

        # 2. Ensure kategori exists
        # 3. Upsert aturan_adat (unique: id_komunitas + slug)
        isi = clean(rec["text"])[:80000] if full_text else clean(rec["text"][:40000])
        if k_id:
            aturan_sql = (
                f"INSERT INTO aturan_adat (id_komunitas, id_kategori, created_by, nama_aturan, slug, ringkasan, "
                f"isi_aturan, tanggal_berlaku, status_berlaku, status_verifikasi) "
                f"VALUES ({k_id}, {rec['id_kategori']}, 1, {q(bytecap(rec['title'], 195))}, {q(bytecap(rec['slug'], 175))}, "
                f"{q(bytecap(rec['ringkasan'], 490))}, {q(isi)}, NULL, 'BELUM_DIKETAHUI', 'MENUNGGU') "
                f"ON DUPLICATE KEY UPDATE isi_aturan=VALUES(isi_aturan), ringkasan=VALUES(ringkasan), "
                f"updated_at=CURRENT_TIMESTAMP;"
            )
            if not dry_run:
                mysql_exec(aturan_sql)
        print(f"  [{rec['folder']}] {rec['title'][:70]!r} | {rec['n_pages']}p | "
              f"kategori={rec['kategori_label']} | year={rec['year']}")

def main():
    p = argparse.ArgumentParser(description="Sync aturan/ PDFs → db_adatnusa (Laragon MySQL)")
    p.add_argument("--dry-run", action="store_true", help="Preview only, no DB writes")
    p.add_argument("--execute", action="store_true", help="Write to database")
    p.add_argument("--limit", type=int, default=None, help="Limit number of PDFs")
    p.add_argument("--full-text", action="store_true", help="Store full extracted text (up to 40 pages)")
    p.add_argument("--file", help="Sync a single PDF file")
    args = p.parse_args()
    if not args.dry_run and not args.execute:
        print("Gunakan --dry-run (preview) atau --execute (tulis ke DB)"); sys.exit(1)

    pdfs = [Path(args.file)] if args.file else find_pdfs()
    if args.limit:
        pdfs = pdfs[:args.limit]
    print(f"Total PDF ditemukan: {len(pdfs)}")
    records = [scan_pdf(p_, args.full_text) for p_ in pdfs]
    sync(records, dry_run=not args.execute, full_text=args.full_text)
    print("OK" if args.execute else "Dry-run selesai — tidak ada perubahan DB.")

if __name__ == "__main__":
    main()
