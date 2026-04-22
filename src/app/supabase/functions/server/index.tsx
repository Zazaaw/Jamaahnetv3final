import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";
import timelineRoutes from "./timeline.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Supabase client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper to verify user
async function verifyUser(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error) {
    console.log('Authorization error while verifying user:', error);
    return null;
  }
  return user;
}

// Initialize storage buckets
async function initializeStorageBuckets() {
  try {
    const buckets = ['make-4319e602-avatars', 'make-4319e602-products'];
    const { data: existingBuckets } = await supabaseAdmin.storage.listBuckets();
    
    for (const bucketName of buckets) {
      const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        await supabaseAdmin.storage.createBucket(bucketName, {
          public: false,
          fileSizeLimit: 5242880, // 5MB
        });
        console.log(`Created ${bucketName} bucket`);
      }
    }
  } catch (error) {
    console.log('Error initializing storage buckets:', error);
  }
}

// Initialize default data
async function initializeDefaultData() {
  try {
    // Initialize storage buckets
    await initializeStorageBuckets();
    
    // Check if already initialized
    const existing = await kv.get('system:initialized');
    if (existing) return;

    // Create invitation codes
    await kv.set('invitation:MASJID2024', { valid: true, created_at: Date.now() });
    await kv.set('invitation:JAMAAH2024', { valid: true, created_at: Date.now() });

    // Create sample articles
    await kv.set('article:1', {
      id: '1',
      title: 'Keutamaan Sedekah di Bulan Ramadhan',
      excerpt: 'Pahala sedekah di bulan Ramadhan berlipat ganda. Mari kita manfaatkan bulan penuh berkah ini...',
      author: 'Ustadz Ahmad Syarif',
      image: 'https://images.unsplash.com/photo-1550751187-da63f7e2b4eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc2xhbWljJTIwY2hhcml0eSUyMGRvbmF0aW9ufGVufDF8fHx8MTc2MjI3ODA2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      content: `Bulan Ramadhan adalah bulan yang penuh berkah dan ampunan. Di antara amalan yang sangat dianjurkan di bulan suci ini adalah sedekah. Rasulullah SAW bersabda: "Sedekah dapat menghapus dosa sebagaimana air memadamkan api." (HR. Tirmidzi)

Pahala sedekah di bulan Ramadhan berlipat ganda dibandingkan bulan-bulan lainnya. Ini karena Ramadhan adalah bulan yang penuh keberkahan, di mana setiap amalan kebaikan akan mendapat balasan yang berlipat ganda dari Allah SWT.

Keutamaan Sedekah di Bulan Ramadhan:

1. Menghapus Dosa
Sedekah dapat menghapus kesalahan dan dosa yang kita lakukan. Di bulan Ramadhan, keutamaan ini menjadi lebih besar.

2. Melipatgandakan Pahala
Allah SWT akan melipatgandakan pahala sedekah kita di bulan Ramadhan, sebagaimana disebutkan dalam Al-Qur'an bahwa Allah melipatgandakan bagi siapa yang Dia kehendaki.

3. Mendapat Naungan di Hari Kiamat
Rasulullah SAW bersabda bahwa salah satu dari tujuh golongan yang akan mendapat naungan di hari kiamat adalah orang yang bersedekah dengan sembunyi-sembunyi sehingga tangan kirinya tidak mengetahui apa yang diperbuat tangan kanannya.

4. Membersihkan Harta
Sedekah membersihkan dan mensucikan harta kita dari hak-hak orang lain yang mungkin tercampur di dalamnya.

Mari kita maksimalkan bulan Ramadhan ini dengan memperbanyak sedekah, baik berupa harta, tenaga, maupun ilmu. Semoga Allah SWT menerima amalan kita dan melipatgandakan pahala kita. Aamiin.`,
      created_at: Date.now() - 259200000,
    });

    await kv.set('article:2', {
      id: '2',
      title: 'Adab Berjamaah di Masjid',
      excerpt: 'Mengenal adab dan tata cara yang baik saat beribadah berjamaah di masjid...',
      author: 'Ustadz Muhammad Hasan',
      image: 'https://images.unsplash.com/photo-1725207837026-20dbd74d44a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3NxdWUlMjBwcmF5ZXIlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjIyNzgwNjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      content: `Shalat berjamaah memiliki keutamaan yang sangat besar dalam Islam. Pahala shalat berjamaah adalah 27 derajat lebih tinggi dibandingkan shalat sendirian. Namun, ada beberapa adab yang perlu kita perhatikan ketika melaksanakan shalat berjamaah di masjid.

Adab-Adab Berjamaah di Masjid:

1. Datang Lebih Awal
Disunnahkan untuk datang lebih awal ke masjid sebelum shalat dimulai. Ini menunjukkan kesungguhan kita dalam beribadah dan memberi kesempatan untuk melakukan shalat sunnah qabliyah.

2. Meluruskan Shaf
Rasulullah SAW sangat menekankan pentingnya meluruskan shaf. Beliau bersabda: "Luruskan shaf kalian, karena sesungguhnya meluruskan shaf termasuk kesempurnaan shalat." (HR. Bukhari dan Muslim)

3. Merapatkan Shaf
Kita diperintahkan untuk merapatkan shaf dan tidak meninggalkan celah. Rasulullah SAW bersabda: "Rapatkan shaf-shaf kalian dan rapatkan di antara bahu-bahu kalian." (HR. Abu Dawud)

4. Mengisi Shaf Depan Terlebih Dahulu
Shaf yang paling utama adalah shaf depan. Kita harus mengisi shaf depan terlebih dahulu sebelum pindah ke shaf belakang.

5. Menjaga Kebersihan Masjid
Menjaga kebersihan masjid adalah tanggung jawab setiap jamaah. Pastikan sepatu atau sandal kita tertata rapi dan tidak mengganggu orang lain.

6. Tidak Mengganggu Jamaah Lain
Hindari berbicara atau membuat suara yang dapat mengganggu konsentrasi jamaah lain dalam beribadah.

7. Tidak Melewati Orang yang Sedang Shalat
Jika ada orang yang sedang shalat, jangan melewati di depannya. Tunggulah hingga ia selesai atau carilah jalan lain.

Dengan memperhatikan adab-adab ini, kita tidak hanya mendapat pahala shalat berjamaah, tetapi juga menciptakan suasana masjid yang kondusif untuk beribadah. Semoga Allah SWT menerima ibadah kita semua.`,
      created_at: Date.now() - 345600000,
    });

    await kv.set('article:3', {
      id: '3',
      title: 'Hikmah Puasa Ramadhan bagi Kesehatan',
      excerpt: 'Selain pahala yang melimpah, puasa Ramadhan juga memberikan banyak manfaat bagi kesehatan jasmani...',
      author: 'Dr. Fatimah Az-Zahra',
      image: 'https://images.unsplash.com/photo-1606650368590-11dcf6c7f877?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMHJhbWFkYW58ZW58MXx8fHwxNzYyMjc4MDY3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      content: `Puasa Ramadhan bukan hanya ibadah spiritual yang mendekatkan diri kepada Allah SWT, tetapi juga membawa banyak manfaat bagi kesehatan tubuh kita. Penelitian modern telah membuktikan berbagai hikmah kesehatan dari berpuasa.

Manfaat Kesehatan Puasa Ramadhan:

1. Detoksifikasi Tubuh
Selama berpuasa, tubuh memiliki kesempatan untuk membersihkan diri dari racun-racun yang menumpuk. Sistem pencernaan beristirahat dan tubuh dapat fokus pada proses pembersihan alami.

2. Meningkatkan Metabolisme
Puasa dapat membantu meningkatkan metabolisme tubuh dan membantu proses pembakaran lemak yang lebih efisien.

3. Menurunkan Kadar Kolesterol
Penelitian menunjukkan bahwa puasa dapat membantu menurunkan kadar kolesterol jahat (LDL) dan meningkatkan kolesterol baik (HDL) dalam darah.

4. Mengontrol Gula Darah
Puasa membantu mengatur kadar gula darah dan meningkatkan sensitivitas insulin, yang bermanfaat terutama bagi penderita diabetes tipe 2.

5. Meningkatkan Fungsi Otak
Puasa dapat meningkatkan produksi protein BDNF (Brain-Derived Neurotrophic Factor) yang penting untuk kesehatan otak dan dapat melindungi dari penyakit neurodegeneratif.

6. Memperkuat Sistem Kekebalan Tubuh
Puasa membantu meregenerasi sel-sel kekebalan tubuh dan meningkatkan kemampuan tubuh melawan infeksi.

Tips Sehat Berpuasa:

- Konsumsi makanan bergizi seimbang saat sahur dan berbuka
- Perbanyak minum air putih di antara berbuka dan sahur
- Hindari makanan berlemak tinggi dan terlalu manis
- Tetap aktif bergerak meskipun sedang berpuasa
- Istirahat yang cukup

Dengan memahami hikmah kesehatan dari puasa, kita semakin termotivasi untuk menjalankan ibadah Ramadhan dengan penuh kesungguhan. Semoga Allah SWT memberikan kesehatan dan kekuatan kepada kita semua dalam beribadah.`,
      created_at: Date.now() - 172800000,
    });

    await kv.set('article:4', {
      id: '4',
      title: 'Membaca Al-Quran dengan Tartil',
      excerpt: 'Pentingnya membaca Al-Quran dengan tartil dan tadabbur untuk memahami makna dan hikmah di dalamnya...',
      author: 'Ustadzah Aisyah Rahmawati',
      image: 'https://images.unsplash.com/photo-1629273229664-11fabc0becc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdXJhbiUyMHJlYWRpbmclMjBtdXNsaW18ZW58MXx8fHwxNzYyMjM3MDY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      content: `Al-Quran adalah kitab suci yang diturunkan Allah SWT kepada Nabi Muhammad SAW sebagai petunjuk bagi seluruh umat manusia. Membaca Al-Quran bukan hanya sekadar membaca huruf-huruf Arab, tetapi harus dilakukan dengan tartil dan penuh penghayatan.

Pengertian Tartil:

Tartil berasal dari bahasa Arab "rattala" yang berarti membaca dengan perlahan, jelas, dan teratur. Membaca Al-Quran dengan tartil berarti membaca dengan perlahan-lahan, memberikan setiap huruf haknya, dan memperhatikan panjang pendek bacaan sesuai dengan kaidah tajwid.

Allah SWT berfirman dalam QS. Al-Muzammil ayat 4: "Dan bacalah Al-Quran dengan tartil (perlahan-lahan)."

Keutamaan Membaca Al-Quran dengan Tartil:

1. Memudahkan Pemahaman
Dengan membaca secara tartil, kita dapat lebih mudah memahami makna ayat-ayat Al-Quran dan merenungkan isi kandungannya.

2. Mendapat Pahala Berlipat
Rasulullah SAW bersabda: "Orang yang mahir membaca Al-Quran akan bersama para malaikat yang mulia dan taat. Sedangkan orang yang membaca Al-Quran dengan terbata-bata dan merasa kesulitan, maka baginya dua pahala." (HR. Bukhari dan Muslim)

3. Menenangkan Hati
Bacaan Al-Quran yang tartil dapat memberikan ketenangan dan ketenteraman bagi hati. Allah SWT berfirman: "Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram." (QS. Ar-Ra'd: 28)

4. Meningkatkan Kualitas Ibadah
Tartil membuat kita lebih fokus dan khusyuk dalam beribadah, sehingga meningkatkan kualitas ibadah kita kepada Allah SWT.

Tips Membaca Al-Quran dengan Tartil:

- Pelajari kaidah tajwid dengan baik
- Baca dengan perlahan dan jelas
- Perhatikan makhorijul huruf (tempat keluar huruf)
- Perhatikan tanda baca seperti mad, ghunnah, dan qalqalah
- Dengarkan murattal dari qari yang baik
- Praktik secara rutin setiap hari

Tadabbur Al-Quran:

Selain tartil, kita juga diperintahkan untuk bertadabbur (merenungkan) Al-Quran. Allah SWT berfirman: "Maka apakah mereka tidak memperhatikan Al-Quran ataukah hati mereka terkunci?" (QS. Muhammad: 24)

Tadabbur berarti merenungkan dan memikirkan makna ayat-ayat Al-Quran untuk kemudian diambil pelajaran dan diterapkan dalam kehidupan sehari-hari.

Mari kita jadikan Al-Quran sebagai pedoman hidup kita dengan membacanya secara tartil dan bertadabbur atas ayat-ayatnya. Semoga Allah SWT menjadikan kita termasuk ahli Al-Quran. Aamiin.`,
      created_at: Date.now() - 86400000,
    });

    await kv.set('article:5', {
      id: '5',
      title: 'Membangun Keluarga Sakinah Mawaddah Warahmah',
      excerpt: 'Panduan membangun keluarga yang harmonis, penuh cinta, dan rahmah berdasarkan tuntunan Islam...',
      author: 'Ustadz Fakhri Abdullah',
      image: 'https://images.unsplash.com/photo-1628270251031-9262ac25387b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNsaW0lMjBmYW1pbHklMjB0b2dldGhlcnxlbnwxfHx8fDE3NjIyNzgyNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      content: `Keluarga adalah fondasi utama dalam Islam. Keluarga yang sakinah (tenteram), mawaddah (penuh cinta), dan rahmah (penuh kasih sayang) adalah dambaan setiap muslim. Allah SWT berfirman dalam QS. Ar-Rum ayat 21 tentang keluarga sebagai tanda kekuasaan-Nya.

Pengertian Keluarga Sakinah Mawaddah Warahmah:

Sakinah berarti ketenangan dan ketenteraman. Mawaddah berarti cinta yang mendalam. Rahmah berarti kasih sayang yang tulus. Ketiganya merupakan pilar utama dalam membentuk keluarga yang harmonis dalam Islam.

Prinsip-Prinsip Membangun Keluarga Sakinah:

1. Fondasi Tauhid yang Kuat
Keluarga harus dibangun atas dasar ketauhidan dan ketaatan kepada Allah SWT. Setiap anggota keluarga harus memiliki komitmen untuk beribadah dan menjalankan perintah agama.

2. Komunikasi yang Baik
Komunikasi adalah kunci keharmonisan keluarga. Suami dan istri harus saling terbuka, jujur, dan mau mendengarkan satu sama lain. Hindari keras kepala dan sombong dalam berinteraksi.

3. Saling Menghormati dan Menghargai
Rasulullah SAW bersabda: "Sebaik-baik kalian adalah yang paling baik terhadap keluarganya, dan aku adalah orang yang paling baik terhadap keluargaku." (HR. Tirmidzi)

4. Pembagian Peran yang Jelas
Suami sebagai pemimpin (qawwam) bertanggung jawab mencari nafkah dan melindungi keluarga. Istri sebagai pengatur rumah tangga dan pendidik anak-anak. Keduanya saling melengkapi dan bekerja sama.

5. Pendidikan Agama untuk Anak
Orang tua bertanggung jawab mendidik anak-anak dengan nilai-nilai Islam sejak dini. Ajarkan shalat, membaca Al-Quran, akhlak mulia, dan keteladanan.

6. Pengelolaan Keuangan yang Baik
Kelola keuangan keluarga dengan bijak. Utamakan kebutuhan daripada keinginan. Sisihkan untuk sedekah dan tabungan masa depan.

7. Quality Time Bersama Keluarga
Luangkan waktu berkualitas bersama keluarga. Makan bersama, shalat berjamaah di rumah, bermain dengan anak, dan aktivitas positif lainnya.

8. Sabar dan Saling Memaafkan
Tidak ada keluarga yang sempurna. Akan ada masalah dan konflik. Kunci mengatasinya adalah dengan sabar, istighfar, dan saling memaafkan.

Tips Praktis:

- Shalat berjamaah di rumah, terutama shalat Maghrib dan Isya
- Membaca Al-Quran bersama setelah shalat
- Mengadakan kajian keluarga minimal seminggu sekali
- Merayakan momen-momen penting dalam Islam (Ramadhan, Idul Fitri, dll)
- Saling memberikan hadiah untuk mempererat kasih sayang
- Berdoa untuk keluarga setiap hari

Menghadapi Konflik:

Jika terjadi konflik, hindari bertengkar di depan anak-anak. Selesaikan dengan musyawarah dan kepala dingin. Jangan membawa orang luar jika masih bisa diselesaikan sendiri. Jika perlu, mintalah bantuan ustadz atau konselor keluarga yang terpercaya.

Mari kita berusaha membangun keluarga yang sakinah, mawaddah, dan rahmah sebagai bekal kita di dunia dan akhirat. Semoga Allah SWT senantiasa menjaga dan memberkahi keluarga kita semua. Aamiin.`,
      created_at: Date.now() - 43200000,
    });

    // Create sample events
    const today = Date.now();
    await kv.set('event:1', {
      id: '1',
      title: 'Shalat Subuh Berjamaah',
      category: 'Shalat',
      date: today + 86400000,
      location: 'Masjid Al-Ikhlas',
      description: 'Shalat Subuh berjamaah setiap hari',
      rsvp: [],
      created_at: today,
    });

    await kv.set('event:2', {
      id: '2',
      title: 'Kajian Kitab Tafsir Jalalain',
      category: 'Kajian',
      date: today + 259200000,
      location: 'Aula Masjid Lt. 2',
      description: 'Kajian kitab tafsir Jalalain bersama Ustadz Ahmad',
      rsvp: [],
      created_at: today,
    });

    await kv.set('event:3', {
      id: '3',
      title: 'Bakti Sosial Ramadhan',
      category: 'Acara Komunitas',
      date: today + 604800000,
      location: 'Masjid Al-Ikhlas',
      description: 'Kegiatan berbagi takjil dan santunan untuk masyarakat sekitar',
      rsvp: [],
      created_at: today,
    });

    // Create sample donation campaigns
    await kv.set('campaign:1', {
      id: '1',
      title: 'Renovasi Masjid',
      description: 'Dana untuk renovasi masjid agar lebih nyaman untuk beribadah. Target renovasi meliputi lantai, AC, dan sound system.',
      target_amount: 50000000,
      current_amount: 15000000,
      image: 'https://images.unsplash.com/photo-1564769610858-03d03ba43724',
      created_at: today,
    });

    await kv.set('campaign:2', {
      id: '2',
      title: 'Santunan Anak Yatim',
      description: 'Bantuan untuk anak yatim dan dhuafa di sekitar masjid. Dana akan digunakan untuk kebutuhan sekolah dan biaya hidup.',
      target_amount: 20000000,
      current_amount: 8500000,
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c',
      created_at: today,
    });

    // Create sample marketplace products (B2C) - Toko Masjid
    await kv.set('product:b2c:1', {
      id: '1',
      name: 'Al-Quran Tajwid Warna A5',
      description: 'Al-Quran ukuran A5 dengan tajwid berwarna, hard cover, kertas HVS. Cocok untuk belajar membaca Al-Quran dengan benar.',
      price: 125000,
      images: ['https://images.unsplash.com/photo-1609599006353-e629aaabfeae'],
      is_barter_allowed: false,
      seller_id: 'toko_masjid',
      seller_name: 'Toko Masjid Al-Ikhlas',
      category: 'barang',
      subcategory: 'Buku & Hobi',
      created_at: today,
      status: 'active',
    });

    await kv.set('product:b2c:2', {
      id: '2',
      name: 'Sajadah Premium Turki',
      description: 'Sajadah premium import Turki dengan bahan lembut dan tahan lama. Dilengkapi dengan tas eksklusif.',
      price: 185000,
      images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1'],
      is_barter_allowed: false,
      seller_id: 'toko_masjid',
      seller_name: 'Toko Masjid Al-Ikhlas',
      category: 'barang',
      subcategory: 'Barang Rumah',
      created_at: today,
      status: 'active',
    });

    await kv.set('product:b2c:3', {
      id: '3',
      name: 'Kurma Ajwa Premium 500gr',
      description: 'Kurma Ajwa asli Madinah 500 gram. Kualitas premium, manis dan lembut.',
      price: 150000,
      images: ['https://images.unsplash.com/photo-1584557991017-5c0b9c29c530'],
      is_barter_allowed: false,
      seller_id: 'toko_masjid',
      seller_name: 'Toko Masjid Al-Ikhlas',
      category: 'barang',
      subcategory: 'Lainnya',
      created_at: today,
      status: 'active',
    });

    // Create C2C Products - Barang (Barang Rumah)
    await kv.set('product:c2c:1', {
      id: 'c2c-1',
      name: 'Kulkas Samsung 2 Pintu',
      description: 'Kulkas bekas kondisi terawat, masih dingin sempurna. Kapasitas besar cocok untuk keluarga.',
      price: 2500000,
      images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5'],
      is_barter_allowed: true,
      seller_id: 'user_demo_1',
      seller_name: 'Ahmad Fauzi',
      category: 'barang',
      subcategory: 'Barang Rumah',
      created_at: today - 3600000,
      status: 'active',
    });

    await kv.set('product:c2c:2', {
      id: 'c2c-2',
      name: 'Meja Makan Kayu Jati 6 Kursi',
      description: 'Set meja makan kayu jati solid dengan 6 kursi. Kondisi sangat bagus, tidak ada kerusakan.',
      price: 3800000,
      images: ['https://images.unsplash.com/photo-1617096200347-cb04ae810b1d'],
      is_barter_allowed: false,
      seller_id: 'user_demo_2',
      seller_name: 'Ibu Siti',
      category: 'barang',
      subcategory: 'Barang Rumah',
      created_at: today - 7200000,
      status: 'active',
    });

    await kv.set('product:c2c:3', {
      id: 'c2c-3',
      name: 'Kompor Gas Rinnai 2 Tungku',
      description: 'Kompor gas merek Rinnai kondisi berfungsi normal. Pemakaian 2 tahun.',
      price: 850000,
      images: ['https://images.unsplash.com/photo-1585659722983-3a675dabf23d'],
      is_barter_allowed: true,
      seller_id: 'user_demo_3',
      seller_name: 'Budi Santoso',
      category: 'barang',
      subcategory: 'Barang Rumah',
      created_at: today - 10800000,
      status: 'active',
    });

    // Create C2C Products - Barang (Alat Olahraga)
    await kv.set('product:c2c:4', {
      id: 'c2c-4',
      name: 'Sepeda MTB Polygon Xtrada 5',
      description: 'Sepeda gunung Polygon Xtrada 5, ukuran 27.5 inci. Kondisi terawat, siap pakai.',
      price: 3200000,
      images: ['https://images.unsplash.com/photo-1576435728678-68d0fbf94e91'],
      is_barter_allowed: true,
      seller_id: 'user_demo_4',
      seller_name: 'Rizky Pratama',
      category: 'barang',
      subcategory: 'Alat Olahraga',
      created_at: today - 14400000,
      status: 'active',
    });

    await kv.set('product:c2c:5', {
      id: 'c2c-5',
      name: 'Raket Badminton Yonex Astrox',
      description: 'Raket badminton Yonex Astrox 88D Pro. Kondisi sangat bagus, jarang dipakai.',
      price: 1800000,
      images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea'],
      is_barter_allowed: false,
      seller_id: 'user_demo_5',
      seller_name: 'Deni Kurniawan',
      category: 'barang',
      subcategory: 'Alat Olahraga',
      created_at: today - 18000000,
      status: 'active',
    });

    await kv.set('product:c2c:6', {
      id: 'c2c-6',
      name: 'Treadmill Elektrik Fitness',
      description: 'Treadmill elektrik untuk fitness di rumah. Speed bisa diatur, kondisi mulus.',
      price: 4500000,
      images: ['https://images.unsplash.com/photo-1538805060514-97d9cc17730c'],
      is_barter_allowed: true,
      seller_id: 'user_demo_6',
      seller_name: 'Eko Prasetyo',
      category: 'barang',
      subcategory: 'Alat Olahraga',
      created_at: today - 21600000,
      status: 'active',
    });

    // Create C2C Products - Barang (Elektronik)
    await kv.set('product:c2c:7', {
      id: 'c2c-7',
      name: 'Laptop Asus ROG Gaming',
      description: 'Laptop gaming Asus ROG Strix, RAM 16GB, SSD 512GB, GPU RTX 3050. Kondisi prima.',
      price: 12000000,
      images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302'],
      is_barter_allowed: false,
      seller_id: 'user_demo_7',
      seller_name: 'Farhan Alamsyah',
      category: 'barang',
      subcategory: 'Elektronik',
      created_at: today - 25200000,
      status: 'active',
    });

    await kv.set('product:c2c:8', {
      id: 'c2c-8',
      name: 'TV LED Samsung 43 inch',
      description: 'TV LED Samsung Smart TV 43 inch. Kondisi normal, remote lengkap.',
      price: 3500000,
      images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1'],
      is_barter_allowed: true,
      seller_id: 'user_demo_8',
      seller_name: 'Hendra Wijaya',
      category: 'barang',
      subcategory: 'Elektronik',
      created_at: today - 28800000,
      status: 'active',
    });

    // Create C2C Products - Barang (Fashion)
    await kv.set('product:c2c:9', {
      id: 'c2c-9',
      name: 'Gamis Syari Premium',
      description: 'Gamis syari bahan premium, warna navy, ukuran all size hingga XL. Kondisi baru.',
      price: 250000,
      images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b'],
      is_barter_allowed: false,
      seller_id: 'user_demo_9',
      seller_name: 'Ibu Nur',
      category: 'barang',
      subcategory: 'Fashion',
      created_at: today - 32400000,
      status: 'active',
    });

    await kv.set('product:c2c:10', {
      id: 'c2c-10',
      name: 'Kemeja Koko Lengan Panjang',
      description: 'Kemeja koko putih lengan panjang, bahan cotton. Size M dan L tersedia.',
      price: 150000,
      images: ['https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77'],
      is_barter_allowed: false,
      seller_id: 'user_demo_10',
      seller_name: 'Toko Busana Muslim',
      category: 'barang',
      subcategory: 'Fashion',
      created_at: today - 36000000,
      status: 'active',
    });

    // Create C2C Products - Jasa (Jasa Perbaikan)
    await kv.set('product:c2c:11', {
      id: 'c2c-11',
      name: 'Jasa Service AC dan Cuci AC',
      description: 'Melayani service AC semua merk, cuci AC, isi freon. Berpengalaman 10 tahun. Area Jabodetabek.',
      price: 150000,
      images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12'],
      is_barter_allowed: false,
      seller_id: 'user_demo_11',
      seller_name: 'Teknik AC Sejahtera',
      category: 'jasa',
      subcategory: 'Jasa Perbaikan',
      created_at: today - 39600000,
      status: 'active',
    });

    await kv.set('product:c2c:12', {
      id: 'c2c-12',
      name: 'Jasa Tukang Listrik Profesional',
      description: 'Melayani instalasi listrik rumah, perbaikan konslet, pemasangan lampu, dll. Bergaransi.',
      price: 200000,
      images: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a'],
      is_barter_allowed: false,
      seller_id: 'user_demo_12',
      seller_name: 'Listrik Jaya',
      category: 'jasa',
      subcategory: 'Jasa Perbaikan',
      created_at: today - 43200000,
      status: 'active',
    });

    await kv.set('product:c2c:13', {
      id: 'c2c-13',
      name: 'Jasa Service Laptop dan PC',
      description: 'Service laptop dan PC semua kerusakan: install ulang, ganti hardware, cleaning virus, dll.',
      price: 100000,
      images: ['https://images.unsplash.com/photo-1587145820266-a5951ee6f620'],
      is_barter_allowed: false,
      seller_id: 'user_demo_13',
      seller_name: 'Komputer Service Center',
      category: 'jasa',
      subcategory: 'Jasa IT',
      created_at: today - 46800000,
      status: 'active',
    });

    // Create C2C Products - Jasa (Jasa Kebersihan)
    await kv.set('product:c2c:14', {
      id: 'c2c-14',
      name: 'Jasa Pembersihan Rumah',
      description: 'Layanan pembersihan rumah lengkap: sapu, pel, kaca, kamar mandi. Harian atau mingguan.',
      price: 250000,
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952'],
      is_barter_allowed: false,
      seller_id: 'user_demo_14',
      seller_name: 'Bersih Selalu',
      category: 'jasa',
      subcategory: 'Jasa Kebersihan',
      created_at: today - 50400000,
      status: 'active',
    });

    await kv.set('product:c2c:15', {
      id: 'c2c-15',
      name: 'Jasa Cuci Karpet dan Sofa',
      description: 'Cuci karpet dan sofa di tempat atau angkut. Hasil bersih maksimal dengan deterjen khusus.',
      price: 300000,
      images: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3'],
      is_barter_allowed: false,
      seller_id: 'user_demo_15',
      seller_name: 'Clean Pro',
      category: 'jasa',
      subcategory: 'Jasa Kebersihan',
      created_at: today - 54000000,
      status: 'active',
    });

    // Create C2C Products - Jasa (Jasa Pengajaran)
    await kv.set('product:c2c:16', {
      id: 'c2c-16',
      name: 'Les Privat Mengaji untuk Anak',
      description: 'Guru ngaji berpengalaman mengajar anak-anak. Metode iqro dan tahsin. Datang ke rumah.',
      price: 200000,
      images: ['https://images.unsplash.com/photo-1546410531-bb4caa6b424d'],
      is_barter_allowed: false,
      seller_id: 'user_demo_16',
      seller_name: 'Ustadz Yusuf',
      category: 'jasa',
      subcategory: 'Jasa Pengajaran',
      created_at: today - 57600000,
      status: 'active',
    });

    await kv.set('product:c2c:17', {
      id: 'c2c-17',
      name: 'Les Matematika SD-SMP',
      description: 'Guru berpengalaman mengajar matematika tingkat SD dan SMP. Online atau offline.',
      price: 150000,
      images: ['https://images.unsplash.com/photo-1509062522246-3755977927d7'],
      is_barter_allowed: false,
      seller_id: 'user_demo_17',
      seller_name: 'Tutor Matematika',
      category: 'jasa',
      subcategory: 'Jasa Pengajaran',
      created_at: today - 61200000,
      status: 'active',
    });

    // Create C2C Products - Jasa (Jasa Katering)
    await kv.set('product:c2c:18', {
      id: 'c2c-18',
      name: 'Catering Nasi Box Halal',
      description: 'Nasi box untuk acara kantor, arisan, atau syukuran. Menu bervariasi, halal dan higienis.',
      price: 25000,
      images: ['https://images.unsplash.com/photo-1588137378633-dea1336ce1e2'],
      is_barter_allowed: false,
      seller_id: 'user_demo_18',
      seller_name: 'Katering Berkah',
      category: 'jasa',
      subcategory: 'Jasa Katering',
      created_at: today - 64800000,
      status: 'active',
    });

    await kv.set('product:c2c:19', {
      id: 'c2c-19',
      name: 'Catering Prasmanan untuk Hajatan',
      description: 'Catering prasmanan komplit untuk acara pernikahan, aqiqah, atau khitanan. Minimal 100 porsi.',
      price: 50000,
      images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1'],
      is_barter_allowed: false,
      seller_id: 'user_demo_19',
      seller_name: 'Dapur Ibu',
      category: 'jasa',
      subcategory: 'Jasa Katering',
      created_at: today - 68400000,
      status: 'active',
    });

    // Create C2C Products - Lain-lain
    await kv.set('product:c2c:20', {
      id: 'c2c-20',
      name: 'Kandang Kucing 2 Tingkat',
      description: 'Kandang kucing besi 2 tingkat ukuran besar. Kondisi masih kuat dan bersih.',
      price: 500000,
      images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba'],
      is_barter_allowed: true,
      seller_id: 'user_demo_20',
      seller_name: 'Pet Shop',
      category: 'lainnya',
      created_at: today - 72000000,
      status: 'active',
    });

    // Create sample timeline posts
    await kv.set('timeline:1', {
      id: 'timeline:1',
      user_id: 'demo_user_1',
      user_name: 'Ahmad Fauzi',
      title: 'Kajian Subuh Hari Ini',
      content: 'Alhamdulillah hari ini mengikuti kajian subuh tentang keutamaan sedekah. Sangat menyentuh hati.',
      image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      created_at: today - 14400000, // 4 jam lalu
    });

    await kv.set('timeline:2', {
      id: 'timeline:2',
      user_id: 'demo_user_2',
      user_name: 'Fatimah Zahra',
      title: 'Selesai Khataman Al-Quran',
      content: 'Alhamdulillah berhasil khatam Al-Quran hari ini setelah 3 bulan. Semoga istiqamah.',
      created_at: today - 28800000, // 8 jam lalu
    });

    await kv.set('timeline:3', {
      id: 'timeline:3',
      user_id: 'demo_user_3',
      user_name: 'Umar Farooq',
      title: 'Berbagi Takjil di Jalan',
      content: 'Ikut jamaah membagikan takjil gratis untuk tukang ojek dan pengendara. Semoga bermanfaat.',
      image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      created_at: today - 43200000, // 12 jam lalu
    });

    // Mark as initialized
    await kv.set('system:initialized', true);
    console.log('Default data initialized successfully');
  } catch (error) {
    console.log('Error initializing default data:', error);
  }
}

// Initialize data on server start
initializeDefaultData();

// Generate unique Member ID
async function generateMemberId(): Promise<string> {
  // Format: JMH-XXXXXX (JMH = Jamaah, XXXXXX = 6 digit unique number)
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const uniqueNumber = (timestamp % 1000000).toString().padStart(6, '0');
  const memberId = `JMH-${uniqueNumber}`;
  
  // Check if ID already exists, if yes, regenerate
  const existing = await kv.get(`member_id:${memberId}`);
  if (existing) {
    // Add random to make it unique
    const newId = `JMH-${((timestamp + random) % 1000000).toString().padStart(6, '0')}`;
    return newId;
  }
  
  return memberId;
}

// Health check endpoint
app.get("/make-server-4319e602/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth: Sign up with invitation code
app.post("/make-server-4319e602/auth/signup", async (c) => {
  try {
    const { email, name, phone, invitationCode } = await c.req.json();
    
    // Verify invitation code
    const validCode = await kv.get(`invitation:${invitationCode}`);
    if (!validCode) {
      return c.json({ error: 'Kode undangan tidak valid' }, 400);
    }
    
    // Generate unique Member ID
    const memberId = await generateMemberId();
    
    // Generate temporary random password (user won't use this until approved)
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    
    // Create user with pending status
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      user_metadata: { 
        name, 
        phone, 
        role: 'Member',
        memberId,
        status: 'pending_approval', // User needs admin approval
        joinedAt: new Date().toISOString()
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Error creating user during signup:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Store member ID mapping for uniqueness check
    await kv.set(`member_id:${memberId}`, {
      userId: data.user.id,
      email,
      name,
      phone,
      status: 'pending_approval',
      createdAt: new Date().toISOString()
    });
    
    // Store pending user for admin review
    await kv.set(`pending_user:${data.user.id}`, {
      userId: data.user.id,
      email,
      name,
      phone,
      memberId,
      invitationCode,
      createdAt: new Date().toISOString()
    });
    
    // Mark invitation code as used
    await kv.set(`invitation:${invitationCode}:used`, email);
    
    return c.json({ 
      success: true,
      message: 'Pendaftaran berhasil. Menunggu persetujuan admin.',
      memberId 
    });
  } catch (error) {
    console.log('Error in signup endpoint:', error);
    return c.json({ error: 'Gagal mendaftar' }, 500);
  }
});

// Admin: Approve user and send password
app.post("/make-server-4319e602/admin/approve-user", async (c) => {
  try {
    const { userId } = await c.req.json();
    
    // Get pending user data
    const pendingUser = await kv.get(`pending_user:${userId}`);
    if (!pendingUser) {
      return c.json({ error: 'User tidak ditemukan' }, 404);
    }
    
    // Generate secure password (8 characters: letters + numbers)
    const generatePassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };
    
    const newPassword = generatePassword();
    
    // Update user password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        password: newPassword,
        user_metadata: {
          ...pendingUser,
          status: 'approved',
          approvedAt: new Date().toISOString()
        }
      }
    );
    
    if (updateError) {
      console.log('Error updating user password:', updateError);
      return c.json({ error: 'Gagal memperbarui password' }, 500);
    }
    
    // Update member ID status
    await kv.set(`member_id:${pendingUser.memberId}`, {
      ...await kv.get(`member_id:${pendingUser.memberId}`),
      status: 'approved',
      approvedAt: new Date().toISOString()
    });
    
    // Create in-app notification
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await kv.set(`notification:${userId}:${notificationId}`, {
      id: notificationId,
      userId,
      type: 'approval',
      title: '🎉 Akun Anda Telah Disetujui!',
      message: `Selamat! Akun Anda telah disetujui oleh admin. Anda sekarang dapat login menggunakan password yang telah dikirimkan.`,
      memberId: pendingUser.memberId,
      read: false,
      createdAt: new Date().toISOString()
    });
    
    // Remove from pending list
    await kv.del(`pending_user:${userId}`);
    
    // Prepare notification message
    const whatsappMessage = `🎉 *Jamaah.net - Akun Disetujui*\n\nAssalamu'alaikum ${pendingUser.name},\n\nSelamat! Akun Anda telah disetujui.\n\n*ID Member:* ${pendingUser.memberId}\n*Email:* ${pendingUser.email}\n*Password:* ${newPassword}\n\nSilakan login di jamaah.net menggunakan kredensial di atas.\n\n*PENTING:* Ubah password Anda setelah login pertama kali melalui menu Profil > Ubah Password.\n\nBarakallahu fiikum! 🤲`;
    
    const emailSubject = '🎉 Akun Jamaah.net Anda Telah Disetujui';
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🕌 Jamaah.net</h1>
          <p style="margin: 10px 0 0 0;">Platform Komunitas Muslim Digital</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #059669;">Assalamu'alaikum ${pendingUser.name},</h2>
          
          <p style="color: #374151; line-height: 1.6;">
            Selamat! Akun Anda telah <strong>disetujui</strong> oleh admin. Anda sekarang dapat mengakses semua fitur di Jamaah.net.
          </p>
          
          <div style="background: white; border: 2px solid #059669; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">📋 Informasi Login Anda</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>ID Member:</strong></td>
                <td style="padding: 8px 0; color: #111827; font-family: monospace; font-size: 16px;"><strong>${pendingUser.memberId}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #111827;">${pendingUser.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Password:</strong></td>
                <td style="padding: 8px 0; color: #111827; font-family: monospace; font-size: 18px; background: #fef3c7; padding: 5px 10px; border-radius: 5px;"><strong>${newPassword}</strong></td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; color: #92400e;">
              <strong>⚠️ PENTING:</strong> Untuk keamanan akun Anda, silakan <strong>ubah password</strong> setelah login pertama kali melalui menu <strong>Profil > Ubah Password</strong>.
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            Barakallahu fiikum! 🤲
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <em>Ini adalah email otomatis dari sistem Jamaah.net. Jika Anda tidak mendaftar di platform kami, silakan abaikan email ini.</em>
          </p>
        </div>
      </div>
    `;
    
    // TODO: Send WhatsApp notification via Twilio (requires TWILIO credentials)
    // const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    // const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    // const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');
    // if (twilioSid && twilioToken && twilioWhatsAppNumber) {
    //   // Send WhatsApp via Twilio API
    // }
    
    // TODO: Send Email via Resend (requires RESEND_API_KEY)
    // const resendApiKey = Deno.env.get('RESEND_API_KEY');
    // if (resendApiKey) {
    //   // Send email via Resend API
    // }
    
    console.log('User approved successfully:', {
      userId,
      email: pendingUser.email,
      memberId: pendingUser.memberId,
      password: newPassword
    });
    
    return c.json({ 
      success: true,
      message: 'User berhasil disetujui',
      data: {
        userId,
        email: pendingUser.email,
        name: pendingUser.name,
        memberId: pendingUser.memberId,
        password: newPassword,
        whatsappMessage, // For manual sending if API not configured
        emailSubject,
        emailBody
      }
    });
  } catch (error) {
    console.log('Error in approve user endpoint:', error);
    return c.json({ error: 'Gagal menyetujui user' }, 500);
  }
});

// Get notifications for user
app.get("/make-server-4319e602/api/notifications", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const notifications = await kv.getByPrefix(`notification:${user.id}:`);
    return c.json(notifications.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  } catch (error) {
    console.log('Error fetching notifications:', error);
    return c.json({ error: 'Gagal memuat notifikasi' }, 500);
  }
});

// Mark notification as read
app.post("/make-server-4319e602/api/notifications/:notificationId/read", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const notificationId = c.req.param('notificationId');
    const notification = await kv.get(`notification:${user.id}:${notificationId}`);
    
    if (!notification) {
      return c.json({ error: 'Notifikasi tidak ditemukan' }, 404);
    }
    
    await kv.set(`notification:${user.id}:${notificationId}`, {
      ...notification,
      read: true
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error marking notification as read:', error);
    return c.json({ error: 'Gagal memperbarui notifikasi' }, 500);
  }
});

// Mark all notifications as read
app.post("/make-server-4319e602/api/notifications/read-all", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const notifications = await kv.getByPrefix(`notification:${user.id}:`);
    
    for (const notification of notifications) {
      await kv.set(`notification:${user.id}:${notification.id}`, {
        ...notification,
        read: true
      });
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error marking all notifications as read:', error);
    return c.json({ error: 'Gagal memperbarui notifikasi' }, 500);
  }
});

// Get announcements
app.get("/make-server-4319e602/api/announcements", async (c) => {
  try {
    const announcements = await kv.getByPrefix('announcement:');
    return c.json(announcements.sort((a: any, b: any) => b.created_at - a.created_at));
  } catch (error) {
    console.log('Error fetching announcements:', error);
    return c.json({ error: 'Gagal memuat pengumuman' }, 500);
  }
});

// Create announcement (admin only)
app.post("/make-server-4319e602/api/announcements", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { title, content, image } = await c.req.json();
    const id = crypto.randomUUID();
    const announcement = {
      id,
      title,
      content,
      image,
      created_at: Date.now(),
      created_by: user.id
    };
    
    await kv.set(`announcement:${id}`, announcement);
    return c.json(announcement);
  } catch (error) {
    console.log('Error creating announcement:', error);
    return c.json({ error: 'Gagal membuat pengumuman' }, 500);
  }
});

// Get articles
app.get("/make-server-4319e602/api/articles", async (c) => {
  try {
    const articles = await kv.getByPrefix('article:');
    return c.json(articles.sort((a: any, b: any) => b.created_at - a.created_at));
  } catch (error) {
    console.log('Error fetching articles:', error);
    return c.json({ error: 'Gagal memuat artikel' }, 500);
  }
});

// Get comments by article
app.get("/make-server-4319e602/api/articles/:articleId/comments", async (c) => {
  try {
    const articleId = c.req.param('articleId');
    const allComments = await kv.getByPrefix(`comment:article:${articleId}:`);
    return c.json(allComments.sort((a: any, b: any) => b.created_at - a.created_at));
  } catch (error) {
    console.log('Error fetching comments:', error);
    return c.json({ error: 'Gagal memuat komentar' }, 500);
  }
});

// Post comment
app.post("/make-server-4319e602/api/articles/:articleId/comments", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const articleId = c.req.param('articleId');
    const { text } = await c.req.json();
    
    if (!text || text.trim().length === 0) {
      return c.json({ error: 'Komentar tidak boleh kosong' }, 400);
    }
    
    const commentId = crypto.randomUUID();
    const comment = {
      id: commentId,
      article_id: articleId,
      user_id: user.id,
      user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      text: text.trim(),
      created_at: Date.now(),
    };
    
    await kv.set(`comment:article:${articleId}:${commentId}`, comment);
    return c.json(comment);
  } catch (error) {
    console.log('Error posting comment:', error);
    return c.json({ error: 'Gagal mengirim komentar' }, 500);
  }
});

// Delete comment
app.delete("/make-server-4319e602/api/articles/:articleId/comments/:commentId", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const articleId = c.req.param('articleId');
    const commentId = c.req.param('commentId');
    const comment = await kv.get(`comment:article:${articleId}:${commentId}`);
    
    if (!comment) {
      return c.json({ error: 'Komentar tidak ditemukan' }, 404);
    }
    
    // Only allow user to delete their own comment
    if (comment.user_id !== user.id) {
      return c.json({ error: 'Tidak memiliki izin' }, 403);
    }
    
    await kv.del(`comment:article:${articleId}:${commentId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting comment:', error);
    return c.json({ error: 'Gagal menghapus komentar' }, 500);
  }
});

// Get events
app.get("/make-server-4319e602/api/events", async (c) => {
  try {
    const events = await kv.getByPrefix('event:');
    return c.json(events.sort((a: any, b: any) => a.date - b.date));
  } catch (error) {
    console.log('Error fetching events:', error);
    return c.json({ error: 'Gagal memuat kegiatan' }, 500);
  }
});

// Create event
app.post("/make-server-4319e602/api/events", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { title, category, date, location, description } = await c.req.json();
    const id = crypto.randomUUID();
    const event = {
      id,
      title,
      category,
      date,
      location,
      description,
      rsvp: [],
      created_at: Date.now(),
      created_by: user.id
    };
    
    await kv.set(`event:${id}`, event);
    return c.json(event);
  } catch (error) {
    console.log('Error creating event:', error);
    return c.json({ error: 'Gagal membuat kegiatan' }, 500);
  }
});

// RSVP to event
app.post("/make-server-4319e602/api/events/:id/rsvp", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const eventId = c.req.param('id');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event tidak ditemukan' }, 404);
    }
    
    if (!event.rsvp.includes(user.id)) {
      event.rsvp.push(user.id);
      await kv.set(`event:${eventId}`, event);
    }
    
    return c.json(event);
  } catch (error) {
    console.log('Error RSVPing to event:', error);
    return c.json({ error: 'Gagal RSVP' }, 500);
  }
});

