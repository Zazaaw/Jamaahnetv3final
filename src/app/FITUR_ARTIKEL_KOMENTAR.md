# Fitur Artikel & Sistem Komentar

## Overview
Implementasi lengkap fitur artikel dengan sistem komentar/diskusi untuk platform jamaah.net. Pengguna dapat membaca artikel Islamic, berkomentar, dan berdiskusi dengan jamaah lainnya.

## Fitur yang Diimplementasikan

### 1. Detail Artikel
- **ArticleDetailScreen.tsx**
  - Header dengan tombol back dan share
  - Gambar artikel full-width
  - Judul, author, dan tanggal publikasi
  - Konten lengkap artikel dengan formatting
  - Dekorasi Islamic patterns dan quote hadits
  - Desain modern dengan glassmorphism effects

### 2. Sistem Komentar
- **Fitur Komentar:**
  - Form input komentar untuk user yang sudah login
  - List komentar dengan sorting terbaru di atas
  - Nama user dan timestamp untuk setiap komentar
  - Tombol delete untuk komentar sendiri
  - Loading state dan empty state
  - Real-time update setelah post/delete
  - Notifikasi toast untuk feedback

- **Backend Endpoints:**
  - `GET /api/articles/:articleId/comments` - Ambil semua komentar
  - `POST /api/articles/:articleId/comments` - Posting komentar baru
  - `DELETE /api/articles/:articleId/comments/:commentId` - Hapus komentar

### 3. Halaman Semua Artikel
- **AllArticlesScreen.tsx**
  - List semua artikel dengan pagination
  - Search/filter artikel berdasarkan judul, excerpt, atau author
  - Preview gambar artikel
  - Card design dengan hover effects
  - Sort berdasarkan tanggal terbaru

### 4. Data Artikel
Total 5 artikel Islamic dengan konten lengkap:
1. **Keutamaan Sedekah di Bulan Ramadhan** - Ustadz Ahmad Syarif
2. **Adab Berjamaah di Masjid** - Ustadz Muhammad Hasan
3. **Hikmah Puasa Ramadhan bagi Kesehatan** - Dr. Fatimah Az-Zahra
4. **Membaca Al-Quran dengan Tartil** - Ustadzah Aisyah Rahmawati
5. **Membangun Keluarga Sakinah Mawaddah Warahmah** - Ustadz Fakhri Abdullah

## Navigasi & User Flow

### Flow 1: Baca Artikel dari Home
1. User di HomeScreen
2. Klik salah satu artikel (dari 3 artikel terbaru)
3. Muncul ArticleDetailScreen dengan konten lengkap
4. User bisa scroll untuk membaca artikel
5. User bisa berkomentar jika sudah login
6. Klik back untuk kembali ke Home

### Flow 2: Lihat Semua Artikel
1. User di HomeScreen
2. Klik tombol "Semua" di section Artikel Terbaru
3. Muncul AllArticlesScreen dengan semua artikel
4. User bisa search artikel
5. Klik artikel untuk melihat detail
6. Klik back untuk kembali ke AllArticlesScreen

### Flow 3: Berkomentar
1. User sudah login
2. Buka artikel di ArticleDetailScreen
3. Scroll ke bagian "Diskusi Artikel"
4. Ketik komentar di form
5. Klik "Kirim"
6. Komentar muncul di list dengan nama user
7. User bisa delete komentar sendiri

## Struktur Data

### Article
```typescript
{
  id: string;
  title: string;
  excerpt: string;
  author: string;
  created_at: number;
  image?: string;
  content?: string;
}
```

### Comment
```typescript
{
  id: string;
  article_id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: number;
}
```

## Backend Storage
- Artikel disimpan dengan prefix: `article:{id}`
- Komentar disimpan dengan prefix: `comment:article:{article_id}:{comment_id}`
- Menggunakan Supabase KV Store

## Desain & Styling
- Islamic theme dengan emerald/teal colors
- Glassmorphism effects untuk cards
- Motion animations menggunakan Framer Motion
- Responsive design mobile-first
- Dark mode support
- Arabic decorative elements (۞)

## Authentication & Authorization
- Guest dapat membaca artikel dan melihat komentar
- Login required untuk berkomentar
- User hanya bisa delete komentar sendiri
- Token verification menggunakan Supabase Auth

## Error Handling
- Toast notifications untuk success/error
- Loading states untuk fetching data
- Empty states untuk kondisi no data
- Validation untuk input komentar

## Next Steps (Optional)
- [ ] Like/love reaction untuk artikel
- [ ] Reply to comment (nested comments)
- [ ] Bookmark artikel favorit
- [ ] Share artikel ke social media
- [ ] Kategori artikel dan filtering
- [ ] Related articles suggestions
- [ ] Rich text editor untuk artikel
