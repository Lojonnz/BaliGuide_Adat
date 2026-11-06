# BaliGuide Adat — Nadi Bali / AuraBali

> **Bali DigiFest 2026 — Competition Submission (Appendix B Template Compliance)**
> BaliGuide Adat (also known as *Nadi Bali* / *AuraBali*) is a Progressive Web App (PWA) that combines sacred area protection via polygon geofencing, digital banjar/subak governance, and Balinese script transliteration into one bilingual, offline-ready mobile experience.

---

## 1. Project Name & Description

**BaliGuide Adat** (*Nadi Bali*, *AuraBali*) is a progressive web application (PWA) unifying three culturally grounded domains for Bali:

- **Sacred Area Protection** — Nested temple zones (Perimeter → Nista Mandala → Madya Mandala → Utama Mandala) rendered on an interactive Leaflet map, with contextual awig-awig rules, dress-code checklists, and a privacy-first cuntaka self-assessment.
- **Digital Village Governance** — Banjar citizen administration, transparent financial ledger, paruman (community meeting) management, and Subak water-gate telemetry monitoring with a B2B harvest marketplace.
- **Script Preservation (Aksara Bali)** — Bidirectional Latin ↔ Aksara Bali transliteration, gamified Wianjana writing practice on a HiDPI canvas, and a digital heritage archive (3D models, lontar manuscripts, historical photos).

The app is **mobile-first with 44 px touch targets**, supports **English / Indonesian (Bahasa Indonesia)** toggle (EN/ID) across all gates, and works offline via service-worker caching for low-connectivity temple and rural environments.

---

## 2. Problem & Target User

**Real-world problems addressed:**

| Problem | Context |
|---------|---------|
| **Tourist violations of sacred temple rules** | Visitors unknowingly enter restricted mandala zones, wear improper attire, photograph shrines, or enter while in a state of ritual impurity (cuntaka) — causing distress to pemangku and degradation of sacred sites. |
| **Fragmented manual village administration** | Banjar records, iuran collection, and paruman invitations are paper-based and non-transparent, with no unified citizen classification (Krama Adat / Krama Tamiu / Tamiu). |
| **Inefficient subak water distribution** | Tektek (water gate) flow imbalances are discovered late; deviations >15% from quota risk crop failure and inter-gate conflict in the UNESCO-listed subak system. |
| **Aksara Bali literacy decline** | Young learners and researchers lack an accessible, practice-oriented tool for transcoding and handwriting Aksara Bali. |

**Target users:**

- **Tourists / Wisatawan** — Gate 1: pre-entry compliance, zone awareness, behavioral guidance.
- **Krama & Farmers / Petani Subak** — Gate 2: banjar transparency, subak flow awareness, harvest listing.
- **Pecalang (temple security)** — Gate 1 broadcast hub: live open / restricted / closed status per temple.
- **Young learners & researchers / Pelestari** — Gate 3: transliteration, writing practice, heritage archive.

---

## 3. Key Features

### Gate 1 — Wisatawan (Tourist & Sacred Site Protection)
- **Hybrid power mode polygon geofencing** — Concentric `Circle` zones per temple on Leaflet (`TempleMap.tsx`), with zone radius, color, and opacity per mandala level. Zone entry is currently triggerable via a "Simulate Entry" flow (`GeofenceHeader.tsx` → `WisatawanPage.tsx`) that opens the compliance modal — see Section 10 for current MVP scope.
- **Contextual awig-awig rules overlay** — Per-temple rule set (attire, photography, standing-height, offerings) rendered with icons in EN/ID.
- **Dress & cuntaka checklists** — Mandatory attire checklist (kamen, senteng, shoulders covered, knees covered) plus a respect-first **cuntaka self-assessment**. Answers are processed **in-memory only** and never stored or transmitted (`AwigAwigModal.tsx`).
- **Pecalang live broadcast hub** — Temple status cards (Open / Restricted / Closed) with pulsing live indicator (`GeofenceHeader.tsx`).

### Gate 2 — Krama (Banjar & Subak Administration)
- **Banjar dashboard** — Citizen classification filtering (Krama Adat / Krama Tamiu / Tamiu), transparent ledger (income/expense/balance, IDR formatting), QRIS payment placeholder, paruman event manager with attendance bars and digital invitation CTA (`BanjarDashboard.tsx`).
- **Subak monitor** — Tektek flow telemetry with live deviation calculation and alert levels (normal / warning / critical) plus B2B harvest marketplace cards (`SubakMonitor.tsx`).

