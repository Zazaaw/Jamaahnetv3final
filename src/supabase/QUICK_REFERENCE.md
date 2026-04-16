# Chat Notifications - Quick Reference Card 🚀

## ⚡ 1-Minute Setup

```bash
# 1. Deploy function
supabase functions deploy send-chat-notification

# 2. Set Firebase key
supabase secrets set FIREBASE_SERVER_KEY=your-key-here

# 3. Create webhook in Supabase Dashboard:
#    Database → Webhooks → Create webhook
#    - Table: messages
#    - Events: Insert
#    - URL: https://YOUR_REF.supabase.co/functions/v1/send-chat-notification
```

---

## 🔍 Quick Commands

### Deploy & Logs
```bash
# Deploy function
supabase functions deploy send-chat-notification

# Watch logs
supabase functions logs send-chat-notification --tail

# View secrets
supabase secrets list

# Test locally
supabase functions serve send-chat-notification
```

### Database Queries
```sql
-- Check push tokens
SELECT id, name, push_token IS NOT NULL as has_token 
FROM profiles;

-- Recent messages
SELECT * FROM messages 
ORDER BY created_at DESC 
LIMIT 10;

-- Test insert
INSERT INTO messages (chat_id, sender_id, recipient_id, content)
VALUES ('test', 'user-a-id', 'user-b-id', 'Test! 🚀');
```

---

## 🐛 Quick Debug

### No notification?
1. Check permission: `Notification.permission` (console)
2. Check token: `SELECT push_token FROM profiles WHERE id='...'`
3. Check logs: `supabase functions logs send-chat-notification`
4. Check webhook: Dashboard → Database → Webhooks → Logs

### Click doesn't open chat?
1. Check service worker: DevTools → Application → Service Workers
2. Check console for errors
3. Verify notification data has `chatId` and `senderId`

---

## 📦 File Structure

```
/supabase/
├── functions/
│   └── send-chat-notification/
│       └── index.ts                    # Edge function
├── migrations/
│   └── create_chat_notification_trigger.sql  # DB trigger
├── WEBHOOK_SETUP_SIMPLE.md            # ⭐ Start here
├── CHAT_NOTIFICATION_SETUP.md         # Full guide
├── NOTIFICATION_TEST_GUIDE.md         # Testing
├── QUICK_REFERENCE.md                 # This file
└── deploy-notifications.sh            # Auto-deploy

/public/
└── firebase-messaging-sw.js           # Service worker

/App.tsx                               # Navigation handler
```

---

## 🎯 Notification Flow

```
Message Insert → Trigger → Webhook → Edge Function → FCM → User 🔔
```

---

## 📋 Webhook Configuration

| Setting | Value |
|---------|-------|
| **Name** | `chat-notification-webhook` |
| **Table** | `messages` |
| **Events** | Insert ✓ |
| **Method** | POST |
| **URL** | `https://{ref}.supabase.co/functions/v1/send-chat-notification` |
| **Headers** | `Content-Type: application/json` <br> `Authorization: Bearer {anon_key}` |

---

## 🔑 Required Keys

| Key | Where to Find |
|-----|---------------|
| **Firebase Server Key** | Firebase Console → Project Settings → Cloud Messaging → Server key |
| **Supabase Anon Key** | Supabase Dashboard → Settings → API → anon public |
| **Project Ref** | Supabase Dashboard → Settings → General → Reference ID |

---

## ✅ Success Checklist

- [ ] Edge function deployed
- [ ] Firebase key set as secret
- [ ] Webhook created in dashboard
- [ ] Service worker registered
- [ ] Test notification sent
- [ ] Click opens correct chat
- [ ] Logs show success

---

## 📞 Help

- **Setup**: Read `WEBHOOK_SETUP_SIMPLE.md`
- **Testing**: Read `NOTIFICATION_TEST_GUIDE.md`
- **Troubleshooting**: Check function logs
- **Support**: Supabase docs + Firebase docs

---

**That's it! You're ready to go! 🎉**
