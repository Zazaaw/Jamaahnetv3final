# 🌐 i18n Implementation Guide for Jamaah.net

## ✅ Completed Steps

### 1. Translation Dictionary Created
**File:** `/src/utils/translations.ts`
- ✅ Complete ID/EN translations for all UI elements
- ✅ Supports nav, actions, status, profile, settings, home, admin sections
- ✅ Helper function `getTranslation()` included
- ✅ TypeScript support with TranslationKey type

### 2. Language Context Provider Created
**File:** `/src/utils/LanguageContext.tsx`
- ✅ React Context for global language state  
- ✅ Persists to localStorage as `'jamaah-language'`
- ✅ Provides `t(key)`, `language`, `setLanguage()`, `toggleLanguage()` helpers
- ✅ Custom hook `useLanguage()` for components

### 3. ProfileScreen.tsx Updated
- ✅ Added `Languages` icon import
- ✅ Added `useLanguage` hook import  
- ✅ Initialized hook: `const { t, language, toggleLanguage } = useLanguage();`

---

## 📝 Implementation Steps for ProfileScreen.tsx

### **Step 1: Add Language Toggle MenuItem**

Insert this after the Dark Mode toggle (around line 574):

```tsx
{/* Language Toggle */}
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.12 }}
  className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4"
>
  <button
    onClick={toggleLanguage}
    className="w-full flex items-center justify-between"
  >
    <div className="flex items-center gap-3">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl">
        <Languages className="w-5 h-5 text-white" />
      </div>
      <div className="text-left">
        <h3 className="font-semibold text-gray-900 dark:text-white">{t('settings.language')}</h3>
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

### **Step 2: Replace Hardcoded Strings**

Replace all hardcoded text with `{t('key')}` function calls. Here are the key replacements:

#### **Welcome Screen (Not Logged In)**
```tsx
// Line ~140
<h2 className="text-2xl font-bold mb-2 dark:text-white">{t('profile.welcome')}</h2>
<p className="text-gray-600 dark:text-gray-400 mb-6">
  {t('profile.welcomeMessage')}
</p>

// Line ~148  
<motion.button ... >
  {t('profile.registerLogin')}
</motion.button>
```

#### **Stats Labels**
```tsx
// Line ~244
<div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.posts')}</div>

// Line ~254
<div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.connections')}</div>

// Line ~264
<div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.likes')}</div>
```

#### **Member ID Card**
```tsx
// Line ~299
<span className="text-white/90 text-xs font-semibold">{t('profile.memberId')}</span>

// Line ~313
<span className="text-white text-[10px] font-semibold">{t('profile.verified')}</span>
```

#### **Edit Profile Button**
```tsx
// Line ~326
<motion.button ... >
  {t('profile.editProfile')}
</motion.button>
```

#### **Empty States**
```tsx
// No Posts (Line ~373)
<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
  {t('profile.noPosts')}
</h3>
<p className="text-sm text-gray-500 dark:text-gray-400">
  {t('profile.noPostsMessage')}
</p>

// No Products (Line ~437)
<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
  {t('profile.noProducts')}
</h3>
<p className="text-sm text-gray-500 dark:text-gray-400">
  {t('profile.noProductsMessage')}
</p>
```

#### **Settings Menu Header**
```tsx
// Line ~527
<h2 className="text-2xl font-bold">{t('settings.title')}</h2>

// Line ~536
<p className="text-white/80 text-sm">{t('settings.subtitle')}</p>
```

#### **Dark Mode**
```tsx
// Line ~553
<h3 className="font-semibold text-gray-900 dark:text-white">{t('settings.darkMode')}</h3>
<p className="text-xs text-gray-500 dark:text-gray-400">
  {darkMode ? t('settings.darkModeOn') : t('settings.darkModeOff')}
</p>
```

#### **Settings Menu Items**
Replace all SettingsMenuItem component calls:

```tsx
<SettingsMenuItem
  icon={Clock}
  title={t('settings.prayerTimes')}
  subtitle={t('settings.prayerTimesSubtitle')}
  ...
/>

<SettingsMenuItem
  icon={Users}
  title={t('settings.connectionsMenu')}
  subtitle={t('settings.connectionsSubtitle')}
  ...
/>

<SettingsMenuItem
  icon={Wallet}
  title={t('settings.wallet')}
  subtitle={formatPrice(profile?.wallet_balance || 0)}
  ...
/>

<SettingsMenuItem
  icon={History}
  title={t('settings.history')}
  subtitle={t('settings.historySubtitle')}
  ...
