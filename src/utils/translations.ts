// Translation Dictionary for Jamaah.net
// Supports: Indonesian (id) and English (en)

export type Language = 'id' | 'en';

export const translations = {
  // Navigation
  nav: {
    home: { id: 'Beranda', en: 'Home' },
    calendar: { id: 'Kalender', en: 'Calendar' },
    market: { id: 'Pasar', en: 'Market' },
    marketplace: { id: 'Pasar', en: 'Marketplace' },
    donation: { id: 'Donasi', en: 'Donation' },
    profile: { id: 'Profil', en: 'Profile' },
    settings: { id: 'Pengaturan', en: 'Settings' },
    chat: { id: 'Pesan', en: 'Chat' },
    about: { id: 'Tentang Kami', en: 'About Us' },
    timeline: { id: 'Timeline', en: 'Timeline' },
    events: { id: 'Acara', en: 'Events' },
    campaigns: { id: 'Kampanye', en: 'Campaigns' },
    articles: { id: 'Artikel', en: 'Articles' },
  },

  // Common Actions
  actions: {
    create: { id: 'Buat', en: 'Create' },
    createPost: { id: 'Buat Postingan', en: 'Create Post' },
    createNew: { id: 'Buat Baru', en: 'Create New' },
    edit: { id: 'Edit', en: 'Edit' },
    delete: { id: 'Hapus', en: 'Delete' },
    save: { id: 'Simpan', en: 'Save' },
    cancel: { id: 'Batal', en: 'Cancel' },
    approve: { id: 'Setujui', en: 'Approve' },
    reject: { id: 'Tolak', en: 'Reject' },
    hide: { id: 'Sembunyikan', en: 'Hide' },
    logout: { id: 'Keluar', en: 'Logout' },
    login: { id: 'Masuk', en: 'Login' },
    register: { id: 'Daftar', en: 'Register' },
    send: { id: 'Kirim', en: 'Send' },
    buy: { id: 'Beli', en: 'Buy' },
    barter: { id: 'Tukar', en: 'Barter' },
    submit: { id: 'Kirim', en: 'Submit' },
    view: { id: 'Lihat', en: 'View' },
    viewAll: { id: 'Lihat Semua', en: 'View All' },
    seeAll: { id: 'Semua', en: 'See All' },
    close: { id: 'Tutup', en: 'Close' },
  },

  // Status/States
  status: {
    pending: { id: 'Menunggu', en: 'Pending' },
    approved: { id: 'Disetujui', en: 'Approved' },
    rejected: { id: 'Ditolak', en: 'Rejected' },
    active: { id: 'Aktif', en: 'Active' },
    inactive: { id: 'Tidak Aktif', en: 'Inactive' },
    loading: { id: 'Memuat...', en: 'Loading...' },
    success: { id: 'Berhasil', en: 'Success' },
    error: { id: 'Gagal', en: 'Error' },
    live: { id: 'LIVE', en: 'LIVE' },
    draft: { id: 'Draft', en: 'Draft' },
    completed: { id: 'Selesai', en: 'Completed' },
  },

  // Profile Screen
  profile: {
    title: { id: 'Profil', en: 'Profile' },
    welcome: { id: 'Selamat Datang', en: 'Welcome' },
    welcomeMessage: { id: 'Daftar atau masuk untuk mengakses fitur lengkap jamaah.net', en: 'Register or login to access full features of jamaah.net' },
    registerLogin: { id: 'Daftar / Masuk', en: 'Register / Login' },
    editProfile: { id: 'Edit Profil', en: 'Edit Profile' },
    posts: { id: 'Postingan', en: 'Posts' },
    connections: { id: 'Koneksi', en: 'Connections' },
    likes: { id: 'Suka', en: 'Likes' },
    noPosts: { id: 'Belum ada postingan', en: 'No posts yet' },
    noPostsMessage: { id: 'Mulai berbagi kegiatan ibadah Anda', en: 'Start sharing your worship activities' },
    noProducts: { id: 'Belum ada produk yang dijual', en: 'No products listed yet' },
    noProductsMessage: { id: 'Mulai berjualan di Pasar Jamaah!', en: 'Start selling on Jamaah Market!' },
    memberId: { id: 'ID Member', en: 'Member ID' },
    verified: { id: 'VERIFIED', en: 'VERIFIED' },
    inbox: { id: 'Kotak Masuk', en: 'Inbox' },
  },

  // Settings Menu
  settings: {
    title: { id: 'Pengaturan', en: 'Settings' },
    subtitle: { id: 'Kelola akun dan preferensi Anda', en: 'Manage your account and preferences' },
    darkMode: { id: 'Mode Gelap', en: 'Dark Mode' },
    darkModeOn: { id: 'Aktif', en: 'Active' },
    darkModeOff: { id: 'Nonaktif', en: 'Inactive' },
    language: { id: 'Bahasa', en: 'Language' },
    languageSubtitle: { id: 'Ubah bahasa aplikasi', en: 'Change app language' },
    indonesian: { id: 'Bahasa Indonesia', en: 'Indonesian' },
    english: { id: 'English', en: 'English' },
    prayerTimes: { id: 'Waktu Sholat', en: 'Prayer Times' },
    prayerTimesSubtitle: { id: 'Atur jadwal sholat', en: 'Set prayer schedule' },
    connectionsMenu: { id: 'Koneksi', en: 'Connections' },
    connectionsSubtitle: { id: 'Kelola koneksi Anda', en: 'Manage your connections' },
    wallet: { id: 'Dompet Digital', en: 'Digital Wallet' },
    history: { id: 'Histori Transaksi', en: 'Transaction History' },
    historySubtitle: { id: 'Riwayat transaksi', en: 'Transaction history' },
    changePassword: { id: 'Ganti Password', en: 'Change Password' },
    changePasswordSubtitle: { id: 'Ubah password Anda', en: 'Change your password' },
    contact: { id: 'Hubungi Kami', en: 'Contact Us' },
    contactSubtitle: { id: 'Bantuan & dukungan', en: 'Help & support' },
    aboutJamaah: { id: 'Tentang Jamaah.net', en: 'About Jamaah.net' },
    aboutJamaahSubtitle: { id: 'Visi & misi komunitas', en: 'Community vision & mission' },
    adminDashboard: { id: 'Admin Dashboard', en: 'Admin Dashboard' },
    adminDashboardSubtitle: { id: 'Kelola platform jamaah.net', en: 'Manage jamaah.net platform' },
    logoutSubtitle: { id: 'Logout dari akun', en: 'Logout from account' },
  },

  // Home Screen
  home: {
    greeting: { id: 'Assalamu\'alaikum', en: 'Peace be upon you' },
    searchPlaceholder: { id: 'Cari di jamaah.net...', en: 'Search in jamaah.net...' },
    announcements: { id: 'Pengumuman', en: 'Announcements' },
    upcomingEvents: { id: 'Acara Mendatang', en: 'Upcoming Events' },
    upcomingEventsSubtitle: { id: 'Jangan lewatkan!', en: 'Don\'t miss out!' },
    activeCampaigns: { id: 'Kampanye Aktif', en: 'Active Campaigns' },
    activeCampaignsSubtitle: { id: 'Mari berbagi kebaikan', en: 'Let\'s share goodness' },
    donateNow: { id: 'Donasi Sekarang', en: 'Donate Now' },
    collected: { id: 'Terkumpul', en: 'Collected' },
    target: { id: 'Target', en: 'Target' },
    donors: { id: 'Donatur', en: 'Donors' },
    latestArticles: { id: 'Artikel Terbaru', en: 'Latest Articles' },
    latestArticlesSubtitle: { id: 'Baca kajian dan informasi terkini', en: 'Read latest studies and information' },
    readMore: { id: 'Baca Selengkapnya', en: 'Read More' },
    community: { id: 'Komunitas', en: 'Community' },
    communityTimeline: { id: 'Timeline Komunitas', en: 'Community Timeline' },
    communitySubtitle: { id: 'Bagikan momen ibadah Anda', en: 'Share your worship moments' },
    noTimeline: { id: 'Belum ada postingan', en: 'No posts yet' },
    noTimelineMessage: { id: 'Jadilah yang pertama berbagi!', en: 'Be the first to share!' },
  },

  // Admin Dashboard
  admin: {
    title: { id: 'Admin Dashboard', en: 'Admin Dashboard' },
    subtitle: { id: 'Kelola seluruh platform jamaah.net', en: 'Manage entire jamaah.net platform' },
    backToProfile: { id: 'Kembali ke Profil', en: 'Back to Profile' },
    
    // Tabs
    overview: { id: 'Overview', en: 'Overview' },
    users: { id: 'Pengguna', en: 'Users' },
    timeline: { id: 'Timeline', en: 'Timeline' },
    events: { id: 'Acara', en: 'Events' },
    marketplace: { id: 'Pasar', en: 'Marketplace' },
    campaigns: { id: 'Kampanye', en: 'Campaigns' },
    articles: { id: 'Artikel', en: 'Articles' },
    moderation: { id: 'Moderasi', en: 'Moderation' },
    reports: { id: 'Laporan', en: 'Reports' },

    // Stats
    totalUsers: { id: 'Total Pengguna', en: 'Total Users' },
    activeUsers: { id: 'Pengguna Aktif', en: 'Active Users' },
    pendingUsers: { id: 'Menunggu Verifikasi', en: 'Pending Verification' },
    totalProducts: { id: 'Total Produk', en: 'Total Products' },
    pendingProducts: { id: 'Produk Menunggu', en: 'Pending Products' },
    activeCampaigns: { id: 'Kampanye Aktif', en: 'Active Campaigns' },
    totalDonations: { id: 'Total Donasi', en: 'Total Donations' },
    monthlyGrowth: { id: 'Pertumbuhan Bulanan', en: 'Monthly Growth' },

    // User Management
    userManagement: { id: 'Manajemen Pengguna', en: 'User Management' },
    userManagementSubtitle: { id: 'Kelola dan verifikasi pengguna', en: 'Manage and verify users' },
    searchUsers: { id: 'Cari pengguna...', en: 'Search users...' },
    allUsers: { id: 'Semua Pengguna', en: 'All Users' },
    pendingApproval: { id: 'Menunggu Persetujuan', en: 'Pending Approval' },
    approveUser: { id: 'Setujui Pengguna', en: 'Approve User' },
    rejectUser: { id: 'Tolak Pengguna', en: 'Reject User' },
    memberSince: { id: 'Bergabung sejak', en: 'Member since' },

    // Timeline Management
    timelineManagement: { id: 'Manajemen Timeline', en: 'Timeline Management' },
    createTimelinePost: { id: 'Buat Postingan Timeline', en: 'Create Timeline Post' },
    timelinePost: { id: 'Postingan Timeline', en: 'Timeline Post' },
    views: { id: 'tayangan', en: 'views' },

    // Events Management
    eventManagement: { id: 'Manajemen Acara', en: 'Event Management' },
    createEvent: { id: 'Buat Acara Baru', en: 'Create New Event' },
    location: { id: 'Lokasi', en: 'Location' },
    participants: { id: 'peserta', en: 'participants' },

    // Marketplace Management
    marketplaceManagement: { id: 'Manajemen Pasar', en: 'Marketplace Management' },
    filterByCategory: { id: 'Filter berdasarkan kategori', en: 'Filter by category' },
    all: { id: 'Semua', en: 'All' },
    food: { id: 'Makanan', en: 'Food' },
    clothing: { id: 'Pakaian', en: 'Clothing' },
    books: { id: 'Buku', en: 'Books' },
    electronics: { id: 'Elektronik', en: 'Electronics' },
    seller: { id: 'Penjual', en: 'Seller' },
    price: { id: 'Harga', en: 'Price' },

    // Campaign Management
    campaignManagement: { id: 'Manajemen Kampanye', en: 'Campaign Management' },
    createCampaign: { id: 'Buat Kampanye Baru', en: 'Create New Campaign' },
    progress: { id: 'Progress', en: 'Progress' },
    completed: { id: 'selesai', en: 'completed' },
    ends: { id: 'Berakhir', en: 'Ends' },

    // Article Management
    articleManagement: { id: 'Manajemen Artikel', en: 'Article Management' },
    createArticle: { id: 'Buat Artikel Baru', en: 'Create New Article' },

    // Moderation
    contentModeration: { id: 'Moderasi Konten', en: 'Content Moderation' },
    moderationSubtitle: { id: 'Tinjau konten yang dibuat pengguna dan ambil tindakan terhadap pelanggaran kebijakan', en: 'Review user-generated content and take action on policy violations' },
    totalItems: { id: 'Total Item', en: 'Total Items' },
    needsReview: { id: 'Perlu Ditinjau', en: 'Needs Review' },
    actionsToday: { id: 'Tindakan Hari Ini', en: 'Actions Today' },
    pendingReview: { id: 'Menunggu Peninjauan', en: 'Pending Review' },
    noItems: { id: 'Tidak ada item yang perlu ditinjau', en: 'No items to review' },
    keepItClean: { id: 'Jaga komunitas tetap bersih!', en: 'Keep the community clean!' },

    // Reports
    userReports: { id: 'Laporan Pengguna', en: 'User Reports' },
    reportsSubtitle: { id: 'Tinjau dan tangani laporan dari komunitas', en: 'Review and handle reports from the community' },
    openReports: { id: 'Laporan Terbuka', en: 'Open Reports' },
    resolvedToday: { id: 'Diselesaikan Hari Ini', en: 'Resolved Today' },
    avgResponseTime: { id: 'Waktu Respons Rata-rata', en: 'Avg Response Time' },
    highPriority: { id: 'Prioritas Tinggi', en: 'High Priority' },
    reportedBy: { id: 'Dilaporkan oleh', en: 'Reported by' },
    reason: { id: 'Alasan', en: 'Reason' },
    investigate: { id: 'Selidiki', en: 'Investigate' },
    dismiss: { id: 'Abaikan', en: 'Dismiss' },
    takeDown: { id: 'Hapus Konten', en: 'Take Down' },
    noReports: { id: 'Tidak ada laporan', en: 'No reports' },
    noReportsMessage: { id: 'Semua laporan telah ditangani', en: 'All reports have been handled' },

    // Messages
    userApproved: { id: 'Pengguna berhasil disetujui!', en: 'User successfully approved!' },
    userRejected: { id: 'Pengguna berhasil ditolak!', en: 'User successfully rejected!' },
    timelineApproved: { id: 'Timeline post berhasil disetujui!', en: 'Timeline post successfully approved!' },
    timelineRejected: { id: 'Timeline post berhasil disembunyikan!', en: 'Timeline post successfully hidden!' },
    timelineDeleted: { id: 'Timeline post berhasil dihapus!', en: 'Timeline post successfully deleted!' },
    articleDeleted: { id: 'Artikel berhasil dihapus!', en: 'Article successfully deleted!' },
    errorLoading: { id: 'Gagal memuat data dashboard', en: 'Failed to load dashboard data' },
  },

  // Placeholders
  placeholders: {
    searchUsers: { id: 'Cari pengguna...', en: 'Search users...' },
    whatsOnMind: { id: 'Apa yang Anda pikirkan?', en: 'What\'s on your mind?' },
    noItems: { id: 'Tidak ada item', en: 'No items found' },
    noProducts: { id: 'Tidak ada produk', en: 'No products' },
    noCampaigns: { id: 'Tidak ada kampanye', en: 'No campaigns' },
    noEvents: { id: 'Tidak ada acara', en: 'No events' },
  },

  // Common
  common: {
    or: { id: 'atau', en: 'or' },
    of: { id: 'dari', en: 'of' },
    by: { id: 'oleh', en: 'by' },
    in: { id: 'di', en: 'in' },
    at: { id: 'pada', en: 'at' },
    to: { id: 'ke', en: 'to' },
    from: { id: 'dari', en: 'from' },
    admin: { id: 'ADMIN', en: 'ADMIN' },
  },

  // Time/Date
  time: {
    today: { id: 'Hari ini', en: 'Today' },
    yesterday: { id: 'Kemarin', en: 'Yesterday' },
    daysAgo: { id: 'hari yang lalu', en: 'days ago' },
    hoursAgo: { id: 'jam yang lalu', en: 'hours ago' },
    minutesAgo: { id: 'menit yang lalu', en: 'minutes ago' },
    justNow: { id: 'Baru saja', en: 'Just now' },
  },
} as const;

// Helper function to get translation
export function getTranslation(
  key: string,
  lang: Language = 'id'
): string {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    value = value?.[k];
    if (!value) return key; // Return key if translation not found
  }

  return value[lang] || value['id'] || key;
}

// Export type for translation keys (for TypeScript autocomplete)
export type TranslationKey = 
  | `nav.${keyof typeof translations.nav}`
  | `actions.${keyof typeof translations.actions}`
  | `status.${keyof typeof translations.status}`
  | `profile.${keyof typeof translations.profile}`
  | `settings.${keyof typeof translations.settings}`
  | `home.${keyof typeof translations.home}`
  | `admin.${keyof typeof translations.admin}`
  | `placeholders.${keyof typeof translations.placeholders}`
  | `common.${keyof typeof translations.common}`
  | `time.${keyof typeof translations.time}`;
