import * as kv from "./kv_store.tsx";

// Seed initial data for the platform
export async function seedData() {
  // Create invitation codes
  await kv.set('invitation:MASJID2024', { valid: true, created_at: Date.now() });
  await kv.set('invitation:JAMAAH2024', { valid: true, created_at: Date.now() });
  
  // Create sample announcements
  await kv.set('announcement:1', {
    id: '1',
    title: 'Jadwal Shalat Jumat',
    content: 'Khotbah dimulai pukul 12:00 WIB. Jamaah diharapkan hadir 15 menit sebelumnya.',
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff',
    created_at: Date.now() - 86400000,
  });
  
  await kv.set('announcement:2', {
    id: '2',
    title: 'Kajian Rutin Ahad Pagi',
    content: 'Kajian rutin setiap Ahad pukul 08:00 WIB dengan tema Tafsir Al-Quran.',
    image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae',
    created_at: Date.now() - 172800000,
  });
  
  // Create sample articles
  await kv.set('article:1', {
    id: '1',
    title: 'Keutamaan Sedekah di Bulan Ramadhan',
    excerpt: 'Pahala sedekah di bulan Ramadhan berlipat ganda...',
    author: 'Ustadz Ahmad',
    created_at: Date.now() - 259200000,
  });
  
  // Create sample events
  const today = new Date();
  
  await kv.set('event:1', {
    id: '1',
    title: 'Shalat Subuh Berjamaah',
    category: 'Shalat',
    date: new Date(Date.now() + 86400000).getTime(), // +1 day
    location: 'Masjid Al-Ikhlas',
    description: 'Shalat Subuh berjamaah setiap hari di Masjid Al-Ikhlas. Mari raih pahala shalat berjamaah yang luar biasa!',
    rsvp: [],
    created_at: Date.now(),
  });
  
  await kv.set('event:2', {
    id: '2',
    title: 'Kelas Tahsin Al-Quran',
    category: 'Kajian',
    date: new Date(Date.now() + 172800000).getTime(), // +2 days
    location: 'Ruang Belajar Masjid',
    description: 'Kelas tahsin untuk memperbaiki bacaan Al-Quran dengan metode tartil. Terbuka untuk semua usia, dibimbing oleh Ustadzah Aisyah.',
    rsvp: [],
    created_at: Date.now(),
  });
  
  await kv.set('event:3', {
    id: '3',
    title: 'Kajian Kitab Tafsir',
    category: 'Kajian',
    date: new Date(Date.now() + 259200000).getTime(), // +3 days
    location: 'Aula Masjid',
    description: 'Kajian kitab tafsir Jalalain bersama Ustadz Abdullah. Membahas tafsir ayat-ayat pilihan dengan bahasa yang mudah dipahami.',
    rsvp: [],
    created_at: Date.now(),
  });
  
  await kv.set('event:4', {
    id: '4',
    title: 'Halaqah Pemuda Jumat Malam',
    category: 'Acara Komunitas',
    date: new Date(Date.now() + 432000000).getTime(), // +5 days
    location: 'Teras Masjid',
    description: 'Kajian rutin pemuda setiap Jumat malam dengan tema "Menjadi Pemuda Sholeh di Era Digital". Sharing session dan diskusi santai bersama teman-teman sebaya.',
    rsvp: [],
    created_at: Date.now(),
  });
  
  // Create sample donation campaigns
  await kv.set('campaign:1', {
    id: '1',
    title: 'Renovasi Masjid',
    description: 'Dana untuk renovasi masjid agar lebih nyaman untuk beribadah',
    target_amount: 50000000,
    current_amount: 15000000,
    image: 'https://images.unsplash.com/photo-1564769610858-03d03ba43724',
    created_at: Date.now(),
  });
  
  await kv.set('campaign:2', {
    id: '2',
    title: 'Santunan Anak Yatim',
    description: 'Bantuan untuk anak yatim dan dhuafa di sekitar masjid',
    target_amount: 20000000,
    current_amount: 8500000,
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c',
    created_at: Date.now(),
  });
  
  // Create sample marketplace products (B2C - Toko Masjid)
  await kv.set('product:b2c:1', {
    id: '1',
    name: 'Al-Quran Tajwid Warna',
    description: 'Al-Quran dengan tajwid berwarna, ukuran A5',
    price: 125000,
    images: ['https://images.unsplash.com/photo-1609599006353-e629aaabfeae'],
    is_barter_allowed: false,
    seller_id: 'toko_masjid',
    seller_name: 'Toko Masjid Al-Ikhlas',
    created_at: Date.now(),
    status: 'active',
  });
  
  await kv.set('product:b2c:2', {
    id: '2',
    name: 'Sajadah Premium',
    description: 'Sajadah premium dengan bahan lembut dan tahan lama',
    price: 85000,
    images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1'],
    is_barter_allowed: false,
    seller_id: 'toko_masjid',
    seller_name: 'Toko Masjid Al-Ikhlas',
    created_at: Date.now(),
    status: 'active',
  });
  
  // Create sample timeline posts
  await kv.set('timeline:1', {
    id: '1',
    user_name: 'Ahmad Fauzi',
    content: 'Alhamdulillah, pagi ini bisa ikut kajian subuh di masjid. Semoga bermanfaat! 🤲',
    created_at: Date.now() - 3600000, // 1 hour ago
  });
  
  await kv.set('timeline:2', {
    id: '2',
    user_name: 'Siti Nurhaliza',
    content: 'Jazakillahu khairan untuk kajian taklim ibu-ibu hari ini. Semoga ilmunya berkah.',
    created_at: Date.now() - 7200000, // 2 hours ago
  });
  
  await kv.set('timeline:3', {
    id: '3',
    user_name: 'Budi Santoso',
    content: 'Terima kasih panitia takjil gratis. Barakallahu fiikum! 🥤',
    created_at: Date.now() - 10800000, // 3 hours ago
  });
  
  console.log('Seed data created successfully');
}