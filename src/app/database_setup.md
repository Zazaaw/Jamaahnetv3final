# 📊 Database Setup Guide - jamaah.net

Panduan lengkap untuk setup database Supabase untuk platform jamaah.net.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Tables Structure](#tables-structure)
4. [SQL Setup Scripts](#sql-setup-scripts)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Storage Buckets](#storage-buckets)
7. [Indexes & Performance](#indexes--performance)
8. [Seed Data](#seed-data)

---

## 🎯 Overview

Database jamaah.net menggunakan **PostgreSQL** melalui **Supabase** dengan fitur:

- ✅ Authentication & Authorization
- ✅ Row Level Security (RLS)
- ✅ Real-time Subscriptions
- ✅ Storage untuk media files
- ✅ Edge Functions untuk backend logic
- ✅ Auto-generated Member ID

**Total Tables**: 14 tabel utama

---

## 🗂️ Database Schema

### Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   users     │────────►│   profiles   │◄────────│ connections │
│  (auth)     │         │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               ├──────────┬──────────┬──────────┐
                               ▼          ▼          ▼          ▼
                        ┌──────────┐ ┌────────┐ ┌──────┐ ┌──────────┐
                        │ timeline │ │messages│ │wallet│ │donations │
                        │  _posts  │ │        │ │      │ │_campaigns│
                        └──────────┘ └────────┘ └──────┘ └──────────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
              ┌─────────┐ ┌─────────┐ ┌──────────┐
              │ likes   │ │comments │ │bookmarks │
              └─────────┘ └─────────┘ └──────────┘

┌────────────┐         ┌────────────┐
│ products   │◄────────│  reviews   │
│(marketplace)│        │            │
└────────────┘         └────────────┘

┌─────────────────┐    ┌──────────────┐
│ invitation_codes│    │notifications │
└─────────────────┘    └──────────────┘
```

---

## 📊 Tables Structure

### 1. **profiles** - User Profiles
```sql
Menyimpan data profil lengkap setiap user.

Columns:
  • id (UUID) - Primary Key, references auth.users
  • email (TEXT) - Email user
  • name (TEXT) - Nama lengkap
  • member_id (TEXT) - ID Member format JMH-XXXXXX (UNIQUE)
  • role (TEXT) - Role: 'Member', 'Admin', 'Guest'
  • status (TEXT) - 'pending', 'active', 'suspended'
  • avatar_url (TEXT) - URL foto profil
  • bio (TEXT) - Bio singkat
  • mosque (TEXT) - Nama masjid/jamaah
  • phone (TEXT) - Nomor telepon
  • wallet_balance (DECIMAL) - Saldo dompet digital
  • member_since (TIMESTAMPTZ) - Tanggal bergabung
  • created_at (TIMESTAMPTZ)
  • updated_at (TIMESTAMPTZ)

Indexes:
  • member_id (UNIQUE)
  • email (UNIQUE)
  • status
```

### 2. **invitation_codes** - Kode Undangan
```sql
Menyimpan kode undangan untuk registrasi.

Columns:
  • id (UUID) - Primary Key
  • code (TEXT) - Kode undangan (UNIQUE)
  • created_by (UUID) - Foreign Key → profiles.id
  • max_uses (INT) - Maksimal penggunaan (default: 1)
  • used_count (INT) - Jumlah sudah terpakai (default: 0)
  • is_active (BOOLEAN) - Status aktif (default: true)
  • expires_at (TIMESTAMPTZ) - Tanggal kadaluarsa
  • created_at (TIMESTAMPTZ)

Indexes:
  • code (UNIQUE)
  • is_active
  • created_by
```

### 3. **timeline_posts** - Timeline Kegiatan Jamaah
```sql
Menyimpan postingan timeline/feed kegiatan.

Columns:
  • id (UUID) - Primary Key
  • user_id (UUID) - Foreign Key → profiles.id
  • title (TEXT) - Judul kegiatan
  • content (TEXT) - Deskripsi lengkap
  • image (TEXT) - URL gambar/foto
  • category (TEXT) - 'Kajian', 'Sosial', 'Ibadah', dll
  • location (TEXT) - Lokasi kegiatan
  • event_date (TIMESTAMPTZ) - Tanggal kegiatan
  • visibility (TEXT) - 'public', 'connections_only', 'private'
  • likes_count (INT) - Cache counter untuk likes
  • comments_count (INT) - Cache counter untuk comments
  • created_at (TIMESTAMPTZ)
  • updated_at (TIMESTAMPTZ)

Indexes:
  • user_id
  • category
  • visibility
  • created_at (DESC) - untuk sorting terbaru
```

### 4. **likes** - Likes pada Timeline
```sql
Menyimpan data likes/suka pada postingan.

Columns:
  • id (UUID) - Primary Key
  • post_id (UUID) - Foreign Key → timeline_posts.id
  • user_id (UUID) - Foreign Key → profiles.id
  • created_at (TIMESTAMPTZ)

Unique Constraint:
  • (post_id, user_id) - User hanya bisa like 1x per post

Indexes:
  • post_id
  • user_id
```

### 5. **comments** - Komentar pada Timeline
```sql
Menyimpan komentar pada postingan timeline.

Columns:
  • id (UUID) - Primary Key
  • post_id (UUID) - Foreign Key → timeline_posts.id
  • user_id (UUID) - Foreign Key → profiles.id
  • content (TEXT) - Isi komentar
  • parent_id (UUID) - Foreign Key → comments.id (untuk reply)
  • created_at (TIMESTAMPTZ)
  • updated_at (TIMESTAMPTZ)

Indexes:
  • post_id
  • user_id
  • parent_id
```

### 6. **bookmarks** - Postingan Tersimpan
```sql
Menyimpan postingan yang di-bookmark user.

Columns:
  • id (UUID) - Primary Key
  • post_id (UUID) - Foreign Key → timeline_posts.id
  • user_id (UUID) - Foreign Key → profiles.id
  • created_at (TIMESTAMPTZ)

Unique Constraint:
  • (post_id, user_id) - User hanya bisa bookmark 1x per post

Indexes:
  • post_id
  • user_id
```

### 7. **connections** - Koneksi/Follow System
```sql
Menyimpan relasi following/follower antar user.

Columns:
  • id (UUID) - Primary Key
  • follower_id (UUID) - Foreign Key → profiles.id (yang follow)
  • following_id (UUID) - Foreign Key → profiles.id (yang di-follow)
  • status (TEXT) - 'pending', 'accepted', 'blocked'
  • created_at (TIMESTAMPTZ)

Unique Constraint:
  • (follower_id, following_id)

Indexes:
  • follower_id
  • following_id
  • status
```

### 8. **messages** - Chat/Pesan
```sql
Menyimpan pesan chat antar user.

Columns:
  • id (UUID) - Primary Key
  • sender_id (UUID) - Foreign Key → profiles.id
  • receiver_id (UUID) - Foreign Key → profiles.id
  • content (TEXT) - Isi pesan
  • is_read (BOOLEAN) - Status sudah dibaca (default: false)
  • read_at (TIMESTAMPTZ) - Waktu dibaca
  • created_at (TIMESTAMPTZ)

Indexes:
  • sender_id
  • receiver_id
  • is_read
  • created_at (DESC)
```

### 9. **products** - Marketplace Products
```sql
Menyimpan produk marketplace halal.

Columns:
  • id (UUID) - Primary Key
  • seller_id (UUID) - Foreign Key → profiles.id
  • name (TEXT) - Nama produk
  • description (TEXT) - Deskripsi produk
  • price (DECIMAL) - Harga
  • category (TEXT) - 'Fashion', 'Kuliner', 'Buku', dll
  • image (TEXT) - URL gambar produk
  • stock (INT) - Stok tersedia
  • is_active (BOOLEAN) - Status aktif (default: true)
  • rating_average (DECIMAL) - Rating rata-rata
  • reviews_count (INT) - Jumlah review
  • created_at (TIMESTAMPTZ)
  • updated_at (TIMESTAMPTZ)

Indexes:
  • seller_id
  • category
  • is_active
  • rating_average (DESC)
```

### 10. **reviews** - Product Reviews
```sql
Menyimpan review/rating produk.

Columns:
  • id (UUID) - Primary Key
  • product_id (UUID) - Foreign Key → products.id
  • user_id (UUID) - Foreign Key → profiles.id
  • rating (INT) - Rating 1-5
  • comment (TEXT) - Komentar review
  • created_at (TIMESTAMPTZ)

Unique Constraint:
  • (product_id, user_id) - User hanya bisa review 1x per produk

Indexes:
  • product_id
  • user_id
  • rating
```

### 11. **donation_campaigns** - Kampanye Donasi
```sql
Menyimpan kampanye donasi/fundraising.

Columns:
  • id (UUID) - Primary Key
  • creator_id (UUID) - Foreign Key → profiles.id
  • title (TEXT) - Judul kampanye
  • description (TEXT) - Deskripsi lengkap
  • image (TEXT) - URL gambar kampanye
  • target_amount (DECIMAL) - Target donasi
  • collected_amount (DECIMAL) - Terkumpul (default: 0)
  • category (TEXT) - 'Masjid', 'Pendidikan', 'Kesehatan', dll
  • status (TEXT) - 'active', 'completed', 'closed'
  • end_date (TIMESTAMPTZ) - Tanggal berakhir
  • created_at (TIMESTAMPTZ)
  • updated_at (TIMESTAMPTZ)

Indexes:
  • creator_id
  • category
  • status
  • end_date
```

### 12. **donations** - Riwayat Donasi
```sql
Menyimpan transaksi donasi user.

Columns:
  • id (UUID) - Primary Key
  • campaign_id (UUID) - Foreign Key → donation_campaigns.id
  • donor_id (UUID) - Foreign Key → profiles.id
  • amount (DECIMAL) - Jumlah donasi
  • is_anonymous (BOOLEAN) - Donasi anonim (default: false)
  • payment_method (TEXT) - 'wallet', 'transfer', dll
  • status (TEXT) - 'pending', 'success', 'failed'
  • created_at (TIMESTAMPTZ)

Indexes:
  • campaign_id
  • donor_id
  • status
  • created_at (DESC)
```

### 13. **wallet_transactions** - Transaksi Dompet
```sql
Menyimpan histori transaksi wallet.

Columns:
  • id (UUID) - Primary Key
  • user_id (UUID) - Foreign Key → profiles.id
  • type (TEXT) - 'deposit', 'withdrawal', 'payment', 'refund'
  • amount (DECIMAL) - Jumlah transaksi
  • balance_before (DECIMAL) - Saldo sebelum
  • balance_after (DECIMAL) - Saldo sesudah
  • description (TEXT) - Deskripsi transaksi
  • reference_id (UUID) - ID referensi (donation, product, dll)
  • status (TEXT) - 'pending', 'success', 'failed'
  • created_at (TIMESTAMPTZ)

Indexes:
  • user_id
  • type
  • status
  • created_at (DESC)
```

### 14. **notifications** - Notifikasi
```sql
Menyimpan notifikasi user.

Columns:
  • id (UUID) - Primary Key
  • user_id (UUID) - Foreign Key → profiles.id
  • type (TEXT) - 'approval', 'message', 'like', 'comment', dll
  • title (TEXT) - Judul notifikasi
  • message (TEXT) - Isi notifikasi
  • data (JSONB) - Data tambahan (flexible)
  • is_read (BOOLEAN) - Status sudah dibaca (default: false)
  • action_url (TEXT) - URL untuk redirect
  • created_at (TIMESTAMPTZ)

Indexes:
  • user_id
  • is_read
  • type
  • created_at (DESC)
```

### 15. **prayer_times_settings** - Pengaturan Waktu Sholat
```sql
Menyimpan preferensi waktu sholat per user.

Columns:
  • id (UUID) - Primary Key
  • user_id (UUID) - Foreign Key → profiles.id (UNIQUE)
  • city (TEXT) - Nama kota
  • latitude (DECIMAL) - Koordinat latitude
  • longitude (DECIMAL) - Koordinat longitude
  • calculation_method (TEXT) - Metode perhitungan
  • enable_notifications (BOOLEAN) - Aktifkan notifikasi
  • notification_times (TEXT[]) - Waktu sholat untuk notif
  • created_at (TIMESTAMPTZ)
  • updated_at (TIMESTAMPTZ)

Indexes:
  • user_id (UNIQUE)
```

---

## 🔧 SQL Setup Scripts

### Step 1: Create Tables

Copy-paste SQL berikut ke **Supabase SQL Editor**:

```sql
-- ============================================
-- JAMAAH.NET DATABASE SETUP
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  member_id TEXT UNIQUE,
  role TEXT DEFAULT 'Member' CHECK (role IN ('Admin', 'Member', 'Guest')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  avatar_url TEXT,
  bio TEXT,
  mosque TEXT,
  phone TEXT,
  wallet_balance DECIMAL(15, 2) DEFAULT 0,
  member_since TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to generate Member ID
CREATE OR REPLACE FUNCTION generate_member_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 6-digit number
    new_id := 'JMH-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE member_id = new_id) INTO id_exists;
    
    -- Exit loop if ID is unique
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate member_id on insert
CREATE OR REPLACE FUNCTION set_member_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_id IS NULL THEN
    NEW.member_id := generate_member_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_profile
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_member_id();

-- ============================================
-- 2. INVITATION CODES TABLE
-- ============================================
CREATE TABLE invitation_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  max_uses INT DEFAULT 1,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TIMELINE POSTS TABLE
-- ============================================
CREATE TABLE timeline_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  image TEXT,
  category TEXT,
  location TEXT,
  event_date TIMESTAMPTZ,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections_only', 'private')),
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. LIKES TABLE
-- ============================================
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES timeline_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Function to increment likes_count
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE timeline_posts 
  SET likes_count = likes_count + 1 
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_like
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION increment_likes_count();

-- Function to decrement likes_count
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE timeline_posts 
  SET likes_count = likes_count - 1 
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_delete_like
AFTER DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION decrement_likes_count();

-- ============================================
-- 5. COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES timeline_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to increment comments_count
CREATE OR REPLACE FUNCTION increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE timeline_posts 
  SET comments_count = comments_count + 1 
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_comment
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION increment_comments_count();

-- Function to decrement comments_count
CREATE OR REPLACE FUNCTION decrement_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE timeline_posts 
  SET comments_count = comments_count - 1 
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_delete_comment
AFTER DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION decrement_comments_count();

-- ============================================
-- 6. BOOKMARKS TABLE
-- ============================================
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES timeline_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ============================================
-- 7. CONNECTIONS TABLE
-- ============================================
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ============================================
-- 8. MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (sender_id != receiver_id)
);

-- ============================================
-- 9. PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(15, 2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  stock INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  rating_average DECIMAL(3, 2) DEFAULT 0,
  reviews_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Function to update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET 
    rating_average = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id),
    reviews_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_review
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- ============================================
-- 11. DONATION CAMPAIGNS TABLE
-- ============================================
CREATE TABLE donation_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  target_amount DECIMAL(15, 2) NOT NULL,
  collected_amount DECIMAL(15, 2) DEFAULT 0,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'closed')),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. DONATIONS TABLE
-- ============================================
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES donation_campaigns(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  payment_method TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update campaign collected amount
CREATE OR REPLACE FUNCTION update_campaign_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'success' THEN
    UPDATE donation_campaigns 
    SET collected_amount = collected_amount + NEW.amount
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_donation_success
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
WHEN (NEW.status = 'success')
EXECUTE FUNCTION update_campaign_amount();

-- ============================================
-- 13. WALLET TRANSACTIONS TABLE
-- ============================================
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund')),
  amount DECIMAL(15, 2) NOT NULL,
  balance_before DECIMAL(15, 2) NOT NULL,
  balance_after DECIMAL(15, 2) NOT NULL,
  description TEXT,
  reference_id UUID,
  status TEXT DEFAULT 'success' CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 14. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 15. PRAYER TIMES SETTINGS TABLE
-- ============================================
CREATE TABLE prayer_times_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  calculation_method TEXT DEFAULT 'MWL',
  enable_notifications BOOLEAN DEFAULT true,
  notification_times TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_member_id ON profiles(member_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_status ON profiles(status);

-- Invitation codes indexes
CREATE INDEX idx_invitation_codes_code ON invitation_codes(code);
CREATE INDEX idx_invitation_codes_active ON invitation_codes(is_active);

-- Timeline posts indexes
CREATE INDEX idx_timeline_posts_user_id ON timeline_posts(user_id);
CREATE INDEX idx_timeline_posts_category ON timeline_posts(category);
CREATE INDEX idx_timeline_posts_created_at ON timeline_posts(created_at DESC);

-- Likes indexes
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- Comments indexes
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Bookmarks indexes
CREATE INDEX idx_bookmarks_post_id ON bookmarks(post_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- Connections indexes
CREATE INDEX idx_connections_follower_id ON connections(follower_id);
CREATE INDEX idx_connections_following_id ON connections(following_id);

-- Messages indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Products indexes
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Reviews indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Donation campaigns indexes
CREATE INDEX idx_donation_campaigns_creator_id ON donation_campaigns(creator_id);
CREATE INDEX idx_donation_campaigns_status ON donation_campaigns(status);

-- Donations indexes
CREATE INDEX idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);

-- Wallet transactions indexes
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

## 🔒 Row Level Security (RLS)

Copy-paste SQL berikut untuk setup RLS policies:

```sql
-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_times_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Anyone can view active profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (status = 'active');

-- Users can view their own profile (any status)
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- TIMELINE POSTS POLICIES
-- ============================================

-- Public posts viewable by everyone
CREATE POLICY "Public posts are viewable"
ON timeline_posts FOR SELECT
USING (visibility = 'public');

-- Users can view own posts
CREATE POLICY "Users can view own posts"
ON timeline_posts FOR SELECT
USING (auth.uid() = user_id);

-- Users can create posts
CREATE POLICY "Users can create posts"
ON timeline_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own posts
CREATE POLICY "Users can update own posts"
ON timeline_posts FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete own posts
CREATE POLICY "Users can delete own posts"
ON timeline_posts FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- LIKES POLICIES
-- ============================================

-- Anyone can view likes
CREATE POLICY "Likes are viewable by everyone"
ON likes FOR SELECT
USING (true);

-- Users can create likes
CREATE POLICY "Users can create likes"
ON likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete own likes
CREATE POLICY "Users can delete own likes"
ON likes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS POLICIES
-- ============================================

-- Anyone can view comments
CREATE POLICY "Comments are viewable by everyone"
ON comments FOR SELECT
USING (true);

-- Users can create comments
CREATE POLICY "Users can create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own comments
CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete own comments
CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- BOOKMARKS POLICIES
-- ============================================

-- Users can view own bookmarks
CREATE POLICY "Users can view own bookmarks"
ON bookmarks FOR SELECT
USING (auth.uid() = user_id);

-- Users can create bookmarks
CREATE POLICY "Users can create bookmarks"
ON bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete own bookmarks
CREATE POLICY "Users can delete own bookmarks"
ON bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages"
ON messages FOR UPDATE
USING (auth.uid() = receiver_id);

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

-- Active products viewable by everyone
CREATE POLICY "Active products are viewable"
ON products FOR SELECT
USING (is_active = true);

-- Sellers can view own products
CREATE POLICY "Sellers can view own products"
ON products FOR SELECT
USING (auth.uid() = seller_id);

-- Sellers can create products
CREATE POLICY "Sellers can create products"
ON products FOR INSERT
WITH CHECK (auth.uid() = seller_id);

-- Sellers can update own products
CREATE POLICY "Sellers can update own products"
ON products FOR UPDATE
USING (auth.uid() = seller_id);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can view own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- WALLET TRANSACTIONS POLICIES
-- ============================================

-- Users can view own transactions
CREATE POLICY "Users can view own transactions"
ON wallet_transactions FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- PRAYER TIMES SETTINGS POLICIES
-- ============================================

-- Users can view own settings
CREATE POLICY "Users can view own prayer settings"
ON prayer_times_settings FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert own settings
CREATE POLICY "Users can insert own prayer settings"
ON prayer_times_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own settings
CREATE POLICY "Users can update own prayer settings"
ON prayer_times_settings FOR UPDATE
USING (auth.uid() = user_id);
```

---

## 🗂️ Storage Buckets

Create storage buckets di **Supabase Storage**:

### 1. **avatars** - Profile Pictures
```
Bucket: avatars
Public: Yes
File size limit: 5MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

### 2. **timeline-images** - Timeline Post Images
```
Bucket: timeline-images
Public: Yes
File size limit: 10MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

### 3. **product-images** - Marketplace Product Images
```
Bucket: product-images
Public: Yes
File size limit: 5MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

### 4. **donation-images** - Campaign Images
```
Bucket: donation-images
Public: Yes
File size limit: 10MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

### Storage Policies (RLS)

```sql
-- Avatars - Anyone can read, users can upload their own
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Timeline images - Anyone can read, authenticated users can upload
CREATE POLICY "Timeline images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'timeline-images');

CREATE POLICY "Authenticated users can upload timeline images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'timeline-images' AND auth.role() = 'authenticated');

-- Similar policies for other buckets...
```

---

## 📈 Seed Data (Optional)

Data awal untuk testing:

```sql
-- Insert admin invitation code
INSERT INTO invitation_codes (code, max_uses, is_active)
VALUES ('ADMIN-2024', 999, true);

-- Insert sample categories
-- (Categories can be stored in separate table or used as ENUM)

-- Insert sample donation campaigns
-- (Will be inserted via app after admin approval)
```

---

## ✅ Verification Checklist

Setelah setup, pastikan:

- [ ] Semua 15 tabel sudah dibuat
- [ ] Indexes sudah terpasang
- [ ] RLS policies aktif di semua tabel
- [ ] Storage buckets sudah dibuat
- [ ] Triggers untuk auto-increment counters berfungsi
- [ ] Function generate_member_id() berfungsi
- [ ] Foreign keys terpasang dengan benar

---

## 🔍 Testing Queries

Test database dengan queries berikut:

```sql
-- Test member_id generation
INSERT INTO profiles (id, email, name) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'test@test.com', 'Test User');

SELECT member_id FROM profiles WHERE email = 'test@test.com';
-- Expected: JMH-XXXXXX

-- Test RLS policies
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '550e8400-e29b-41d4-a716-446655440000';

SELECT * FROM profiles WHERE id = '550e8400-e29b-41d4-a716-446655440000';
-- Should return the profile

-- Test triggers
INSERT INTO timeline_posts (user_id, title, content)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Test Post', 'Content');

SELECT id FROM timeline_posts WHERE title = 'Test Post';

INSERT INTO likes (post_id, user_id)
VALUES ('<post_id_from_above>', '550e8400-e29b-41d4-a716-446655440000');

SELECT likes_count FROM timeline_posts WHERE title = 'Test Post';
-- Expected: 1
```

---

## 📚 Next Steps

Setelah database setup selesai:

1. **Lihat `integration_notes.md`** untuk setup frontend integration
2. Setup **Edge Functions** untuk backend logic
3. Configure **Authentication** providers
4. Setup **Real-time subscriptions**
5. Deploy & test

---

**🕌 Barakallahu fiikum!**

Database jamaah.net siap digunakan! 🚀
