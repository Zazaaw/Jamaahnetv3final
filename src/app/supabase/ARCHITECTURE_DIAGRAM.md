# Chat Notification Architecture 🏗️

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         JAMAAH.NET CLIENT APP                           │
│  ┌───────────────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│  │   React App       │  │  Service Worker  │  │  Firebase Messaging│  │
│  │   (App.tsx)       │  │  (SW.js)         │  │  (firebase.ts)     │  │
│  │                   │  │                  │  │                    │  │
│  │ • Chat UI         │  │ • Handle clicks  │  │ • Request token    │  │
│  │ • Navigation      │  │ • Show notif.    │  │ • Save to DB       │  │
│  │ • Message listener│  │ • Post messages  │  │ • Foreground msgs  │  │
│  └───────────────────┘  └──────────────────┘  └────────────────────┘  │
│           │                      ▲                      │              │
└───────────┼──────────────────────┼──────────────────────┼──────────────┘
            │                      │                      │
            │ Insert Message       │ Show Notification    │ Register Token
            ▼                      │                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE BACKEND                              │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    PostgreSQL Database                            │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐   │ │
│  │  │  messages   │  │  profiles    │  │  chats                 │   │ │
│  │  ├─────────────┤  ├──────────────┤  ├────────────────────────┤   │ │
│  │  │ id          │  │ id           │  │ id                     │   │ │
│  │  │ chat_id  ───┼──┼─────────────▶│  │ participants (array)   │   │ │
│  │  │ sender_id   │  │ name         │  │ created_at             │   │ │
│  │  │ recipient_id│  │ push_token ◄─┼──┼────────────────────────┘   │ │
│  │  │ content     │  │ avatar_url   │  │                            │ │
│  │  │ created_at  │  │ ...          │  │                            │ │
│  │  └─────────────┘  └──────────────┘  └────────────────────────────┘ │
│  │         │                                                           │ │
│  │         │ ON INSERT                                                 │ │
│  │         ▼                                                           │ │
│  │  ┌──────────────────────────────────────────┐                      │ │
│  │  │  Database Trigger                        │                      │ │
│  │  │  notify_new_message()                    │                      │ │
│  │  │  • Fires on messages INSERT              │                      │ │
│  │  │  • Calls webhook via pg_net              │                      │ │
│  │  │  • Non-blocking async HTTP call          │                      │ │
│  │  └──────────────────────────────────────────┘                      │ │
│  └───────────────────────────────────┼───────────────────────────────┘ │
│                                      │ HTTP POST                        │
│                                      ▼                                  │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    Edge Function (Deno Runtime)                   │ │
│  │  /functions/v1/send-chat-notification                             │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │  1. Receive webhook payload                                 │  │ │
│  │  │     { type: 'INSERT', record: { ... } }                     │  │ │
│  │  │                                                              │  │ │
│  │  │  2. Extract message data                                    │  │ │
│  │  │     • sender_id, recipient_id                               │  │ │
│  │  │     • content, chat_id                                      │  │ │
│  │  │                                                              │  │ │
│  │  │  3. Fetch sender profile                                    │  │ │
│  │  │     SELECT name FROM profiles WHERE id = sender_id          │  │ │
│  │  │                                                              │  │ │
│  │  │  4. Fetch recipient push token                              │  │ │
│  │  │     SELECT push_token FROM profiles WHERE id = recipient_id │  │ │
│  │  │                                                              │  │ │
│  │  │  5. Build FCM payload                                       │  │ │
│  │  │     {                                                        │  │ │
│  │  │       to: push_token,                                       │  │ │
│  │  │       notification: {                                       │  │ │
│  │  │         title: "Pesan Baru dari [Name]",                    │  │ │
│  │  │         body: "[Content]"                                   │  │ │
│  │  │       },                                                     │  │ │
│  │  │       data: { chatId, senderId, type }                      │  │ │
│  │  │     }                                                        │  │ │
│  │  │                                                              │  │ │
│  │  │  6. Send to Firebase Cloud Messaging                        │  │ │
│  │  │     POST https://fcm.googleapis.com/fcm/send                │  │ │
│  │  │     Authorization: key=FIREBASE_SERVER_KEY                  │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────┼───────────────────────────────┘ │
└────────────────────────────────────┼─────────────────────────────────┘
                                      │ FCM API
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   FIREBASE CLOUD MESSAGING (FCM)                        │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  • Validate push token                                            │ │
│  │  • Route to device platform (Web, iOS, Android)                   │ │
│  │  • Handle delivery retry logic                                    │ │
│  │  • Queue messages if device offline                               │ │
│  │  • Send notification to device                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┼─────────────────────────────────┘
                                      │ Push Notification
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER DEVICE (Recipient)                         │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  Browser / OS Notification Center                           │       │
│  │  ┌────────────────────────────────────────────────────────┐ │       │
│  │  │  🔔 Pesan Baru dari Ahmad                             │ │       │
│  │  │  Assalamu alaikum warahmatullahi...                   │ │       │
│  │  │                                                        │ │       │
│  │  │  [Click to open]                                      │ │       │
│  │  └────────────────────────────────────────────────────────┘ │       │
│  └──────────────────────┼──────────────────────────────────────┘       │
│                         │ User clicks                                   │
│                         ▼                                               │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  Service Worker Event Handler                              │       │
│  │  • notificationclick event                                 │       │
│  │  • Parse data: { chatId, senderId, type }                  │       │
│  │  • Close notification                                      │       │
│  │  • Focus/open app window                                  │       │
│  │  • Post message to app with navigation data               │       │
│  └──────────────────────┼──────────────────────────────────────┘       │
│                         │                                               │
│                         ▼                                               │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  React App Navigation                                      │       │
│  │  • Receive service worker message                          │       │
│  │  • Navigate to chat screen                                 │       │
│  │  • Load messages for chatId                                │       │
│  │  • Show chat with sender                                   │       │
│  └─────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequence

