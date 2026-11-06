# BaliGuide Adat

**Alternative brand names:** Nadi Bali, AuraBali

A Progressive Web App (PWA) unifying sacred site protection, digital Balinese village (banjar/subak) governance, and Aksara Bali script preservation into three core user gates.

## 🌟 Features

### Gate 1: Wisatawan (Tourist & Sacred Site Protection)
- **Real-time Temple Status** — Live geofence monitoring with Pecalang broadcast simulation
- **Awig-Awig Compliance Modal** — Mandatory traditional attire checklist and behavioral rules
- **Respectful Cuntaka Assessment** — Privacy-first ritual impurity self-check (never stored)
- **Interactive Nested Zone Map** — Leaflet-powered map showing Perimeter, Nista Mandala, Madya Mandala, and Utama Mandala zones

### Gate 2: Krama (Banjar & Subak Administration)
- **Smart Banjar Dashboard**
  - Citizen classification filtering (Krama Adat, Krama Tamiu, Tamiu)
  - Transparent financial ledger with QRIS payment integration
  - Paruman (community meeting) event manager with digital invitations
- **Subak IoT Monitor**
  - Real-time Tektek (water gate) flow telemetry with automated deviation alerts (>15% quota variance)
  - B2B Harvest Marketplace for farmer collectives to list produce for corporate buyers

### Gate 3: Pelestari (Script Preservation & Archives)
- **Aksara Bali Transliteration Tool** — Live Latin ↔ Aksara Bali converter supporting pepet, taling, murda, and numerals
- **Gamified Writing Practice** — Interactive canvas for tracing Wianjana letters with instant stroke feedback
- **Digital Heritage Archive** — Gallery of 3D/VR models, Lontar manuscripts, and historical photos with licensing badges

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS v4 with CSS custom properties for theming
- **Mapping:** Leaflet (`react-leaflet`)
- **Icons:** Lucide React
- **PWA:** `vite-plugin-pwa` with offline caching for core assets and map tiles

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Navbar, Layout, LanguageToggle
│   ├── wisatawan/       # GeofenceHeader, AwigAwigModal, TempleMap
│   ├── krama/           # BanjarDashboard, SubakMonitor
│   └── pelestari/       # TransliterationTool, WritingPractice, HeritageArchive
├── context/             # I18nContext for bilingual support (EN/ID)
├── data/                # Mock data for temples, citizens, ledgers, telemetry
├── pages/               # WisatawanPage, KramaPage, PelestariPage
├── types/               # TypeScript interfaces
├── App.tsx              # Main app with gate routing
└── main.tsx             # Entry point
```

## 🎨 Design System

**Color Palette:**
- Primary: Terracotta (#B45309)
- Accent: Amber (#F59E0B)
- Background: Sand (#FFF7ED)
- Status Colors: Open (Green #059669), Restricted (Amber), Closed (Red #DC2626)

**Accessibility:**
- WCAG 2.2 AA compliant contrast ratios
- Minimum 44px touch targets
- Mobile-first responsive design
- Dark mode support via `prefers-color-scheme` and `data-theme` attribute

## 🔒 Privacy & Security

- **Zero raw coordinate logging** — Geofence evaluation is client-side only
- **No server persistence** of user location data
- **In-memory Cuntaka assessment** — Ritual impurity responses never transmitted or stored
- **Offline-first** — Service worker caches core assets and map tiles for low-connectivity environments

## 📱 PWA Features

- **Installable** — Add to home screen on mobile devices
- **Offline-ready** — Core functionality works without internet
- **Fast loading** — Service worker caches critical resources
- **Responsive** — Optimized for phone, tablet, and desktop

## 🌐 Internationalization

Bilingual support for:
- 🇬🇧 English
- 🇮🇩 Indonesian (Bahasa Indonesia)

Toggle between languages with the globe button in the top navigation.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with respect for Balinese sacred traditions, village governance systems, and cultural heritage preservation.

---

**Note:** This is a demonstration PWA. For production deployment, integrate with actual Pecalang broadcast APIs, real telemetry data sources, and authenticated banjar administration systems.