// Get timeline posts
app.get("/make-server-4319e602/api/timeline", async (c) => {
  try {
    const posts = await kv.getByPrefix('timeline:');
    
    // Handle empty array
    if (!posts || posts.length === 0) {
      return c.json([]);
    }
    
    // Sort by created_at descending
    const sortedPosts = posts.sort((a: any, b: any) => {
      const aTime = a.created_at || 0;
      const bTime = b.created_at || 0;
      return bTime - aTime;
    });
    
    return c.json(sortedPosts);
  } catch (error) {
    // Only log error, don't mix with response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching timeline:', errorMessage);
    return c.json({ error: 'Gagal memuat timeline' }, 500);
  }
});

// Create timeline post
app.post("/make-server-4319e602/api/timeline", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { title, content, image } = await c.req.json();
    
    if (!title || !content) {
      return c.json({ error: 'Judul dan konten wajib diisi' }, 400);
    }

    const postId = `timeline:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const post = {
      id: postId,
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Jamaah',
      title,
      content,
      image: image || undefined,
      created_at: Date.now(),
    };

    await kv.set(postId, post);
    return c.json(post, 201);
  } catch (error) {
    console.log('Error creating timeline post:', error);
    return c.json({ error: 'Gagal membuat postingan' }, 500);
  }
});

// Upload product image
app.post("/make-server-4319e602/api/upload-product-image", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const formData = await c.req.formData();
    const file = formData.get('image');
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'File gambar tidak ditemukan' }, 400);
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Format file harus JPG, PNG, atau WebP' }, 400);
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5242880) {
      return c.json({ error: 'Ukuran file maksimal 5MB' }, 400);
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('make-4319e602-products')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });
    
    if (error) {
      console.log('Error uploading file to storage:', error);
      return c.json({ error: 'Gagal mengupload gambar' }, 500);
    }
    
    // Get signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabaseAdmin.storage
      .from('make-4319e602-products')
      .createSignedUrl(fileName, 31536000); // 1 year in seconds
    
    if (!signedUrlData?.signedUrl) {
      return c.json({ error: 'Gagal membuat URL gambar' }, 500);
    }
    
    return c.json({ 
      url: signedUrlData.signedUrl,
      path: fileName
    });
  } catch (error) {
    console.log('Error in upload product image:', error);
    return c.json({ error: 'Gagal mengupload gambar' }, 500);
  }
});

// Get marketplace products (C2C)
app.get("/make-server-4319e602/api/marketplace/c2c", async (c) => {
  try {
    const products = await kv.getByPrefix('product:c2c:');
    return c.json(products.sort((a: any, b: any) => b.created_at - a.created_at));
  } catch (error) {
    console.log('Error fetching C2C products:', error);
    return c.json({ error: 'Gagal memuat produk' }, 500);
  }
});

// Get marketplace products (B2C)
app.get("/make-server-4319e602/api/marketplace/b2c", async (c) => {
  try {
    const products = await kv.getByPrefix('product:b2c:');
    return c.json(products.sort((a: any, b: any) => b.created_at - a.created_at));
  } catch (error) {
    console.log('Error fetching B2C products:', error);
    return c.json({ error: 'Gagal memuat produk' }, 500);
  }
});

// Create product
app.post("/make-server-4319e602/api/marketplace/:type", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const type = c.req.param('type'); // c2c or b2c
    const { name, description, price, images, is_barter_allowed } = await c.req.json();
    const id = crypto.randomUUID();
    const product = {
      id,
      name,
      description,
      price,
      images,
      is_barter_allowed: is_barter_allowed || false,
      seller_id: user.id,
      seller_name: user.user_metadata?.name || user.email,
      created_at: Date.now(),
      status: 'active'
    };
    
    await kv.set(`product:${type}:${id}`, product);
    return c.json(product);
  } catch (error) {
    console.log('Error creating product:', error);
    return c.json({ error: 'Gagal membuat produk' }, 500);
  }
});

// Get product detail
app.get("/make-server-4319e602/api/marketplace/product/:id", async (c) => {
  try {
    const productId = c.req.param('id');
    const c2cProduct = await kv.get(`product:c2c:${productId}`);
    const b2cProduct = await kv.get(`product:b2c:${productId}`);
    
    const product = c2cProduct || b2cProduct;
    if (!product) {
      return c.json({ error: 'Produk tidak ditemukan' }, 404);
    }
    
    return c.json(product);
  } catch (error) {
    console.log('Error fetching product detail:', error);
    return c.json({ error: 'Gagal memuat detail produk' }, 500);
  }
});

// Get product reviews
app.get("/make-server-4319e602/api/products/:productId/reviews", async (c) => {
  try {
    const productId = c.req.param('productId');
    const reviews = await kv.getByPrefix(`review:product:${productId}:`);
    return c.json(reviews.sort((a: any, b: any) => b.created_at - a.created_at));
  } catch (error) {
    console.log('Error fetching reviews:', error);
    return c.json({ error: 'Gagal memuat ulasan' }, 500);
  }
});

// Post product review
app.post("/make-server-4319e602/api/products/:productId/reviews", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const productId = c.req.param('productId');
    const { rating, comment } = await c.req.json();
    
    if (!rating || rating < 1 || rating > 5) {
      return c.json({ error: 'Rating harus antara 1-5' }, 400);
    }
    
    const reviewId = crypto.randomUUID();
    const review = {
      id: reviewId,
      product_id: productId,
      user_id: user.id,
      user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      rating: parseInt(rating),
      comment: comment?.trim() || '',
      created_at: Date.now(),
    };
    
    await kv.set(`review:product:${productId}:${reviewId}`, review);
    return c.json(review);
  } catch (error) {
    console.log('Error posting review:', error);
    return c.json({ error: 'Gagal mengirim ulasan' }, 500);
  }
});

// Delete product review
app.delete("/make-server-4319e602/api/products/:productId/reviews/:reviewId", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const productId = c.req.param('productId');
    const reviewId = c.req.param('reviewId');
    const review = await kv.get(`review:product:${productId}:${reviewId}`);
    
    if (!review) {
      return c.json({ error: 'Ulasan tidak ditemukan' }, 404);
    }
    
    // Only allow user to delete their own review
    if (review.user_id !== user.id) {
      return c.json({ error: 'Tidak memiliki izin' }, 403);
    }
    
    await kv.del(`review:product:${productId}:${reviewId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting review:', error);
    return c.json({ error: 'Gagal menghapus ulasan' }, 500);
  }
});