### Gate 3 — Pelestari (Script Preservation & Archives)
- **Balinese script transliteration** — Bidirectional converter with character reference panel (wianjana, suara, numerals, signs) (`TransliterationTool.tsx`).
- **Writing practice canvas** — HiDPI canvas tracing of Wianjana letters with score feedback and confetti animation (`WritingPractice.tsx`).
- **Digital heritage archive** — Gallery of 3D/VR models, lontar manuscripts, and historical photos with licensing badges (CC / Public Domain) (`HeritageArchive.tsx`).

### Cross-cutting
- **Offline PWA caching** — `vite-plugin-pwa` + Workbox (`vite.config.ts`) caches core assets and map tiles; installable to the home screen.
- **Bilingual UI (EN/ID)** — `I18nContext.tsx` with global language toggle.

---

## 4. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 8, TypeScript (~7.0), Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Mapping** | Leaflet 1.9 + react-leaflet 5 (OpenStreetMap tiles) |
| **Animation / UX** | GSAP, Framer Motion (`framer-motion`), Lenis smooth scroll, lucide-react icons |
| **PWA** | `vite-plugin-pwa` 2.0 + `workbox-window` 7.4 |
| **Runtime / Tooling** | Node.js (Vite dev server & production build) |
| **State / Data (frontend)** | Static typed mock dataset in `src/data/index.ts` (`temples`, `citizens`, `ledgerEntries`, `parumanEvents`, `subakTelemetry`, `harvestProducts`, `aksaraMappings`) |
| **Offline DB Ingestion** | MySQL (Laragon 8.x, `db_adatnusa`) via Python 3 script `scripts/sync_aturan.py` (PyPDF2 + pymysql) — **ingestion only, not yet queried by the frontend** |
| **Linting** | oxlint |

> **Architecture note:** The current MVP is a **client-only PWA**. There is no live REST API, Node.js backend server, PostgreSQL/PostGIS service, or remote database connection in the shipped frontend. A future production architecture may add Node.js API + PostgreSQL/PostGIS for server-side spatial queries and authenticated banjar administration; spatial data is currently evaluated locally (see Section 6).

---

## 5. AI / Rule-Based Implementation

No external LLM or cloud OCR service is used. "AI-like" intelligence is implemented as deterministic, dependency-free client-side processing — chosen for offline use, privacy, and zero API-key exposure in a public competition build.

### 5.1 Aksara Bali Transliteration (Rule-Based Engine)

**Location:** `src/components/pelestari/TransliterationTool.tsx` + mapping table `src/data/index.ts` (`aksaraMappings`).

**Input → Output flow:**

```
Latin input (user text, e.g. "om swastiastu")
  → lowercasing
  → greedy longest-match scan (3-char → 2-char → 1-char against mapping table)
  → emit Aksara Bali glyph / keep unmatched character verbatim
  → rendered output (toggle to reverse direction with the same table)
```

- **Latin → Aksara:** longest-match tokenizer (e.g. `nga` before `n`+`ga`); covers wianjana consonants, suara vowels, numerals 0–9, and signs (pepet, taling, cecek, bisah).
- **Aksara → Latin:** per-character reverse lookup against the same table.
- **Why rule-based over ML:** Aksara transliteration is a closed, normative mapping; a table is exact, auditable, works offline, needs no training data or API key, and preserves diacritic fidelity (pepet/taling/murda) that generic OCR would drop.

### 5.2 Subak Deviation Detection (Rule-Based Thresholding)

**Location:** `src/components/krama/SubakMonitor.tsx`.

```
flowRate, quota (L/s)
  → deviation % = (flowRate - quota) / quota × 100
  → |deviation| > 15% → critical; > 10% → warning; else normal
  → colored alert badge + progress bar update
```

Telemetry refreshes every 5 s with simulated variance in the current build (Section 10).

### 5.3 Writing Practice Scoring (Simulated Feedback)

**Location:** `src/components/pelestari/WritingPractice.tsx::stopDrawing`.

Stroke score is a **simulated 60–95% placeholder** for gamification feedback (confetti above 80%). A production model would replace this with on-device stroke matching against the guide path (SVG stroke data already present in `wianjanaLetters`).

