# Simple Webhook Setup (No SQL Required) 🎯

This is the **easiest way** to set up chat notifications using Supabase Dashboard Webhooks.

## 🚀 Quick Setup (5 Minutes)

### Step 1: Deploy the Edge Function

```bash
# 1. Login to Supabase CLI
supabase login

# 2. Link your project
supabase link --project-ref YOUR_PROJECT_ID

# 3. Set the Firebase Server Key as a secret
supabase secrets set FIREBASE_SERVER_KEY=YOUR_FIREBASE_SERVER_KEY

# 4. Deploy the function
supabase functions deploy send-chat-notification
```

**Where to find Firebase Server Key:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (jamaahnet)
3. Click **⚙️ Project Settings** → **Cloud Messaging** tab
4. Copy the **Server key** under "Cloud Messaging API (Legacy)"

---

### Step 2: Create Database Webhook (No Code!)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to Database Webhooks**
   - Click **Database** in the left sidebar
   - Click **Webhooks** tab
   - Click **Create a new hook** button

3. **Configure the Webhook**

   Fill in these fields:

   | Field | Value |
   |-------|-------|
   | **Name** | `chat-notification-webhook` |
   | **Table** | `messages` |
   | **Events** | ✅ Check `Insert` only |
   | **Type** | `HTTP Request` |
   | **HTTP Method** | `POST` |

4. **Set the Webhook URL**

   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-chat-notification
   ```

   **Example:**
   ```
   https://abcdefghijklmnop.supabase.co/functions/v1/send-chat-notification
   ```

   ⚠️ Replace `YOUR_PROJECT_REF` with your actual project reference (found in Project Settings → General → Reference ID)

5. **Add HTTP Headers**

   Click **Add new header** (twice) and add:

   | Key | Value |
   |-----|-------|
   | `Content-Type` | `application/json` |
   | `Authorization` | `Bearer YOUR_ANON_KEY` |

   **Where to find Anon Key:**
   - Supabase Dashboard → **⚙️ Project Settings** → **API** → Copy "anon public" key

6. **Save the Webhook**
   - Click **Create webhook**
   - ✅ Webhook is now active!

---

### Step 3: Test It!

#### Option A: Test via Supabase SQL Editor

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this query (replace UUIDs with real user IDs):

```sql
INSERT INTO messages (chat_id, sender_id, recipient_id, content)
VALUES (
  gen_random_uuid()::text,
  'YOUR_SENDER_USER_ID',
  'YOUR_RECIPIENT_USER_ID',
  'Test notification - Assalamu alaikum! 🌙'
);
```

#### Option B: Test via App

1. Log in as User A
2. Send a message to User B
3. User B should receive a push notification!

---

### Step 4: Verify It's Working

#### Check Edge Function Logs

```bash
supabase functions logs send-chat-notification --tail
```

You should see:
```
Received webhook payload: { type: 'INSERT', ... }
Notification sent successfully
```

#### Check Webhook Logs

1. Go to **Database** → **Webhooks**
2. Click on `chat-notification-webhook`
3. Click **Logs** tab
4. Look for successful 200 responses

#### Check Firebase Console

1. Go to Firebase Console → **Cloud Messaging**
2. Check the **Sent** count in the dashboard

---

## 🔍 Troubleshooting

### ❌ Webhook shows 401 Unauthorized

**Solution:** Check your Authorization header has the correct anon key
```
Authorization: Bearer YOUR_ANON_KEY
```

### ❌ Webhook shows 404 Not Found

**Solution:** Verify the edge function is deployed:
```bash
supabase functions list
```

### ❌ Notification not received

**Checklist:**
- [ ] Recipient has a valid `push_token` in `profiles` table
- [ ] User has granted notification permission in browser
- [ ] Service worker is registered (`/public/firebase-messaging-sw.js`)
- [ ] Firebase Server Key is set correctly in Supabase secrets

### ❌ Edge function error

**Check logs:**
```bash
supabase functions logs send-chat-notification --tail
```

Common issues:
- Missing `FIREBASE_SERVER_KEY` secret
- Invalid push token
- Recipient profile not found

---

## 📊 Expected Flow

```
User A sends message to User B
        ↓
[messages table INSERT]
        ↓
[Database Webhook triggers]
        ↓
[Edge Function called]
        ↓
[Fetch sender name & recipient token]
        ↓
[Send FCM notification]
        ↓
[User B receives notification] 🔔
        ↓
[User B clicks → Opens chat]
```

---

## 🎯 Notification Details

When a message is sent, the recipient receives:

**📱 Notification:**
- **Title:** "Pesan Baru dari [Sender Name]"
- **Body:** [First 100 characters of message]
- **Icon:** App icon
- **Click Action:** Opens the specific chat

**📦 Data Payload:**
```json
{
  "chatId": "chat-uuid",
  "senderId": "sender-uuid",
  "type": "message",
  "messageId": "message-uuid"
}
```

---

## ✅ Success Criteria

You know it's working when:

1. ✅ Webhook shows in Database → Webhooks list
2. ✅ Edge function logs show "Notification sent successfully"
3. ✅ Webhook logs show 200 OK responses
4. ✅ Recipient receives notification on their device
5. ✅ Clicking notification opens the correct chat

---

## 🔐 Security Notes

- ✅ Service role key stays server-side (never exposed)
- ✅ Edge functions run in secure Deno runtime
- ✅ Webhooks use HTTPS only
- ✅ Push tokens stored securely in profiles table
- ✅ RLS policies protect user data

---

## 🎉 You're Done!

Your automated chat notification system is now live! Users will receive instant push notifications whenever they receive a new message.

**Next Steps:**
- Test with real users
- Monitor webhook logs for any issues
- Consider adding notification preferences (mute/unmute)
- Track notification delivery rates

**Need more help?** 
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase Webhooks Guide](https://supabase.com/docs/guides/database/webhooks)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