```
┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
│  User A  │        │ Supabase │        │   Edge   │        │ Firebase │
│ (Sender) │        │   DB     │        │ Function │        │   FCM    │
└────┬─────┘        └────┬─────┘        └────┬─────┘        └────┬─────┘
     │                   │                   │                   │
     │ 1. Send Message   │                   │                   │
     ├──────────────────▶│                   │                   │
     │   INSERT INTO     │                   │                   │
     │   messages        │                   │                   │
     │                   │                   │                   │
     │                   │ 2. Trigger Fires  │                   │
     │                   │  (on_message_     │                   │
     │                   │   _inserted)      │                   │
     │                   │                   │                   │
     │                   │ 3. Webhook Call   │                   │
     │                   ├──────────────────▶│                   │
     │                   │  POST /functions  │                   │
     │                   │   /send-chat-...  │                   │
     │                   │                   │                   │
     │                   │                   │ 4. Fetch Sender   │
     │                   │◀──────────────────┤   Profile         │
     │                   │  SELECT name      │                   │
     │                   │  FROM profiles    │                   │
     │                   │                   │                   │
     │                   │ 5. Return Name    │                   │
     │                   ├──────────────────▶│                   │
     │                   │  { name: "A" }    │                   │
     │                   │                   │                   │
     │                   │ 6. Fetch Token    │                   │
     │                   │◀──────────────────┤                   │
     │                   │  SELECT token     │                   │
     │                   │  FROM profiles    │                   │
     │                   │                   │                   │
     │                   │ 7. Return Token   │                   │
     │                   ├──────────────────▶│                   │
     │                   │  { token: "..." } │                   │
     │                   │                   │                   │
     │                   │                   │ 8. Send to FCM    │
     │                   │                   ├──────────────────▶│
     │                   │                   │  POST /fcm/send   │
     │                   │                   │  + payload        │
     │                   │                   │                   │
     │                   │                   │ 9. FCM Success    │
     │                   │                   │◀──────────────────┤
     │                   │                   │  { success: 1 }   │
     │                   │                   │                   │
     │                   │ 10. Return Success│                   │
     │                   │◀──────────────────┤                   │
     │                   │  { sent: true }   │                   │
     │                   │                   │                   │
                                                                  │
                                             11. Push to Device   │
                                                      ────────────┼────▶ 🔔
                                                                  │    User B
                                                                  │   (Recipient)
                                                                  │
                                             12. User clicks      │
                                                      ◀───────────┤
                                                                  │
                                             13. Open Chat        │
                                                      ────────────┼────▶ 💬
                                                                       Chat UI
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Layer 1: Client-Side                                               │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ • Service worker (isolated context)                           │ │
│  │ • Push tokens (user-specific, device-specific)                │ │
│  │ • HTTPS only                                                  │ │
│  │ • No sensitive keys exposed                                   │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Layer 2: Database                                                  │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ • Row Level Security (RLS) policies                           │ │
│  │ • User can only see own messages                              │ │
│  │ • Push tokens protected by RLS                                │ │
│  │ • Webhook uses service role (internal only)                   │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Layer 3: Edge Function                                             │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ • Runs in isolated Deno runtime                               │ │
│  │ • Environment variables (secrets)                             │ │
│  │ • No client access to function code                           │ │
│  │ • Service role key (server-side only)                         │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Layer 4: Firebase                                                  │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ • Server key (never exposed to client)                        │ │
│  │ • Token validation                                            │ │
│  │ • Encrypted message delivery                                 │ │
│  │ • Device authentication                                       │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Performance Metrics

```
┌────────────────────────────────────────────────────────────────┐
│                    LATENCY BREAKDOWN                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Message Insert → Database                  ~10-20ms           │
│  ────────────────────────────────────────────────────▶         │
│                                                                │
│  Database Trigger → Webhook Call            ~5-10ms            │
│  ──────────────────────────▶                                   │
│                                                                │
│  Webhook → Edge Function (cold start)       ~200-500ms         │
│  ────────────────────────────────────────────────────────────▶ │
│                                                                │
│  Webhook → Edge Function (warm)             ~50-100ms          │
│  ────────────────────────────▶                                 │
│                                                                │
│  Edge Function → Database Queries           ~20-50ms           │
│  ────────────────────────────────▶                             │
│                                                                │
│  Edge Function → FCM API                    ~100-300ms         │
│  ──────────────────────────────────────────▶                   │
│                                                                │
│  FCM → Device Delivery                      ~100-500ms         │
│  ──────────────────────────────────────────▶                   │
│                                                                │
│  TOTAL (worst case):                        ~500-1500ms        │
│  TOTAL (typical):                           ~300-700ms         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                             │
└────────────────────────────────────────────────────────────────┘