### 5.4 Geofence Evaluation (Client-Side Zone Check)

Temple zones are concentric circles (center + radius) rendered in Leaflet. Future production logic will evaluate the visitor's GPS point against these radii client-side (see Section 6) so that raw coordinates are never uploaded or logged.

---

## 6. Architecture / Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  User (Tourist / Krama / Pelestari)                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ touch / mouse / keyboard
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend — React 19 PWA (Vite + TypeScript + Tailwind CSS)      │
│  ┌──────────┐  ┌─────────────┐  ┌───────────────┐               │
│  │Gate 1    │  │Gate 2       │  │Gate 3         │               │
│  │Wisatawan │  │Krama        │  │Pelestari      │               │
│  │TempleMap │  │BanjarDash.  │  │Transliterate  │               │
│  │AwigAwig  │  │SubakMonitor │  │WritingPractice│               │
│  └──────────┘  └─────────────┘  └───────────────┘               │
│  I18n (EN/ID) • Lenis • GSAP • Leaflet + OpenStreetMap tiles    │
│  Static data: src/data/index.ts (bundled, no network fetch)    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ (no live API call in current MVP)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Service Worker (vite-plugin-pwa / Workbox)                      │
│  Offline cache: JS/CSS assets + map tile cache                   │
└─────────────────────────────────────────────────────────────────┘

  ── Offline ingestion pipeline (separate from the PWA runtime) ──

  aturan/**/*.pdf  ──►  scripts/sync_aturan.py
                        (PyPDF2 text extraction → title/number/year
                         extraction → kategori classification by
                         keyword rules)
                           │
                           ▼
                        MySQL (Laragon, db_adatnusa) tables:
                        sumber_informasi • aturan_adat •
                        aturan_sumber • komunitas_adat •
                        kategori_adat • wilayah
                           │
                           ▼ (future: not yet wired to frontend)
                        Frontend rule overlay could query aturan_adat
                        for real awig-awig text per komunitas
```

**Privacy property — client-side geofence evaluation:** zone membership is determined locally from concentric-circle radii. The app performs **zero raw coordinate logging**, has **no server persistence of location**, and keeps the cuntaka response in React state only (reset on modal close). This is intentional for sacred-site sensitivity.

**Simplified flow (per Appendix B):**

```
User → Frontend (React PWA) → [Backend: none in MVP / MySQL ingestion only]
     → Result (in-memory UI state + offline cache)
```

---

## 7. Installation / Run Instructions

**Prerequisites:** Node.js 20+ · npm 10+ · Git. (Python 3 + Laragon/MySQL only needed for the optional PDF ingestion script.)

```bash
# 1. Clone the repository
git clone https://github.com/Lojonnz/BaliGuide_Adat.git
cd BaliGuide_Adat

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
#    Edit .env if needed — defaults work for local frontend dev.
#    Never commit .env to git (it is git-ignored).

# 4. Run locally (Vite dev server)
npm run dev
#    Open the printed local URL (typically http://localhost:5173)

# Other useful scripts
npm run build    # TypeScript check + production build into dist/
npm run preview  # Serve the production build locally
npm run lint     # oxlint
```

**`.env.example` reference** (template only — no real secrets in this repo):

```bash
# MySQL (Laragon) — scripts/sync_aturan.py only
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_adatnusa
MYSQL_BIN=C:/laragon/bin/mysql/mysql-8.4.3-winx64/bin/mysql.exe