// Get donation campaigns
app.get("/make-server-4319e602/api/donations/campaigns", async (c) => {
  try {
    const campaigns = await kv.getByPrefix('campaign:');
    return c.json(campaigns.sort((a: any, b: any) => b.created_at - a.created_at));
  } catch (error) {
    console.log('Error fetching campaigns:', error);
    return c.json({ error: 'Gagal memuat kampanye' }, 500);
  }
});

// Create donation
app.post("/make-server-4319e602/api/donations", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    
    const { campaign_id, amount, donor_name, is_anonymous } = await c.req.json();
    const id = crypto.randomUUID();
    const donation = {
      id,
      campaign_id,
      amount,
      donor_name: is_anonymous ? 'Hamba Allah' : donor_name,
      donor_id: user?.id,
      is_anonymous,
      created_at: Date.now(),
      status: 'pending'
    };
    
    await kv.set(`donation:${id}`, donation);
    
    // Update campaign total
    const campaign = await kv.get(`campaign:${campaign_id}`);
    if (campaign) {
      campaign.current_amount = (campaign.current_amount || 0) + amount;
      await kv.set(`campaign:${campaign_id}`, campaign);
    }
    
    return c.json(donation);
  } catch (error) {
    console.log('Error creating donation:', error);
    return c.json({ error: 'Gagal membuat donasi' }, 500);
  }
});