Scenario 1: No Push Token
────────────────────────────────────────────────────────
  Message Insert → Trigger → Edge Function
                              │
                              ├─▶ Query profiles.push_token
                              │   Result: NULL
                              │
                              ├─▶ Log: "No push token, skipping"
                              └─▶ Return 200 OK (graceful skip)

  ✅ Message still delivered to database
  ✅ No notification sent (user hasn't granted permission)


Scenario 2: Invalid Push Token
────────────────────────────────────────────────────────
  Message Insert → Trigger → Edge Function → FCM
                              │              │
                              │              ├─▶ Error: "InvalidRegistration"
                              │              │
                              │◀─────────────┘
                              │
                              ├─▶ Log: "Invalid token"
                              └─▶ Optional: Clear token from DB

  ✅ Message still delivered
  ❌ Notification failed (logged)


Scenario 3: FCM Service Down
────────────────────────────────────────────────────────
  Message Insert → Trigger → Edge Function → FCM (timeout)
                              │              │
                              │              X (503 error)
                              │              │
                              │◀─────────────┘
                              │
                              ├─▶ Log error
                              └─▶ Return 500 (will retry)

  ✅ Message still delivered
  ⚠️  Can implement retry logic


Scenario 4: Database Connection Lost
────────────────────────────────────────────────────────
  Message Insert → Trigger → Edge Function
                              │
                              ├─▶ Query profiles (error)
                              │   Connection timeout
                              │
                              ├─▶ Catch error
                              └─▶ Return 500 + log

  ✅ Message still delivered
  ❌ Notification failed (logged)
```

---

## Scaling Considerations

```
┌─────────────────────────────────────────────────────────────┐
│                    THROUGHPUT CAPACITY                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Component          Limit              Scaling Strategy    │
│  ──────────────────────────────────────────────────────────│
│  Database Trigger   100K+/sec          Auto-scales         │
│  Edge Function      10K concurrent     Auto-scales         │
│  FCM API            1M+/min            Rate limits apply   │
│  Webhook            Limited by Edge    Use direct calls    │
│                                                             │
│  Recommended Max:   ~1000 msgs/sec     Without tuning      │
│  With Optimization: ~10K msgs/sec      With batching       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Monitoring Stack

```
┌──────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Edge Function Logs                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ • Real-time streaming logs                             │ │
│  │ • Error tracking                                       │ │
│  │ • Execution time metrics                               │ │
│  │ • Request/response payloads                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Database Metrics                                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ • Query performance                                    │ │
│  │ • Connection pooling stats                             │ │
│  │ • Trigger execution count                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Webhook Logs                                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ • Request history                                      │ │
│  │ • Success/failure rates                                │ │
│  │ • Response times                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Firebase Console                                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ • Messages sent/delivered                              │ │
│  │ • Platform breakdown (Web/iOS/Android)                 │ │
│  │ • Error rates                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

**This architecture provides:**
- ✅ Real-time notifications (<1 second latency)
- ✅ Automatic scaling
- ✅ Error resilience
- ✅ Security by design
- ✅ Observable and debuggable
- ✅ Cost-effective (serverless)