# Frontend (Vite) — VITE_* vars are exposed to the client
VITE_APP_TITLE=BaliGuide Adat
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# API (reserved for future backend) — leave empty in MVP
API_BASE_URL=
API_KEY=
```

**Optional — ingest awig-awig PDF rules into MySQL (offline tooling):**

```bash
pip install PyPDF2 pymysql
python scripts/sync_aturan.py --dry-run    # preview, no DB writes
python scripts/sync_aturan.py --execute    # write to db_adatnusa
```

> The `aturan/` PDF corpus is git-ignored and is not required to run the PWA.

---

## 8. Deployment URL

- **Source repository:** https://github.com/Lojonnz/BaliGuide_Adat
- **Live production/staging deployment:** *Not yet deployed — run `npm run dev` locally (see Section 7).*
- **How to deploy (suggested):** build with `npm run build`, then serve `dist/` from any static host (or `npm run preview` for a local preview of the production build).

> If a hosted URL is added for judging, replace the line above with the full HTTPS link. Do not paste API keys or credentials here.

---

## 9. Demo Account

**No authentication is required in the current MVP.** All three gates are freely accessible — just open the app and use the gate navigation (Wisatawan / Krama / Pelestari).

- There are **no demo usernames, passwords, or production credentials** to share, and none are hardcoded in the codebase.
- Cuntaka and attire-checklist responses are local-only and are never sent anywhere, so there is nothing to "log in" as for testing those flows.
- If authentication is added in a future version, demo credentials must be documented here **without exposing real production secrets** — use dedicated judge-only accounts or a seed script, never a production password.

---

## 10. Known Limitations

MVP scope — documented honestly for judges:

1. **Browser PWA background geolocation is not implemented.** The Geolocation API foreground `watchPosition` flow and polygon point-in-polygon evaluation are not yet wired; zone entry is **simulated** via the "Simulate Entry" button (`GeofenceHeader.tsx`). Foreground real-GPS evaluation (client-side, privacy-preserving) is planned.
2. **Simulated telemetry modules.** Subak flow rates randomize every 5 s in `SubakMonitor.tsx`; pecalang broadcast status is static mock data. No IoT sensors, Broadcast API, or live backend yet.
3. **Mock dataset.** All citizens, ledger entries, paruman events, and harvest products in `src/data/index.ts` are illustrative samples, not real banjar records.
4. **Simulated writing score.** Canvas stroke feedback is a 60–95% random placeholder (Section 5.3), not handwriting recognition.
5. **No live backend / spatial DB.** There is no Node.js API server or PostgreSQL/PostGIS in the current build; the MySQL + `sync_aturan.py` pipeline is offline ingestion only and its tables are not yet read by the frontend.
6. **QRIS & invitation flows are placeholders.** The QRIS modal is a visual placeholder; "Send Digital Invitation" has no notification backend.
7. **Aksara transliterator scope.** Longest-match table covers core wianjana/suara/numerals/signs; full conjunct handling (antawakya, adeg-adeg) and murda capital conventions are not yet covered.

---

## 11. Third-party Resources / Credits

- **React 19** · **Vite 8** · **TypeScript** · **Tailwind CSS v4** — MIT-licensed open source.
- **Leaflet + react-leaflet** — BSD-2-Clause; map tiles © OpenStreetMap contributors (ODbL).
- **vite-plugin-pwa / Workbox** — MIT-licensed; service-worker caching.
- **GSAP**, **Framer Motion**, **Lenis**, **Lucide React** — MIT-licensed (icons: ISC).
- **PyPDF2**, **pymysql** — used only by the offline ingestion script (`scripts/sync_aturan.py`).
- **DiceBear avatars** (`api.dicebear.com/7.x/initials`) — used for citizen avatar placeholders with initials fallback.
- **Heritage data** — licensing badges (CC BY / CC BY-NC / Public Domain) per item in `src/data/index.ts`; owners cited include Bali Heritage Foundation, Museum Gedong Kirtya, Dinas Kebudayaan Bali, UNESCO Indonesia, KITLV Archives.
- **Institutional source material (offline corpus):** Peraturan Gubernur Bali, Peraturan Desa Adat, and related awig-awig / pararem PDF documents (JDIH Bali / Desa Adat) — ingested locally via `sync_aturan.py` for the `db_adatnusa` archive (not redistributed in this repo).

---

## 12. Team Members

| Name | Role |
|------|------|
| _[Team Member 1 — I Putu Cahyadi Putra]_ | Lead Developer,Frontend / UX,Design |
| _[Team Member 2 — I Gede Dika Bomantara]_ | Research / Content (adat & awig-awig) |
| _[Team Member 3 — I Putu Angga Sukma Wibawa]_ | Documentation |

>The git author is `Lojon` (GitHub: `Lojonnz`).

---

## Security Note

- **No secrets in this repository** — no hardcoded API keys, database passwords, or tokens. All configuration is via `.env` (git-ignored), documented in `.env.example`.
- Client-side geofence evaluation and in-memory-only cuntaka handling mean **no raw coordinates or ritual-impurity data leave the device**.

## License

See `LICENSE` file.