// Get user chats
app.get("/make-server-4319e602/api/chats", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const allChats = await kv.getByPrefix('chat:');
    const userChats = allChats.filter((chat: any) => 
      chat.participants.includes(user.id)
    );
    
    return c.json(userChats.sort((a: any, b: any) => b.last_message_at - a.last_message_at));
  } catch (error) {
    console.log('Error fetching chats:', error);
    return c.json({ error: 'Gagal memuat pesan' }, 500);
  }
});

// Start chat
app.post("/make-server-4319e602/api/chats", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { recipient_id, product_id, message } = await c.req.json();
    const chatId = [user.id, recipient_id].sort().join(':');
    
    let chat = await kv.get(`chat:${chatId}`);
    
    if (!chat) {
      // Get or create profiles for both users
      let userProfile = await kv.get(`profile:${user.id}`);
      if (!userProfile) {
        userProfile = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          username: user.user_metadata?.username,
        };
        await kv.set(`profile:${user.id}`, userProfile);
      }
      
      let recipientProfile = await kv.get(`profile:${recipient_id}`);
      if (!recipientProfile) {
        const { data: { user: recipientUser } } = await supabaseAdmin.auth.admin.getUserById(recipient_id);
        if (recipientUser) {
          recipientProfile = {
            id: recipientUser.id,
            email: recipientUser.email,
            name: recipientUser.user_metadata?.name || recipientUser.email?.split('@')[0] || 'User',
            username: recipientUser.user_metadata?.username,
          };
          await kv.set(`profile:${recipient_id}`, recipientProfile);
        }
      }
      
      chat = {
        id: chatId,
        participants: [user.id, recipient_id],
        participant_names: {
          [user.id]: userProfile.name,
          [recipient_id]: recipientProfile?.name || 'User'
        },
        product_id,
        messages: [],
        created_at: Date.now(),
        last_message_at: Date.now()
      };
    }
    
    if (message) {
      chat.messages.push({
        id: crypto.randomUUID(),
        sender_id: user.id,
        text: message,
        created_at: Date.now()
      });
      chat.last_message_at = Date.now();
    }
    
    await kv.set(`chat:${chatId}`, chat);
    return c.json(chat);
  } catch (error) {
    console.log('Error starting chat:', error);
    return c.json({ error: 'Gagal memulai chat' }, 500);
  }
});

