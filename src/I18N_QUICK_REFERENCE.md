# 🌐 i18n Quick Reference

## 🎯 How to Use Translations in Components

### **1. Import the hook:**
```tsx
import { useLanguage } from '../utils/LanguageContext';
```

### **2. Use inside component:**
```tsx
export default function MyComponent() {
  const { t, language, toggleLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('home.welcome')}</h1>
      <p>{t('home.subtitle')}</p>
      <button onClick={toggleLanguage}>
        {language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa'}
      </button>
    </div>
  );
}
```

---

## 📖 Common Translation Keys

### **Profile**
```tsx
{t('profile.welcome')}           // Selamat Datang / Welcome
{t('profile.editProfile')}       // Edit Profil / Edit Profile
{t('profile.posts')}             // Postingan / Posts
{t('profile.connections')}       // Koneksi / Connections
{t('profile.noPosts')}           // Belum ada postingan / No posts yet
{t('profile.noProducts')}        // Belum ada produk / No products yet
```

### **Settings**
```tsx
{t('settings.title')}            // Pengaturan / Settings
{t('settings.darkMode')}         // Mode Gelap / Dark Mode
{t('settings.language')}         // Bahasa / Language
{t('settings.prayerTimes')}      // Waktu Sholat / Prayer Times
{t('settings.wallet')}           // Dompet Digital / Digital Wallet
{t('settings.changePassword')}   // Ganti Password / Change Password
```

### **Actions**
```tsx
{t('actions.create')}            // Buat / Create
{t('actions.edit')}              // Edit / Edit
{t('actions.delete')}            // Hapus / Delete
{t('actions.save')}              // Simpan / Save
{t('actions.cancel')}            // Batal / Cancel
{t('actions.approve')}           // Setujui / Approve
{t('actions.reject')}            // Tolak / Reject
{t('actions.logout')}            // Keluar / Logout
```

### **Status**
```tsx
{t('status.pending')}            // Menunggu / Pending
{t('status.approved')}           // Disetujui / Approved
{t('status.rejected')}           // Ditolak / Rejected
{t('status.live')}               // LIVE / LIVE
{t('status.loading')}            // Memuat... / Loading...
{t('status.success')}            // Berhasil / Success
```

### **Home**
```tsx
{t('home.upcomingEvents')}       // Acara Mendatang / Upcoming Events
{t('home.activeCampaigns')}      // Kampanye Aktif / Active Campaigns
{t('home.latestArticles')}       // Artikel Terbaru / Latest Articles
{t('home.donateNow')}            // Donasi Sekarang / Donate Now
{t('home.searchPlaceholder')}    // Cari... / Search...
```

### **Admin**
```tsx
{t('admin.title')}               // Admin Dashboard / Admin Dashboard
{t('admin.userManagement')}      // Manajemen Pengguna / User Management
{t('admin.timeline')}            // Timeline / Timeline
{t('admin.articles')}            // Artikel / Articles
{t('admin.moderation')}          // Moderasi / Moderation
{t('admin.reports')}             // Laporan / Reports
```

---

## 🎨 Language Toggle Component

```tsx
<motion.div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
  <button
    onClick={toggleLanguage}
    className="w-full flex items-center justify-between"
  >
    <div className="flex items-center gap-3">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl">
        <Languages className="w-5 h-5 text-white" />
      </div>
      <div className="text-left">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {t('settings.language')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {language === 'id' ? t('settings.english') : t('settings.indonesian')}
        </p>
      </div>
    </div>
    <div className={`w-12 h-6 rounded-full transition-colors ${
      language === 'en' ? 'bg-indigo-600' : 'bg-gray-300'
    } relative`}>
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
        language === 'en' ? 'translate-x-6' : ''
      }`} />
    </div>
  </button>
