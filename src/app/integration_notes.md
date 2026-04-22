# 🔗 Integration Notes - jamaah.net

Panduan lengkap untuk integrasi frontend dengan Supabase backend.

---

## 📋 Table of Contents

1. [Supabase Project Setup](#supabase-project-setup)
2. [Environment Configuration](#environment-configuration)
3. [Authentication Setup](#authentication-setup)
4. [API Endpoints](#api-endpoints)
5. [Real-time Features](#real-time-features)
6. [File Upload/Storage](#file-uploadstorage)
7. [Edge Functions](#edge-functions)
8. [Testing Guide](#testing-guide)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Supabase Project Setup

### Step 1: Create Supabase Project

1. **Login ke Supabase**: https://supabase.com/dashboard
2. **Create New Project**:
   ```
   Project Name: jamaah-net
   Database Password: [SIMPAN PASSWORD INI!]
   Region: Southeast Asia (Singapore) - terdekat dengan Indonesia
   Pricing Plan: Free tier (untuk start)
   ```
3. **Wait for project to initialize** (~2 menit)

### Step 2: Get Project Credentials

Di Supabase Dashboard, pergi ke **Settings → API**:

```
Project URL: https://[project-id].supabase.co
Anon (public) key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (JANGAN SHARE!)
```

### Step 3: Setup Database

1. Pergi ke **SQL Editor**
2. Copy-paste SQL dari `database_setup.md`
3. Run semua SQL scripts
4. Verify tables created di **Table Editor**

---

## ⚙️ Environment Configuration

### Update `/utils/supabase/info.ts`

File ini sudah ada, update dengan credentials Supabase Anda:

```typescript
// /utils/supabase/info.ts
export const projectId = 'your-project-id'; // dari URL: https://[INI].supabase.co
export const anonKey = 'your-anon-key'; // dari Settings → API
export const supabaseUrl = `https://${projectId}.supabase.co`;
```

### Environment Variables (Optional)

Untuk production, gunakan `.env.local`:

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Dan update `/utils/supabase/info.ts`:

```typescript
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'fallback-url';
export const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'fallback-key';
export const projectId = supabaseUrl.split('//')[1].split('.')[0];
```

---

## 🔐 Authentication Setup

### Step 1: Enable Google OAuth

1. **Pergi ke**: Authentication → Providers → Google
2. **Enable** Google provider
3. **Setup OAuth Credentials**:

#### Get Google OAuth Credentials:

1. Pergi ke: https://console.cloud.google.com/
2. Create New Project: "jamaah-net"
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID**:
   ```
   Application type: Web application
   Name: Jamaah.net Auth
   
   Authorized JavaScript origins:
   - https://your-project-id.supabase.co
   - http://localhost:5173 (untuk development)
   
   Authorized redirect URIs:
   - https://your-project-id.supabase.co/auth/v1/callback
   ```
5. Copy **Client ID** dan **Client Secret**

#### Configure in Supabase:

1. Paste **Client ID** dan **Client Secret** di Supabase Dashboard
2. **Save**

### Step 2: Configure Redirect URLs

Di **Authentication → URL Configuration**:

```
Site URL: https://your-domain.com (atau http://localhost:5173 untuk dev)

Redirect URLs (satu per baris):
http://localhost:5173
http://localhost:5173/**
https://your-domain.com
https://your-domain.com/**
```

### Step 3: Email Templates (Optional)

Customize email templates di **Authentication → Email Templates**:

- **Confirm signup**: Email verifikasi
- **Magic Link**: Login tanpa password
- **Change Email**: Konfirmasi perubahan email
- **Reset Password**: Reset password

**Contoh Template (Bahasa Indonesia)**:

```html
<h2>Assalamu'alaikum {{ .Data.Name }},</h2>
<p>Selamat datang di <strong>Jamaah.net</strong>!</p>
<p>Akun Anda telah disetujui oleh admin. Berikut detail akun Anda:</p>
<ul>
  <li><strong>ID Member:</strong> {{ .Data.MemberId }}</li>
  <li><strong>Email:</strong> {{ .Email }}</li>
  <li><strong>Password:</strong> {{ .Data.TempPassword }}</li>
</ul>
<p>Silakan login dan ubah password Anda segera.</p>
<p><a href="{{ .SiteURL }}">Login Sekarang</a></p>
<p>Barakallahu fiikum,<br>Tim Jamaah.net</p>
```

---

## 📡 API Endpoints

### Current Implementation

App menggunakan **Supabase Edge Functions** dengan prefix:

```
Base URL: https://[project-id].supabase.co/functions/v1/make-server-4319e602
```

### Available Endpoints

#### 1. **Profile Management**

```typescript
// GET /api/profile
// Headers: { Authorization: `Bearer ${access_token}` }
// Returns: Profile data

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/profile`,
  {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  }
);
const profile = await response.json();
```

#### 2. **Timeline/Feed**

```typescript
// GET /api/timeline
// Headers: { Authorization: `Bearer ${access_token}` }
// Returns: Array of timeline posts

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/timeline`,
  {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  }
);
const posts = await response.json();
```

```typescript
// GET /api/timeline/user/:userId
// Get user-specific posts

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/timeline/user/${userId}`,
  {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  }
);
```

```typescript
// POST /api/timeline/create
// Body: { title, content, image, category, location, event_date }

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/timeline/create`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Kajian Ramadan',
      content: 'Kajian bulanan...',
      category: 'Kajian',
      image: 'https://...',
    }),
  }
);
```

#### 3. **Likes & Comments**

```typescript
// POST /api/timeline/like
// Body: { post_id }

await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/timeline/like`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ post_id: 'uuid-here' }),
  }
);
```

```typescript
// POST /api/timeline/comment
// Body: { post_id, content }

await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/timeline/comment`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      post_id: 'uuid-here',
      content: 'Great post!' 
    }),
  }
);
```

#### 4. **Bookmarks**

```typescript
// GET /api/timeline/bookmarks/list
const bookmarks = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/timeline/bookmarks/list`,
  {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  }
);
```