// Send message
app.post("/make-server-4319e602/api/chats/:chatId/messages", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const chatId = c.req.param('chatId');
    const { text } = await c.req.json();
    
    const chat = await kv.get(`chat:${chatId}`);
    if (!chat || !chat.participants.includes(user.id)) {
      return c.json({ error: 'Chat tidak ditemukan' }, 404);
    }
    
    const message = {
      id: crypto.randomUUID(),
      sender_id: user.id,
      text,
      created_at: Date.now()
    };
    
    chat.messages.push(message);
    chat.last_message_at = Date.now();
    
    await kv.set(`chat:${chatId}`, chat);
    return c.json(message);
  } catch (error) {
    console.log('Error sending message:', error);
    return c.json({ error: 'Gagal mengirim pesan' }, 500);
  }
});

// Get user profile
app.get("/make-server-4319e602/api/profile", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    let profile = await kv.get(`profile:${user.id}`);
    
    if (!profile) {
      // Create default profile
      profile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        username: user.user_metadata?.username,
        role: user.user_metadata?.role || 'Member',
        member_since: user.created_at,
        wallet_balance: 0
      };
      
      // Save to KV store
      await kv.set(`profile:${user.id}`, profile);
    }
    
    return c.json(profile);
  } catch (error) {
    console.log('Error fetching profile:', error);
    return c.json({ error: 'Gagal memuat profil' }, 500);
  }
});