</motion.div>
```

---

## 📝 Search & Replace Patterns

### **For VSCode:**

1. Open Find & Replace (Cmd+Shift+H / Ctrl+Shift+H)
2. Enable Regex mode
3. Use these patterns:

**Pattern 1: Simple quoted strings**
```regex
"(Selamat Datang|Edit Profil|Pengaturan|Mode Gelap)"
```
**Replace with:**
```
{t('profile.$1')}
```

**Pattern 2: Button text**
```regex
<button[^>]*>([^<]+)</button>
```
**Replace with:**
```
<button>{t('actions.$1')}</button>
```

---

## 🔍 Full Key Reference

### **Navigation (nav.*)**
- `nav.home` → Beranda / Home
- `nav.calendar` → Kalender / Calendar
- `nav.market` → Pasar / Market
- `nav.donation` → Donasi / Donation
- `nav.profile` → Profil / Profile
- `nav.settings` → Pengaturan / Settings
- `nav.chat` → Pesan / Chat
- `nav.about` → Tentang Kami / About Us
- `nav.timeline` → Timeline / Timeline
- `nav.events` → Acara / Events
- `nav.campaigns` → Kampanye / Campaigns
- `nav.articles` → Artikel / Articles

### **Actions (actions.*)**
- `actions.create` → Buat / Create
- `actions.createPost` → Buat Postingan / Create Post
- `actions.edit` → Edit / Edit
- `actions.delete` → Hapus / Delete
- `actions.save` → Simpan / Save
- `actions.cancel` → Batal / Cancel
- `actions.approve` → Setujui / Approve
- `actions.reject` → Tolak / Reject
- `actions.hide` → Sembunyikan / Hide
- `actions.logout` → Keluar / Logout
- `actions.send` → Kirim / Send
- `actions.buy` → Beli / Buy
- `actions.barter` → Tukar / Barter
- `actions.view` → Lihat / View
- `actions.seeAll` → Semua / See All

### **Status (status.*)**
- `status.pending` → Menunggu / Pending
- `status.approved` → Disetujui / Approved
- `status.rejected` → Ditolak / Rejected
- `status.active` → Aktif / Active
- `status.loading` → Memuat... / Loading...
- `status.success` → Berhasil / Success
- `status.error` → Gagal / Error
- `status.live` → LIVE / LIVE

### **Profile (profile.*)**
- `profile.welcome` → Selamat Datang / Welcome
- `profile.welcomeMessage` → Daftar atau masuk... / Register or login...
- `profile.editProfile` → Edit Profil / Edit Profile
- `profile.posts` → Postingan / Posts
- `profile.connections` → Koneksi / Connections
- `profile.likes` → Suka / Likes
- `profile.noPosts` → Belum ada postingan / No posts yet
- `profile.noProducts` → Belum ada produk / No products listed yet
- `profile.verified` → VERIFIED / VERIFIED
- `profile.inbox` → Kotak Masuk / Inbox

### **Settings (settings.*)**
- `settings.title` → Pengaturan / Settings
- `settings.subtitle` → Kelola akun... / Manage your account...
- `settings.darkMode` → Mode Gelap / Dark Mode
- `settings.language` → Bahasa / Language
- `settings.prayerTimes` → Waktu Sholat / Prayer Times
- `settings.wallet` → Dompet Digital / Digital Wallet
- `settings.history` → Histori Transaksi / Transaction History
- `settings.changePassword` → Ganti Password / Change Password
- `settings.contact` → Hubungi Kami / Contact Us
- `settings.aboutJamaah` → Tentang Jamaah.net / About Jamaah.net
- `settings.adminDashboard` → Admin Dashboard / Admin Dashboard

### **Home (home.*)**
- `home.greeting` → Assalamu'alaikum / Peace be upon you
- `home.searchPlaceholder` → Cari di jamaah.net... / Search in jamaah.net...
- `home.upcomingEvents` → Acara Mendatang / Upcoming Events
- `home.activeCampaigns` → Kampanye Aktif / Active Campaigns
- `home.latestArticles` → Artikel Terbaru / Latest Articles
- `home.donateNow` → Donasi Sekarang / Donate Now
- `home.communityTimeline` → Timeline Komunitas / Community Timeline

### **Admin (admin.*)**
- `admin.title` → Admin Dashboard / Admin Dashboard
- `admin.subtitle` → Kelola seluruh platform / Manage entire platform
- `admin.overview` → Overview / Overview
- `admin.users` → Pengguna / Users
- `admin.timeline` → Timeline / Timeline
- `admin.events` → Acara / Events
- `admin.marketplace` → Pasar / Marketplace
- `admin.campaigns` → Kampanye / Campaigns
- `admin.articles` → Artikel / Articles
- `admin.moderation` → Moderasi / Moderation
- `admin.reports` → Laporan / Reports
- `admin.userManagement` → Manajemen Pengguna / User Management
- `admin.timelineManagement` → Manajemen Timeline / Timeline Management
- `admin.createArticle` → Buat Artikel Baru / Create New Article

---

## ⚡ Pro Tips

### **1. Dynamic text with variables:**
```tsx
// Bad
{t('home.welcome', { name: userName })} // ❌ Not supported

// Good
{t('home.welcome')} {userName}  // ✅ Concatenate separately
```

### **2. Conditional translations:**
```tsx
{language === 'id' ? 'Bahasa Indonesia' : 'English'}
{language === 'id' ? t('settings.indonesian') : t('settings.english')}
```

### **3. Status badges:**
```tsx
{product.status === 'approved' ? (
  <span>{t('status.live')}</span>
) : (
  <span>{t('status.pending').toUpperCase()}</span>
)}
```

### **4. Button labels:**
```tsx
<button>
  <Plus className="w-5 h-5" />
  {t('actions.createPost')}
</button>
```

### **5. Toast messages:**
```tsx
toast.success(t('admin.userApproved'));
toast.error(t('admin.errorLoading'));
```

---

## 🧪 Testing Commands

```tsx
// Get current language
console.log(language); // 'id' or 'en'

// Toggle language
toggleLanguage();

// Get specific translation
console.log(t('profile.welcome'));

// Check localStorage
console.log(localStorage.getItem('jamaah-language'));
```

---

## 🎯 Implementation Checklist

- [ ] Import `useLanguage` hook
- [ ] Destructure `t`, `language`, `toggleLanguage`
- [ ] Replace all hardcoded strings with `t('key')`
- [ ] Add language toggle (ProfileScreen only)
- [ ] Test language switching
- [ ] Verify localStorage persistence
- [ ] Check all screens
- [ ] Verify no console errors

---

**Need Help?** Check:
1. `/I18N_IMPLEMENTATION_GUIDE.md` - Detailed guide
2. `/I18N_COMPLETION_SUMMARY.md` - Full summary
3. `/src/utils/translations.ts` - All available keys