/>

<SettingsMenuItem
  icon={Lock}
  title={t('settings.changePassword')}
  subtitle={t('settings.changePasswordSubtitle')}
  ...
/>

<SettingsMenuItem
  icon={Phone}
  title={t('settings.contact')}
  subtitle={t('settings.contactSubtitle')}
  ...
/>

<SettingsMenuItem
  icon={Info}
  title={t('settings.aboutJamaah')}
  subtitle={t('settings.aboutJamaahSubtitle')}
  ...
/>

<SettingsMenuItem
  icon={Shield}
  title={t('settings.adminDashboard')}
  subtitle={t('settings.adminDashboardSubtitle')}
  ...
/>
```

#### **Logout Button**
```tsx
// Line ~698
<h3 className="font-semibold text-red-600 dark:text-red-400">{t('actions.logout')}</h3>
<p className="text-xs text-red-500 dark:text-red-400/80">{t('settings.logoutSubtitle')}</p>
```

#### **Inbox Tooltip**
```tsx
// Line ~747
<div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
  {t('profile.inbox')}
  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
</div>
```

#### **Status Badges in Product Cards**
```tsx
// Line ~461-472
{product.status === 'approved' ? (
  <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
    {t('status.live')}
  </div>
) : product.status === 'pending' ? (
  <div className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
    {t('status.pending').toUpperCase()}
  </div>
) : (
  <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
    {t('status.rejected').toUpperCase()}
  </div>
)}
```

---

## 📝 Implementation Steps for HomeScreen.tsx

### **Step 1: Add imports and hook**

```tsx
import { useLanguage } from '../utils/LanguageContext';

// Inside component:
export default function HomeScreen({ session, onNavigate }: ...) {
  const { t } = useLanguage();
  // ... rest of component
}
```

### **Step 2: Replace hardcoded strings**

```tsx
// Search bar (Line ~177)
<input
  type="text"
  placeholder={t('home.searchPlaceholder')}
  ...
/>

// Upcoming Events (Line ~209)
<h2 className="text-xl font-bold text-gray-900 dark:text-white">
  {t('home.upcomingEvents')}
</h2>
<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
  {t('home.upcomingEventsSubtitle')}
</p>

// Active Campaigns (Line ~245)
<h2 className="text-xl font-bold text-gray-900 dark:text-white">
  {t('home.activeCampaigns')}
</h2>
<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
  {t('home.activeCampaignsSubtitle')}
</p>

// Campaign card (Line ~285)
<span className="text-xs text-gray-500 dark:text-gray-400">{t('home.collected')}</span>
<span className="text-xs text-gray-500 dark:text-gray-400">{t('home.target')}</span>

<motion.button ...>
  {t('home.donateNow')}
</motion.button>

// Latest Articles (Line ~408)
<h2 className="text-xl font-bold text-gray-900 dark:text-white">
  {t('home.latestArticles')}
</h2>
<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
  {t('home.latestArticlesSubtitle')}
</p>

<motion.button ...>
  {t('actions.seeAll')}
</motion.button>

// Community Timeline (Line ~480)
<h2 className="text-xl font-bold text-gray-900 dark:text-white">
  {t('home.communityTimeline')}
</h2>
<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
  {t('home.communitySubtitle')}
</p>

// Empty Timeline (Line ~493)
<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
  {t('home.noTimeline')}
</h3>
<p className="text-sm text-gray-500 dark:text-gray-400">
  {t('home.noTimelineMessage')}
</p>
```

---

## 📝 Implementation Steps for AdminDashboard.tsx

### **Step 1: Add imports and hook**

```tsx
import { useLanguage } from '../utils/LanguageContext';

// Inside component:
export default function AdminDashboard({ session, onNavigate }: ...) {
  const { t } = useLanguage();
  // ... rest of component
}
```

### **Step 2: Replace hardcoded strings**

```tsx
// Header (Line ~790)
<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
  {t('admin.title')}
</h1>
<p className="text-sm text-gray-500 dark:text-gray-400">
  {t('admin.subtitle')}
</p>

// Back button (Line ~801)
<ChevronLeft className="w-5 h-5" />
{t('admin.backToProfile')}

// Tab Buttons (Line ~823-865)
<TabButton
  active={activeTab === 'overview'}
  onClick={() => setActiveTab('overview')}
  icon={Activity}
  label={t('admin.overview')}
/>

<TabButton
  active={activeTab === 'users'}
  onClick={() => setActiveTab('users')}
  icon={Users}
  label={t('admin.users')}