// Update user profile
app.put("/make-server-4319e602/api/profile", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { name, username, phone, address, mosque } = await c.req.json();
    
    // Validate username format (alphanumeric and underscore only)
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return c.json({ error: 'Username hanya boleh mengandung huruf, angka, dan underscore' }, 400);
    }
    
    // Check if username is already taken
    if (username) {
      const existingUserId = await kv.get(`username:${username.toLowerCase()}`);
      if (existingUserId && existingUserId !== user.id) {
        return c.json({ error: 'Username sudah digunakan' }, 400);
      }
    }
    
    const currentProfile = await kv.get(`profile:${user.id}`) || {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name,
      role: user.user_metadata?.role || 'Member',
      member_since: user.created_at,
      wallet_balance: 0
    };
    
    // Update username mapping if changed
    if (username && username !== currentProfile.username) {
      // Remove old username mapping
      if (currentProfile.username) {
        await kv.del(`username:${currentProfile.username.toLowerCase()}`);
      }
      // Add new username mapping
      await kv.set(`username:${username.toLowerCase()}`, user.id);
    }
    
    const updatedProfile = {
      ...currentProfile,
      name: name || currentProfile.name,
      username: username || currentProfile.username,
      phone: phone || currentProfile.phone,
      address: address || currentProfile.address,
      mosque: mosque || currentProfile.mosque,
    };
    
    await kv.set(`profile:${user.id}`, updatedProfile);
    return c.json(updatedProfile);
  } catch (error) {
    console.log('Error updating profile:', error);
    return c.json({ error: 'Gagal memperbarui profil' }, 500);
  }
});

