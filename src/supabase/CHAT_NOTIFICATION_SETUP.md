# Chat Notification Setup Guide

This guide will help you set up automated chat notifications using Supabase Edge Functions and Firebase Cloud Messaging.

## 📋 Prerequisites

1. Supabase project with CLI installed
2. Firebase project with Cloud Messaging enabled
3. Firebase Server Key (Legacy) from Firebase Console

## 🚀 Step 1: Deploy the Edge Function

### 1.1 Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 1.2 Login to Supabase

```bash
supabase login
```

### 1.3 Link your project

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### 1.4 Set Environment Variables

Create or update `.env` file in your Supabase project:

```bash
# Get these from Supabase Dashboard > Settings > API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Get this from Firebase Console > Project Settings > Cloud Messaging > Server Key
FIREBASE_SERVER_KEY=your-firebase-server-key
```

### 1.5 Set secrets in Supabase

```bash
supabase secrets set FIREBASE_SERVER_KEY=your-firebase-server-key
```

### 1.6 Deploy the function

```bash
supabase functions deploy send-chat-notification
```

## 🔧 Step 2: Create Database Webhook

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → **Database** → **Webhooks**
2. Click **Create a new hook**
3. Configure the webhook:
   - **Name**: `send-chat-notification`
   - **Table**: `messages`
   - **Events**: Check `Insert`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-chat-notification`
   - **Headers**:
     - `Content-Type`: `application/json`
     - `Authorization`: `Bearer YOUR_ANON_KEY`
4. Click **Create webhook**

### Option B: Using SQL (Advanced)

Run this SQL in your Supabase SQL Editor:

```sql
-- Create a function that calls the edge function
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS trigger AS $$
DECLARE
  webhook_url text;
  service_role_key text;
BEGIN
  -- Set your webhook URL (replace with your project ref)
  webhook_url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-chat-notification';
  
  -- Make HTTP request to edge function
  PERFORM
    net.http_post(
      url := webhook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', row_to_json(NEW),
        'old_record', NULL
      )
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on messages table
DROP TRIGGER IF EXISTS on_message_inserted ON messages;

CREATE TRIGGER on_message_inserted
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();
```

**Important**: Replace `YOUR_PROJECT_REF` with your actual Supabase project reference.

## 📱 Step 3: Update Firebase Configuration

### 3.1 Get Firebase Server Key

1. Go to **Firebase Console** → **Project Settings** → **Cloud Messaging**
2. Under **Cloud Messaging API (Legacy)**, copy the **Server key**
3. Add it as a Supabase secret (see Step 1.5)

### 3.2 Verify Service Worker

Ensure `/public/firebase-messaging-sw.js` is properly configured:

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBqmZ6G_7SoMJUhQFd6LeBLUEnhl-zHCPc",
  authDomain: "jamaahnet.firebaseapp.com",
  projectId: "jamaahnet",
  storageBucket: "jamaahnet.firebasestorage.app",
  messagingSenderId: "518685266898",
  appId: "1:518685266898:web:6c55f0b4e33fb1eb6a6e0b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const chatId = event.notification.data?.chatId;
  if (chatId) {
    event.waitUntil(
      clients.openWindow(`/chat/${chatId}`)
    );
  }
});
```

## 🧪 Step 4: Test the Notification System

### 4.1 Manual Test via SQL

Insert a test message:

```sql
INSERT INTO messages (chat_id, sender_id, recipient_id, content)
VALUES (
  'test-chat-id',
  'sender-user-id',
  'recipient-user-id',
  'Test notification message'
);
```

### 4.2 Check Edge Function Logs

```bash
supabase functions logs send-chat-notification --tail
```

### 4.3 Verify in Firebase Console

Go to **Firebase Console** → **Cloud Messaging** → check the statistics for sent messages.

## 🔍 Troubleshooting

### Issue: Notifications not being sent

**Solution**:
1. Check edge function logs: `supabase functions logs send-chat-notification`
2. Verify webhook is active in Supabase Dashboard → Database → Webhooks
3. Check recipient has a valid `push_token` in the `profiles` table
4. Verify Firebase Server Key is correct

### Issue: Push token not saved

**Solution**:
1. Check browser console for permission errors
2. Verify service worker is registered properly
3. Check VAPID key matches in both `/utils/firebase.ts` and service worker

### Issue: Webhook not triggering

**Solution**:
1. Check webhook configuration in Supabase Dashboard
2. Verify the webhook URL is correct
3. Check database trigger exists: `\df notify_new_message` in SQL editor
4. Ensure `pg_net` extension is enabled (for SQL trigger approach)

## 📊 Monitoring

### View Function Logs

```bash
supabase functions logs send-chat-notification --tail
```

### Check Webhook History

Go to **Supabase Dashboard** → **Database** → **Webhooks** → Select webhook → **View logs**

## 🎯 Expected Behavior

When a message is sent:

1. **INSERT** event triggered on `messages` table
2. Database webhook calls edge function
3. Edge function fetches sender name and recipient push token
4. FCM notification sent to recipient's device
5. Recipient sees notification with:
   - **Title**: "Pesan Baru dari [SenderName]"
   - **Body**: [Message preview]
   - **Click action**: Opens chat screen

## 🔐 Security Notes

- Service role key should NEVER be exposed to client-side code
- Push tokens are stored securely in the `profiles` table
- Edge functions run in a secure Deno runtime
- All webhook requests should use HTTPS

## 📝 Optional Enhancements

### Add Notification Logging

Create a table to track sent notifications:

```sql
CREATE TABLE notification_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text,
  body text,
  data jsonb,
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent'
);

-- Enable RLS
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Only users can view their own notification logs
CREATE POLICY "Users can view own notification logs"
  ON notification_logs FOR SELECT
  USING (auth.uid() = user_id);
```

Then uncomment the logging section in the edge function.

## ✅ Completion Checklist

- [ ] Edge function deployed
- [ ] Firebase Server Key set as Supabase secret
- [ ] Database webhook created
- [ ] Service worker configured
- [ ] Test notification sent successfully
- [ ] Logs verified in Supabase dashboard
- [ ] Click action opens correct chat

---

**Need help?** Check the Supabase docs: https://supabase.com/docs/guides/functions