/>

<TabButton
  active={activeTab === 'timeline'}
  onClick={() => setActiveTab('timeline')}
  icon={List}
  label={t('admin.timeline')}
/>

<TabButton
  active={activeTab === 'events'}
  onClick={() => setActiveTab('events')}
  icon={Calendar}
  label={t('admin.events')}
/>

<TabButton
  active={activeTab === 'marketplace'}
  onClick={() => setActiveTab('marketplace')}
  icon={ShoppingBag}
  label={t('admin.marketplace')}
/>

<TabButton
  active={activeTab === 'campaigns'}
  onClick={() => setActiveTab('campaigns')}
  icon={TrendingUp}
  label={t('admin.campaigns')}
/>

<TabButton
  active={activeTab === 'articles'}
  onClick={() => setActiveTab('articles')}
  icon={BookOpen}
  label={t('admin.articles')}
/>

<TabButton
  active={activeTab === 'moderation'}
  onClick={() => setActiveTab('moderation')}
  icon={ShieldAlert}
  label={t('admin.moderation')}
/>

<TabButton
  active={activeTab === 'reports'}
  onClick={() => setActiveTab('reports')}
  icon={Flag}
  label={t('admin.reports')}
/>

// Overview Stats (Line ~890-940)
<h3 className="text-sm font-medium">{t('admin.totalUsers')}</h3>
<h3 className="text-sm font-medium">{t('admin.activeUsers')}</h3>
<h3 className="text-sm font-medium">{t('admin.pendingUsers')}</h3>
<h3 className="text-sm font-medium">{t('admin.totalProducts')}</h3>
<h3 className="text-sm font-medium">{t('admin.activeCampaigns')}</h3>

// Users Tab (Line ~1010)
<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
  {t('admin.userManagement')}
</h2>
<p className="text-sm text-gray-600 dark:text-gray-400">
  {t('admin.userManagementSubtitle')}
</p>

<input
  type="text"
  placeholder={t('admin.searchUsers')}
  ...
/>

// Action Buttons
<motion.button ...>
  <CheckCircle className="w-4 h-4" />
  {t('actions.approve')}
</motion.button>

<motion.button ...>
  <XCircle className="w-4 h-4" />
  {t('actions.reject')}
</motion.button>

<motion.button ...>
  <Trash2 className="w-4 h-4" />
  {t('actions.delete')}
</motion.button>

<motion.button ...>
  <Edit className="w-4 h-4" />
  {t('actions.edit')}
</motion.button>

<motion.button ...>
  <Eye className="w-4 h-4" />
  {t('actions.view')}
</motion.button>

// Timeline Tab (Line ~1428)
<motion.button ...>
  <Plus className="w-6 h-6" />
  {t('admin.createTimelinePost')}
</motion.button>

// Status Badges
<span className={...}>
  {announcement.is_approved ? `🟢 ${t('status.approved')}` : `⏳ ${t('status.pending')}`}
</span>

// Articles Tab (Line ~1669)
<motion.button ...>
  <Plus className="w-6 h-6" />
  {t('admin.createArticle')}
</motion.button>

// Moderation Tab (Line ~1780)
<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
  🛡️ {t('admin.contentModeration')}
</h2>
<p className="text-sm text-gray-600 dark:text-gray-400">
  {t('admin.moderationSubtitle')}
</p>

<p className="text-sm opacity-90">{t('admin.totalItems')}</p>
<p className="text-sm opacity-90">{t('admin.needsReview')}</p>
<p className="text-sm opacity-90">{t('admin.actionsToday')}</p>

// Empty State
<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
  {t('admin.noItems')}
</h3>
<p className="text-sm text-gray-500 dark:text-gray-400">
  {t('admin.keepItClean')}
</p>

// Reports Tab (Line ~1900)
<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
  🚨 {t('admin.userReports')}
</h2>
<p className="text-sm text-gray-600 dark:text-gray-400">
  {t('admin.reportsSubtitle')}
</p>

<p className="text-sm opacity-90">{t('admin.openReports')}</p>
<p className="text-sm opacity-90">{t('admin.resolvedToday')}</p>
<p className="text-sm opacity-90">{t('admin.avgResponseTime')}</p>

// Report Actions
<motion.button ...>
  {t('admin.investigate')}
</motion.button>

<motion.button ...>
  {t('admin.dismiss')}
</motion.button>

<motion.button ...>
  {t('admin.takeDown')}
</motion.button>
```

### **Step 3: Update Toast Messages**

Replace all toast messages in handlers:

```tsx
// handleApproveUser
toast.success(t('admin.userApproved'));

