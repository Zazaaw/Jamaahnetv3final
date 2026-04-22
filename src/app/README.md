# jamaah.net - Platform Komunitas Muslim Digital

Platform komunitas muslim untuk beribadah, berinteraksi, dan bertransaksi halal.

## 🌟 Fitur Utama

### 1. **Masjid Kami** (Home)
- Info masjid dengan jadwal shalat 5 waktu
- Carousel pengumuman terbaru
- Quick access ke fitur utama
- Artikel dan kajian terbaru

### 2. **Kegiatan** (Calendar)
- Kalender kegiatan masjid
- Filter berdasarkan kategori: Shalat, Kajian, Acara Komunitas
- RSVP untuk member
- Detail lokasi dan jumlah peserta

### 3. **Pasar Halal** (Marketplace)
- **Pasar Jamaah (C2C)**: Jual beli antar jamaah
- **Toko Masjid (B2C)**: Produk resmi dari toko masjid
- Fitur barter untuk transaksi C2C
- Opsi transaksi: Rekber (Rekening Bersama) atau COD
- Chat untuk negosiasi

### 4. **Donasi** (Infaq)
- Kampanye donasi masjid
- Progress bar transparan
- Opsi donasi anonim (Hamba Allah)
- Laporan transparansi untuk member
- Integrasi payment gateway (Midtrans/Xendit)

### 5. **Akun Saya** (Profile)
- Login dengan email/password atau Google OAuth
- **Kode undangan wajib** untuk pendaftaran
- Dompet digital untuk penarikan dana
- Kotak masuk untuk chat
- Histori transaksi

## 🔐 Sistem Autentikasi

- **Guest**: Dapat melihat konten publik
- **Member**: Akses penuh (RSVP, marketplace, chat, donasi)
- Pendaftaran memerlukan **kode undangan** dari pengurus masjid

### Demo Kode Undangan
- `MASJID2024`
- `JAMAAH2024`

## 💬 Fitur Chat
- Chat P2P untuk negosiasi produk
- Real-time messaging
- Riwayat percakapan tersimpan

## 🛡️ Keamanan Transaksi
- Rekber (Rekening Bersama) untuk transaksi aman
- Chat untuk COD dan negosiasi
- Sistem rating dan review (coming soon)

## 🎨 Design System
- Mobile-first responsive design
- Islamic-themed color palette (Emerald/Teal)
- Bottom tab navigation
- Smooth animations dan transitions

## 🚀 Tech Stack
- **Frontend**: React + TypeScript
- **Backend**: Supabase (Edge Functions + Hono)
- **Database**: Supabase KV Store
- **Auth**: Supabase Auth (Email + Google OAuth)
- **Styling**: Tailwind CSS

## 📱 Screen Flow

```
SplashScreen
    ↓
TabNavigation
    ├── Home (Masjid Kami)
    ├── Calendar (Kegiatan)
    ├── Marketplace (Pasar Halal)
    │   ├── Product Detail
    │   └── Post Product Modal
    ├── Donation (Infaq)
    │   └── Donation Modal
    └── Profile (Akun Saya)
        ├── Auth Screen (Login/Signup)
        ├── Chat List
        └── Chat Screen
```

## 🔄 Data Models

### User Profile
- id, email, name, role, member_since, wallet_balance

### Product
- id, name, description, price, images, is_barter_allowed, seller_id, seller_name, status

### Event
- id, title, category, date, location, description, rsvp[]

### Campaign
- id, title, description, target_amount, current_amount, image

### Chat
- id, participants[], product_id, messages[], last_message_at

## 🎯 Future Enhancements
- Push notifications untuk pengumuman
- Integrasi dengan API jadwal shalat real-time
- Video streaming untuk kajian online
- Sistem zakat digital
- Marketplace rating & review
- Multi-language support (ID/AR/EN)
- PWA support untuk install as app

## 📄 License
Created for Figma Make platform demonstration.

---

**Platform ini dibuat sebagai prototype. Untuk produksi, pastikan untuk:**
- Setup email confirmation di Supabase
- Konfigurasi Google OAuth di Supabase Console
- Integrasi payment gateway Midtrans/Xendit
- Tambahkan proper error handling dan validation
- Implementasi security rules yang ketat
