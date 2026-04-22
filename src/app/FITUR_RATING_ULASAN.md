# Fitur Rating & Ulasan Produk Marketplace

## Overview
Implementasi sistem rating dan ulasan untuk produk di marketplace (C2C dan B2C). Pengguna dapat memberikan rating bintang (1-5) dan komentar untuk produk, serta melihat rating rata-rata dan ulasan dari pengguna lain.

## Fitur yang Diimplementasikan

### 1. Komponen StarRating
- **File:** `/components/StarRating.tsx`
- **Fitur:**
  - Display rating bintang (1-5 stars)
  - Interactive untuk input rating
  - Readonly mode untuk display
  - 3 ukuran: small, medium, large
  - Menampilkan jumlah ulasan (count)
  - Animasi dengan Framer Motion

### 2. Rating & Ulasan di Detail Produk
- **File:** `/components/ProductDetailScreen.tsx`
- **Fitur Rating Summary:**
  - Rating rata-rata dengan decimal (e.g., 4.5)
  - Bintang rating visual
  - Jumlah total ulasan
  
- **Form Ulasan:**
  - Input rating bintang (required)
  - Textarea untuk komentar (optional)
  - Validasi rating harus 1-5
  - Loading state saat submit
  - Toast notification untuk feedback
  - Login required untuk memberikan ulasan
  
- **List Ulasan:**
  - Menampilkan semua ulasan dengan sorting terbaru di atas
  - Avatar user
  - Nama user
  - Rating bintang
  - Tanggal ulasan
  - Komentar ulasan
  - Tombol delete untuk ulasan sendiri
  - Empty state untuk produk tanpa ulasan
  - Loading state

### 3. Rating di Card Produk
- **File:** `/components/MarketplaceScreen.tsx`
- **Fitur:**
  - Menampilkan rating rata-rata di setiap product card
  - Bintang rating visual (small size)
  - Jumlah ulasan dalam kurung
  - Auto-fetch rating saat load products
  - Hanya menampilkan jika ada ulasan

### 4. Backend Endpoints
- **File:** `/supabase/functions/server/index.tsx`

**GET /api/products/:productId/reviews**
- Mengambil semua ulasan untuk produk tertentu
- Sort berdasarkan created_at descending
- Return array of reviews

**POST /api/products/:productId/reviews**
- Menambahkan ulasan baru
- Requires authentication
- Validasi rating 1-5
- Return review object

**DELETE /api/products/:productId/reviews/:reviewId**
- Menghapus ulasan
- Requires authentication
- Hanya bisa delete ulasan sendiri
- Return success status

## Struktur Data

### Review Object
```typescript
{
  id: string;              // UUID
  product_id: string;      // ID produk
  user_id: string;         // ID user yang review
  user_name: string;       // Nama user
  rating: number;          // 1-5
  comment: string;         // Komentar (bisa kosong)
  created_at: number;      // Timestamp
}
```

### Storage Key
- Pattern: `review:product:{product_id}:{review_id}`
- Example: `review:product:1:550e8400-e29b-41d4-a716-446655440000`

## User Flow

### Flow 1: Memberikan Ulasan
1. User login dan buka detail produk
2. Scroll ke section "Rating & Ulasan"
3. Klik bintang untuk memberikan rating (1-5)
4. Optional: Tulis komentar di textarea
5. Klik "Kirim Ulasan"
6. Toast notification sukses
7. Ulasan muncul di list dengan nama user

### Flow 2: Melihat Ulasan
1. User (Guest atau Member) buka detail produk
2. Scroll ke section "Rating & Ulasan"
3. Lihat rating rata-rata dan jumlah ulasan
4. Scroll list ulasan untuk baca review dari user lain
5. Lihat rating bintang, nama user, tanggal, dan komentar

### Flow 3: Menghapus Ulasan
1. User yang sudah memberikan ulasan
2. Buka detail produk yang sudah di-review
3. Scroll ke ulasan sendiri
4. Klik icon trash (Trash2)
5. Konfirmasi delete
6. Toast notification sukses
7. Ulasan hilang dari list

### Flow 4: Lihat Rating di Marketplace
1. User buka tab C2C atau B2C
2. Browse produk di grid
3. Lihat rating bintang dan jumlah ulasan di card produk
4. Produk tanpa ulasan tidak menampilkan rating

## Kalkulasi Rating