// handleRejectUser
toast.error(t('admin.userRejected'));

// handleApproveTimeline
toast.success(t('admin.timelineApproved'));

// handleRejectTimeline
toast.success(t('admin.timelineRejected'));

// handleDeleteAnnouncement
toast.success(t('admin.timelineDeleted'));

// handleDeleteArticle
toast.success(t('admin.articleDeleted'));

// fetchAllData error
toast.error(t('admin.errorLoading'));
```

---

## 🚀 Final Integration Steps

### **1. Wrap App with LanguageProvider**

In your main `/App.tsx` or root component:

```tsx
import { LanguageProvider } from './utils/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      {/* Your existing app structure */}
      <ProfileScreen ... />
      <HomeScreen ... />
      <AdminDashboard ... />
    </LanguageProvider>
  );
}
```

### **2. Test Language Toggle**

1. Open ProfileScreen
2. Click hamburger menu (top right)
3. You should see "Bahasa" menu item with toggle
4. Clicking toggles between ID and EN
5. All text should update instantly
6. Refresh page - language persists (localStorage)

---

## 🎨 UI Design Notes

**Language Toggle Appearance:**
- **Icon:** `Languages` (lucide-react)
- **Gradient:** `from-indigo-500 to-purple-500`
- **Position:** Between Dark Mode and Prayer Times in settings menu
- **Toggle Shows:**
  - When ID active: Shows "English" (next language)
  - When EN active: Shows "Bahasa Indonesia" (next language)
- **Toggle Color:**
  - Active (EN): `bg-indigo-600`
  - Inactive (ID): `bg-gray-300`

---

## ✅ Verification Checklist

- [ ] Translation files created (`translations.ts`, `LanguageContext.tsx`)
- [ ] `useLanguage` hook added to ProfileScreen
- [ ] `useLanguage` hook added to HomeScreen
- [ ] `useLanguage` hook added to AdminDashboard
- [ ] Language toggle added to ProfileScreen settings menu
- [ ] All ProfileScreen text replaced with `t()` calls
- [ ] All HomeScreen text replaced with `t()` calls
- [ ] All AdminDashboard text replaced with `t()` calls
- [ ] App wrapped with `LanguageProvider`
- [ ] Language persists after page refresh
- [ ] No features broken (About page, Admin logic, Market tab all work)

---

## 📦 Complete File Structure

```
/src
  /utils
    ├── translations.ts          ✅ Created
    └── LanguageContext.tsx      ✅ Created
/components
  ├── ProfileScreen.tsx          ⚠️ Partially updated (hook added)
  ├── HomeScreen.tsx             ⏳ Needs update
  └── AdminDashboard.tsx         ⏳ Needs update
/App.tsx                         ⏳ Needs LanguageProvider wrap
```

---

## 🔄 Quick Implementation Command

**Search & Replace Patterns:**

For ProfileScreen.tsx:
- `"Selamat Datang"` → `{t('profile.welcome')}`
- `"Edit Profil"` → `{t('profile.editProfile')}`
- `"Pengaturan"` → `{t('settings.title')}`
- `"Mode Gelap"` → `{t('settings.darkMode')}`
- `"Waktu Sholat"` → `{t('settings.prayerTimes')}`
- `"Keluar"` → `{t('actions.logout')}`

For HomeScreen.tsx:
- `"Artikel Terbaru"` → `{t('home.latestArticles')}`
- `"Acara Mendatang"` → `{t('home.upcomingEvents')}`
- `"Kampanye Aktif"` → `{t('home.activeCampaigns')}`
- `"Donasi Sekarang"` → `{t('home.donateNow')}`

For AdminDashboard.tsx:
- `"Admin Dashboard"` → `{t('admin.title')}`
- `"Manajemen Pengguna"` → `{t('admin.userManagement')}`
- `"Moderasi Konten"` → `{t('admin.contentModeration')}`
- `"Laporan Pengguna"` → `{t('admin.userReports')}`

---

## 🎯 Expected Result

When implementation is complete:

1. **Default Language:** Indonesian (ID)
2. **Language Toggle:** Visible in ProfileScreen settings
3. **Instant Switch:** All UI text changes immediately
4. **Persistent:** Choice saved in localStorage
5. **Complete Coverage:** Nav, actions, placeholders, status messages all translated
6. **No Breakage:** All existing features (About, Admin, Market) work perfectly

---

**Status:** Translation infrastructure complete. Component updates needed as documented above.