```typescript
// POST /api/timeline/bookmarks/toggle
// Body: { post_id }

await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-4319e602/api/timeline/bookmarks/toggle`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ post_id: 'uuid-here' }),
  }
);
```

---

## 🔄 Real-time Features

### Setup Real-time Subscriptions

Supabase mendukung real-time updates via WebSocket.

#### Example: Listen to new timeline posts

```typescript
import { getSupabaseClient } from './utils/supabase/client';

const supabase = getSupabaseClient();

// Subscribe to new posts
const subscription = supabase
  .channel('timeline-posts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'timeline_posts',
    },
    (payload) => {
      console.log('New post:', payload.new);
      // Update UI dengan post baru
    }
  )
  .subscribe();

// Cleanup
return () => {
  subscription.unsubscribe();
};
```

#### Example: Listen to new messages

```typescript
const subscription = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${userId}`,
    },
    (payload) => {
      console.log('New message:', payload.new);
      // Show notification
      // Update unread count
    }
  )
  .subscribe();
```

#### Example: Presence (Online Users)

```typescript
const channel = supabase.channel('online-users', {
  config: {
    presence: {
      key: userId,
    },
  },
});

// Track presence
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    console.log('Online users:', Object.keys(state));
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
      });
    }
  });
```

---

## 📤 File Upload/Storage

### Upload Avatar

```typescript
import { getSupabaseClient } from './utils/supabase/client';

const uploadAvatar = async (file: File, userId: string) => {
  const supabase = getSupabaseClient();
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;
  
  // Upload file
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    console.error('Upload error:', error);
    throw error;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);
  
  return publicUrl;
};
```

### Upload Timeline Image

```typescript
const uploadTimelineImage = async (file: File, userId: string) => {
  const supabase = getSupabaseClient();
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('timeline-images')
    .upload(filePath, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('timeline-images')
    .getPublicUrl(filePath);
  
  return publicUrl;
};
```

### Delete File

```typescript
const deleteImage = async (fileUrl: string, bucket: string) => {
  const supabase = getSupabaseClient();
  
  // Extract file path from URL
  const urlParts = fileUrl.split(`/storage/v1/object/public/${bucket}/`);
  const filePath = urlParts[1];
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);
  
  if (error) throw error;
};
```

---

## ⚡ Edge Functions

Edge Functions adalah serverless functions yang run di edge (dekat user).

### Create Edge Function

#### 1. Install Supabase CLI

```bash
npm install -g supabase
```

#### 2. Login

```bash
supabase login
```

#### 3. Link Project

```bash
supabase link --project-ref your-project-id
```

#### 4. Create Function

```bash
supabase functions new make-server-4319e602
```

#### 5. Write Function Code

File: `supabase/functions/make-server-4319e602/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname;

    // Route: GET /api/profile
    if (path === '/api/profile' && req.method === 'GET') {
      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(profile),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /api/timeline
    if (path === '/api/timeline' && req.method === 'GET') {
      const { data: posts, error } = await supabaseClient
        .from('timeline_posts')
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url,
            member_id
          ),
          likes (
            user_id
          ),
          comments (
            id,
            content,
            created_at,
            profiles:user_id (
              name,
              avatar_url
            )
          )
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return new Response(
        JSON.stringify(posts),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: POST /api/timeline/create
    if (path === '/api/timeline/create' && req.method === 'POST') {
      const body = await req.json();
      
      const { data: post, error } = await supabaseClient
        .from('timeline_posts')
        .insert({
          user_id: user.id,
          title: body.title,
          content: body.content,
          image: body.image,
          category: body.category,
          location: body.location,
          event_date: body.event_date,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(post),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: POST /api/timeline/like
    if (path === '/api/timeline/like' && req.method === 'POST') {
      const body = await req.json();
      
      // Check if already liked
      const { data: existing } = await supabaseClient
        .from('likes')
        .select('id')
        .eq('post_id', body.post_id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Unlike
        const { error } = await supabaseClient
          .from('likes')
          .delete()
          .eq('post_id', body.post_id)
          .eq('user_id', user.id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ liked: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Like
        const { error } = await supabaseClient
          .from('likes')
          .insert({
            post_id: body.post_id,
            user_id: user.id,
          });

        if (error) throw error;

        return new Response(
          JSON.stringify({ liked: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

#### 6. Deploy Function

```bash
supabase functions deploy make-server-4319e602
```

---

## 🧪 Testing Guide

### 1. Test Authentication

```typescript
// Test Google OAuth login
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'http://localhost:5173',
  },
});
```

### 2. Test Database Queries

```typescript
// Test profile fetch
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