// Search user by username
app.get("/make-server-4319e602/api/users/search", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const username = c.req.query('username');
    if (!username) {
      return c.json({ error: 'Username required' }, 400);
    }
    
    const userId = await kv.get(`username:${username.toLowerCase()}`);
    if (!userId) {
      return c.json({ error: 'User tidak ditemukan' }, 404);
    }
    
    // Don't allow searching yourself
    if (userId === user.id) {
      return c.json({ error: 'Tidak bisa menambahkan diri sendiri' }, 400);
    }
    
    const profile = await kv.get(`profile:${userId}`);
    if (!profile) {
      return c.json({ error: 'User tidak ditemukan' }, 404);
    }
    
    // Return public profile info only
    return c.json({
      id: profile.id,
      name: profile.name,
      username: profile.username,
      mosque: profile.mosque
    });
  } catch (error) {
    console.log('Error searching user:', error);
    return c.json({ error: 'Gagal mencari user' }, 500);
  }
});

// Get public user profile (NO AUTH REQUIRED)
app.get("/make-server-4319e602/api/users/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log('[PUBLIC ENDPOINT] Fetching profile for user ID:', userId);
    
    let profile = await kv.get(`profile:${userId}`);
    console.log('Profile from KV store:', profile);
    
    if (!profile) {
      // Try to get user from Supabase Auth
      try {
        console.log('Profile not in KV, fetching from Supabase Auth...');
        const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (error || !user) {
          console.log('User not found in auth:', userId, error);
          return c.json({ error: 'User tidak ditemukan' }, 404);
        }
        
        console.log('User from auth:', user);
        
        // Create basic profile from auth data
        profile = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          username: user.user_metadata?.username,
          role: user.user_metadata?.role || 'Member',
          member_since: user.created_at,
          wallet_balance: 0
        };
        
        // Save to KV store for future use
        await kv.set(`profile:${userId}`, profile);
        console.log('Created and saved profile for user:', userId, profile);
      } catch (authError) {
        console.log('Error fetching from Supabase Auth:', authError);
        return c.json({ error: 'Gagal memuat profil user' }, 500);
      }
    }
    
    // Return public profile info only
    const publicProfile = {
      id: profile.id,
      name: profile.name,
      username: profile.username,
      mosque: profile.mosque,
      avatar_url: profile.avatar_url
    };
    console.log('Returning public profile:', publicProfile);
    return c.json(publicProfile);
  } catch (error) {
    console.log('Error fetching user profile:', error);
    return c.json({ error: 'Gagal memuat profil user' }, 500);
  }
});