### Average Rating
```typescript
const averageRating = reviews.length > 0
  ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  : 0;
```

### Display Format
- Di product card: Round rating (Math.round)
- Di detail: 1 decimal (toFixed(1))
- Bintang visual: Rounded untuk integer 1-5

## Validasi & Authorization

### Validasi Input
- Rating harus angka 1-5
- Komentar optional, bisa kosong
- Rating tidak boleh kosong saat submit

### Authorization
- Guest: Bisa lihat rating dan ulasan
- Member (logged in): Bisa memberikan ulasan
- Member: Hanya bisa delete ulasan sendiri
- Backend verify user_id saat delete

## UI/UX Design

### Colors
- Rating stars: Amber/Gold (amber-400)
- Filled star: fill-amber-400 text-amber-400
- Empty star: fill-none text-gray-300
- Form background: emerald/teal gradient

### Spacing & Layout
- Rating summary di atas dengan border-b
- Form review dengan gradient background
- List ulasan dengan gap spacing
- Card produk dengan rating di bawah price

### Animations
- WhileTap scale on star click
- Fade in untuk list ulasan
- Exit animation saat delete
- Loading spinner saat fetch/submit

## Error Handling

### Toast Notifications
- ✅ Success: "Ulasan berhasil dikirim!"
- ✅ Success: "Ulasan berhasil dihapus"
- ❌ Error: "Silakan login terlebih dahulu untuk memberikan ulasan"
- ❌ Error: "Silakan pilih rating terlebih dahulu"
- ❌ Error: "Gagal mengirim ulasan"
- ❌ Error: "Gagal menghapus ulasan"

### Loading States
- Loading reviews: Spinner dengan text
- Submitting review: Button disabled + spinner
- Empty state: Icon + message

## Performance Optimization

### Lazy Loading
- Reviews di-fetch saat ProductDetailScreen mount
- Rating di-fetch per produk saat MarketplaceScreen load

### Caching
- ProductRatings state di MarketplaceScreen
- Tidak re-fetch jika sudah ada di state

### Batch Operations
- Fetch reviews untuk semua products di marketplace
- forEach loop untuk parallel fetching

## Next Steps (Optional)

### Enhancement Ideas
- [ ] Edit ulasan (update existing review)
- [ ] Like/helpful button untuk ulasan
- [ ] Sort ulasan (newest, highest rating, most helpful)
- [ ] Filter ulasan by rating (5 star, 4 star, dll)
- [ ] Image upload untuk ulasan (review with photos)
- [ ] Review response dari seller
- [ ] Verified purchase badge
- [ ] Rating breakdown bar chart (berapa % 5-star, 4-star, dll)

### Advanced Features
- [ ] Report inappropriate review
- [ ] Review moderation untuk admin
- [ ] Review summary dengan AI
- [ ] Email notification saat ada review baru
- [ ] Review reminder untuk pembeli

## Testing Checklist

- [x] Bisa memberikan rating dan ulasan
- [x] Rating muncul di product card
- [x] Average rating calculated correctly
- [x] Bisa delete ulasan sendiri
- [x] Tidak bisa delete ulasan orang lain
- [x] Guest bisa lihat rating tapi tidak bisa review
- [x] Form validation works
- [x] Toast notifications muncul
- [x] Loading states bekerja
- [x] Empty states bekerja
- [x] Responsive design
- [x] Dark mode support

## Database Schema

### KV Store Keys
```
review:product:{product_id}:{review_id}
```

### Example Entry
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "product_id": "1",
  "user_id": "auth-user-id-123",
  "user_name": "Ahmad Abdullah",
  "rating": 5,
  "comment": "Barang bagus, sesuai deskripsi. Penjual responsif!",
  "created_at": 1699000000000
}
```

## Security

### Backend Protection
- Token verification untuk POST dan DELETE
- User ID check untuk delete operation
- Rating range validation (1-5)

### Frontend Protection
- Disable button jika tidak login
- Show login prompt untuk guest
- Only show delete button untuk own reviews

## Integration Points

### With Authentication
- Uses session.access_token for API calls
- Extracts user_name from user_metadata
- Checks user_id for authorization

### With Products
- Reviews linked to product by product_id
- Works for both C2C and B2C products
- Displayed in ProductDetailScreen

### With UI Components
- StarRating component reusable
- Toast from sonner for notifications
- Motion from framer-motion for animations