console.log('Profile:', profile);
```

### 3. Test File Upload

```typescript
// Test avatar upload
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const publicUrl = await uploadAvatar(file, userId);
console.log('Uploaded to:', publicUrl);
```

### 4. Test Real-time

```typescript
// Test real-time subscription
const channel = supabase
  .channel('test')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline_posts' }, (payload) => {
    console.log('Change detected:', payload);
  })
  .subscribe();
```

---

## 🚀 Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
2. **Import to Vercel**: https://vercel.com/new
3. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. **Deploy!**

### Option 2: Netlify

1. **Push to GitHub**
2. **Import to Netlify**: https://app.netlify.com/start
3. **Environment Variables**: Same as Vercel
4. **Build settings**:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

### Update Supabase Redirect URLs

Setelah deploy, tambahkan production URL ke **Authentication → URL Configuration**:

```
https://your-app.vercel.app
https://your-app.vercel.app/**
```

---

## 🔧 Troubleshooting

### Problem: "Invalid API key"

**Solution**: 
- Check `projectId` dan `anonKey` di `/utils/supabase/info.ts`
- Pastikan keys dari **Settings → API** di Supabase Dashboard

### Problem: "Row Level Security policy violation"

**Solution**:
- Check RLS policies di `database_setup.md`
- Pastikan user authenticated: `auth.uid()` harus return user ID
- Test dengan disable RLS temporarily untuk debug:
  ```sql
  ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
  ```

### Problem: "CORS error"

**Solution**:
- Tambahkan domain ke **Authorized redirect URIs** di Google Console
- Tambahkan domain ke **Site URL** di Supabase Authentication settings

### Problem: File upload error

**Solution**:
- Check storage bucket exists dan public
- Check RLS policies untuk storage bucket
- Verify file size < limit

### Problem: Edge function timeout

**Solution**:
- Optimize database queries (add indexes)
- Use `.select()` dengan specific columns, hindari `select('*')`
- Cache data di client side
- Use pagination untuk large datasets

---

## 📚 Additional Resources

### Documentation Links

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Supabase Storage**: https://supabase.com/docs/guides/storage
- **Edge Functions**: https://supabase.com/docs/guides/functions
- **Real-time**: https://supabase.com/docs/guides/realtime

### Community

- **Discord**: https://discord.supabase.com
- **GitHub**: https://github.com/supabase/supabase
- **Stack Overflow**: Tag `supabase`

---

## 🎯 Next Steps Checklist

- [ ] Setup Supabase project
- [ ] Update `/utils/supabase/info.ts` dengan credentials
- [ ] Run database setup SQL scripts
- [ ] Enable Google OAuth
- [ ] Create storage buckets
- [ ] Deploy edge functions
- [ ] Test authentication flow
- [ ] Test database queries
- [ ] Test file uploads
- [ ] Setup real-time subscriptions
- [ ] Deploy to production
- [ ] Update redirect URLs

---

## 💡 Pro Tips

### 1. Use React Query untuk data fetching

```typescript
import { useQuery } from '@tanstack/react-query';

const { data: posts, isLoading } = useQuery({
  queryKey: ['timeline'],
  queryFn: async () => {
    const response = await fetch(/* API endpoint */);
    return response.json();
  },
});
```

### 2. Implement optimistic updates

```typescript
// Immediately update UI, then sync with server
setLiked(true); // Optimistic
await likePost(postId); // Actual API call
```

### 3. Cache user profile

```typescript
// Store in localStorage/sessionStorage
localStorage.setItem('profile', JSON.stringify(profile));
```

### 4. Use Supabase CLI untuk local development

```bash
supabase start # Run local Supabase
supabase db reset # Reset database
supabase db push # Push migrations
```

### 5. Monitor performance

- Use Supabase **Reports** untuk monitor API usage
- Check **Logs** untuk errors
- Setup **Alerts** untuk critical issues

---

**🕌 Barakallahu fiikum!**

Integration guide lengkap untuk jamaah.net! Selamat coding! 🚀✨

---

## 📞 Support

Jika ada pertanyaan atau butuh bantuan, dokumentasi ini akan terus diupdate. 

**Semoga bermanfaat!** 🤲