// Get user connections
app.get("/make-server-4319e602/api/connections", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const connections = await kv.get(`connections:${user.id}`) || { user_id: user.id, list: [] };
    
    // Get full profile info for each connection
    const connectionsWithProfiles = await Promise.all(
      connections.list.map(async (userId: string) => {
        const profile = await kv.get(`profile:${userId}`);
        return profile ? {
          id: profile.id,
          name: profile.name,
          username: profile.username,
          mosque: profile.mosque
        } : null;
      })
    );
    
    return c.json(connectionsWithProfiles.filter(Boolean));
  } catch (error) {
    console.log('Error fetching connections:', error);
    return c.json({ error: 'Gagal memuat koneksi' }, 500);
  }
});

// Delete chat
app.delete("/make-server-4319e602/api/chats/:chatId", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const chatId = c.req.param('chatId');
    const chat = await kv.get(`chat:${chatId}`);
    
    if (!chat || !chat.participants.includes(user.id)) {
      return c.json({ error: 'Chat tidak ditemukan' }, 404);
    }
    
    // Delete the chat
    await kv.del(`chat:${chatId}`);
    return c.json({ success: true, message: 'Chat berhasil dihapus' });
  } catch (error) {
    console.log('Error deleting chat:', error);
    return c.json({ error: 'Gagal menghapus chat' }, 500);
  }
});

// Add connection
app.post("/make-server-4319e602/api/connections", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { user_id } = await c.req.json();
    
    if (!user_id) {
      return c.json({ error: 'user_id required' }, 400);
    }
    
    if (user_id === user.id) {
      return c.json({ error: 'Tidak bisa menambahkan diri sendiri' }, 400);
    }
    
    // Check if target user exists
    const targetProfile = await kv.get(`profile:${user_id}`);
    if (!targetProfile) {
      return c.json({ error: 'User tidak ditemukan' }, 404);
    }
    
    // Get current connections
    const userConnections = await kv.get(`connections:${user.id}`) || { user_id: user.id, list: [] };
    const targetConnections = await kv.get(`connections:${user_id}`) || { user_id: user_id, list: [] };
    
    // Check if already connected
    if (userConnections.list.includes(user_id)) {
      return c.json({ error: 'Sudah terhubung dengan user ini' }, 400);
    }
    
    // Add mutual connection
    userConnections.list.push(user_id);
    targetConnections.list.push(user.id);
    
    await kv.set(`connections:${user.id}`, userConnections);
    await kv.set(`connections:${user_id}`, targetConnections);
    
    return c.json({ success: true, message: 'Koneksi berhasil ditambahkan' });
  } catch (error) {
    console.log('Error adding connection:', error);
    return c.json({ error: 'Gagal menambahkan koneksi' }, 500);
  }
});

// Update user profile
app.put("/make-server-4319e602/api/profile", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { name, phone, address, mosque } = await c.req.json();
    const existingProfile = await kv.get(`profile:${user.id}`) || {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'Member',
      member_since: user.created_at,
      wallet_balance: 0
    };
    
    const updatedProfile = {
      ...existingProfile,
      name: name || existingProfile.name,
      phone: phone || existingProfile.phone,
      address: address || existingProfile.address,
      mosque: mosque || existingProfile.mosque,
    };
    
    await kv.set(`profile:${user.id}`, updatedProfile);
    
    return c.json(updatedProfile);
  } catch (error) {
    console.log('Error updating profile:', error);
    return c.json({ error: 'Gagal memperbarui profil' }, 500);
  }
});

// Upload avatar
app.post("/make-server-4319e602/api/profile/avatar", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { file, fileType } = await c.req.json();
    
    if (!file) {
      return c.json({ error: 'File tidak ditemukan' }, 400);
    }
    
    // Decode base64 to buffer
    const base64Data = file.split(',')[1] || file;
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const bucketName = 'make-4319e602-avatars';
    const fileName = `${user.id}/${Date.now()}.${fileType || 'jpg'}`;
    
    // Delete old avatar if exists
    const existingProfile = await kv.get(`profile:${user.id}`);
    if (existingProfile?.avatar_path) {
      try {
        await supabaseAdmin.storage.from(bucketName).remove([existingProfile.avatar_path]);
      } catch (error) {
        console.log('Error deleting old avatar:', error);
      }
    }
    
    // Upload new avatar
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: `image/${fileType || 'jpeg'}`,
        upsert: true
      });
    
    if (uploadError) {
      console.log('Error uploading avatar:', uploadError);
      return c.json({ error: 'Gagal mengupload foto' }, 500);
    }
    
    // Get signed URL (valid for 1 year)
    const { data: urlData } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000); // 1 year
    
    // Update profile with avatar URL
    const profile = await kv.get(`profile:${user.id}`) || {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'Member',
      member_since: user.created_at,
      wallet_balance: 0
    };
    
    profile.avatar_url = urlData?.signedUrl;
    profile.avatar_path = fileName;
    
    await kv.set(`profile:${user.id}`, profile);
    
    return c.json({ 
      avatar_url: urlData?.signedUrl,
      message: 'Foto profil berhasil diupdate'
    });
  } catch (error) {
    console.log('Error uploading avatar:', error);
    return c.json({ error: 'Gagal mengupload foto profil' }, 500);
  }
});

// Update wallet
app.post("/make-server-4319e602/api/wallet/withdraw", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { amount, bank_account } = await c.req.json();
    const profile = await kv.get(`profile:${user.id}`);
    
    if (!profile || profile.wallet_balance < amount) {
      return c.json({ error: 'Saldo tidak cukup' }, 400);
    }
    
    profile.wallet_balance -= amount;
    await kv.set(`profile:${user.id}`, profile);
    
    const withdrawal = {
      id: crypto.randomUUID(),
      user_id: user.id,
      amount,
      bank_account,
      status: 'pending',
      created_at: Date.now()
    };
    
    await kv.set(`withdrawal:${withdrawal.id}`, withdrawal);
    
    return c.json({ success: true, withdrawal });
  } catch (error) {
    console.log('Error processing withdrawal:', error);
    return c.json({ error: 'Gagal memproses penarikan' }, 500);
  }
});

// Timeline routes
app.route("/make-server-4319e602/api/timeline", timelineRoutes);

Deno.serve(app.fetch);