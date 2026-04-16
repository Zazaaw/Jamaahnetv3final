# Chat Notification Testing Guide 🧪

Quick guide to test your automated chat notifications.

## ✅ Pre-Flight Checklist

Before testing, ensure:

- [ ] Edge function deployed: `supabase functions deploy send-chat-notification`
- [ ] Firebase Server Key set: `supabase secrets set FIREBASE_SERVER_KEY=xxx`
- [ ] Database webhook created (see WEBHOOK_SETUP_SIMPLE.md)
- [ ] Service worker registered in browser (check DevTools → Application → Service Workers)
- [ ] Notification permission granted in browser

---

## 🧪 Test Scenarios

### Test 1: Basic Notification ✉️

**Objective:** Verify notification is sent when a message is inserted

**Steps:**

1. **Open two browser windows:**
   - Window A: Login as User A
   - Window B: Login as User B

2. **From Window A:**
   - Navigate to Chat
   - Send a message to User B: "Assalamu alaikum! 🌙"

3. **Expected Result in Window B:**
   - 🔔 Push notification appears
   - Title: "Pesan Baru dari [User A Name]"
   - Body: "Assalamu alaikum! 🌙"

4. **Click the notification:**
   - Should open the chat with User A
   - Message should be visible in the chat

---

### Test 2: Background Notification 📱

**Objective:** Verify notifications work when app is in background

**Steps:**

1. Login as User B in one tab
2. Switch to a different tab/window
3. Use SQL Editor to insert a test message:

```sql
-- Replace UUIDs with actual user IDs
INSERT INTO messages (chat_id, sender_id, recipient_id, content)
VALUES (
  (SELECT id FROM chats WHERE 'USER_B_ID' = ANY(participants) LIMIT 1),
  'USER_A_ID',
  'USER_B_ID',
  'Test background notification! 🚀'
);
```

4. **Expected Result:**
   - Notification appears in browser/OS notification center
   - Can click to open app and navigate to chat

---

### Test 3: Multiple Messages 📨

**Objective:** Test notification throttling and multiple notifications

**Steps:**

1. Send 3 messages quickly from User A to User B
2. **Expected Result:**
   - Each message should trigger a separate notification
   - Notifications should stack in the notification center

---

### Test 4: Edge Function Logs 📊

**Objective:** Verify edge function is executing correctly

**Steps:**

1. Open terminal and run:
```bash
supabase functions logs send-chat-notification --tail
```

2. Send a message from User A to User B

3. **Expected Logs:**
```
Received webhook payload: { type: 'INSERT', ... }
Fetched sender profile: { name: 'User A' }
Fetched recipient push token: eyJ...
Notification sent successfully: { success: 1, ... }
```

4. Look for any errors or warnings

---

### Test 5: No Push Token 🚫

**Objective:** Verify graceful handling when recipient has no push token

**Steps:**

1. Clear push token for User B:
```sql
UPDATE profiles 
SET push_token = NULL 
WHERE id = 'USER_B_ID';
```

2. Send message from User A to User B

3. **Expected Result:**
   - Edge function logs: "Recipient has no push token, skipping notification"
   - No error thrown
   - Message still delivered to database

4. Re-enable notifications by logging in as User B (will re-register token)

---

### Test 6: Webhook Status 🔍

**Objective:** Check webhook is triggering correctly

**Steps:**

1. Go to Supabase Dashboard → Database → Webhooks
2. Click on `chat-notification-webhook`
3. Click **Logs** tab
4. Send a test message
5. **Expected Result:**
   - New log entry appears
   - Status: `200 OK`
   - Payload shows the inserted message data

---

## 🐛 Debugging Common Issues

### Issue: No notification received

**Debug Steps:**

1. **Check notification permission:**
   ```javascript
   // Run in browser console
   Notification.permission
   // Should return: "granted"
   ```

2. **Check service worker:**
   - DevTools → Application → Service Workers
   - Should show: "firebase-messaging-sw.js" (activated and running)

3. **Check push token saved:**
   ```sql
   SELECT id, name, push_token 
   FROM profiles 
   WHERE id = 'USER_ID';
   ```
   - `push_token` should not be NULL

4. **Check edge function logs:**
   ```bash
   supabase functions logs send-chat-notification
   ```

5. **Check webhook logs:**
   - Supabase Dashboard → Database → Webhooks → Logs

---

### Issue: Notification received but click doesn't open chat

**Debug Steps:**

1. **Check service worker message handler:**
   - Open DevTools Console
   - Should see: `[firebase-messaging-sw.js] Notification clicked: ...`

2. **Check notification data:**
   ```javascript
   // In service worker console
   console.log(event.notification.data);
   // Should show: { chatId: '...', senderId: '...', type: 'message' }
   ```

3. **Verify App.tsx listener:**
   - Check browser console for: "Notification click received"

---

### Issue: Edge function error

**Debug Steps:**

1. **Check secrets are set:**
   ```bash
   supabase secrets list
   ```
   - Should show: `FIREBASE_SERVER_KEY`

2. **Check Firebase Server Key is valid:**
   - Firebase Console → Project Settings → Cloud Messaging
   - Copy fresh Server Key
   - Re-set: `supabase secrets set FIREBASE_SERVER_KEY=xxx`
   - Re-deploy: `supabase functions deploy send-chat-notification`

3. **Check function syntax:**
   ```bash
   supabase functions serve send-chat-notification
   # Should start without errors
   ```

---

## 📊 Monitoring Dashboard

### Real-time Logs

```bash
# Watch edge function logs
supabase functions logs send-chat-notification --tail

# Filter for errors only
supabase functions logs send-chat-notification --tail | grep ERROR
```

### Database Queries

**Check recent messages:**
```sql
SELECT m.*, 
       s.name as sender_name,
       r.name as recipient_name,
       r.push_token as recipient_token
FROM messages m
JOIN profiles s ON s.id = m.sender_id
JOIN profiles r ON r.id = m.recipient_id
ORDER BY m.created_at DESC
LIMIT 10;
```

**Check users with push tokens:**
```sql
SELECT id, name, push_token IS NOT NULL as has_token
FROM profiles
WHERE push_token IS NOT NULL;
```

**Check webhook execution count:**
```sql
-- This query works if you have pg_stat_statements enabled
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%notify_new_message%'
LIMIT 10;
```

---

## ✅ Success Criteria

Your notification system is working correctly when:

1. ✅ Messages trigger notifications within 1-2 seconds
2. ✅ Notification title shows sender's name
3. ✅ Notification body shows message content
4. ✅ Clicking notification opens the correct chat
5. ✅ Edge function logs show "Notification sent successfully"
6. ✅ Webhook logs show 200 OK responses
7. ✅ Gracefully handles missing push tokens (no errors)
8. ✅ Works in both foreground and background

---

## 🎯 Next Steps After Testing

Once everything works:

1. **Enable in Production**
   - Deploy edge function to production
   - Set production Firebase Server Key
   - Test with real users

2. **Monitor Performance**
   - Set up alerts for edge function errors
   - Monitor notification delivery rates
   - Track webhook response times

3. **Add Enhancements**
   - Notification preferences (mute/unmute)
   - Rich notifications with images
   - Notification grouping/batching
   - Read receipts

4. **Document for Team**
   - Share setup guide with team
   - Document troubleshooting steps
   - Create runbook for common issues

---

## 📞 Support Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

---

**Happy Testing! 🚀**
