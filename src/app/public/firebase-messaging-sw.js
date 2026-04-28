importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBqmZ6G_7SoMJUhQFd6LeBLUEnhl-zHCPc",
  authDomain: "jamaahnet.firebaseapp.com",
  projectId: "jamaahnet",
  storageBucket: "jamaahnet.firebasestorage.app",
  messagingSenderId: "518685266898",
  appId: "1:518685266898:web:6c55f0b4e33fb1eb6a6e0b",
  measurementId: "G-6N81WG7N4C"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // FIX: Cuma bikin pop-up manual kalau backend TIDAK ngirim objek 'notification'
  // (Biar nggak dobel sama pop-up bawaan dari FCM)
  if (!payload.notification) {
    const notificationTitle = payload.data?.title || 'Jamaah.net';
    const notificationOptions = {
      body: payload.data?.body || 'Anda menerima notifikasi baru',
      icon: '/logo192.png',
      badge: '/badge-72x72.png',
      tag: payload.data?.type || 'general',
      data: payload.data,
      requireInteraction: false,
      vibrate: [200, 100, 200]
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();

  const notificationData = event.notification.data || {};
  const { chatId, senderId, type } = notificationData;

  let targetUrl = '/';
  
  if (type === 'message' && chatId) {
    targetUrl = `/?screen=chat&chatId=${chatId}&senderId=${senderId}`;
  } else if (type === 'product') {
    targetUrl = '/?screen=marketplace';
  } else if (type === 'donation') {
    targetUrl = '/?screen=donation';
  } else if (type === 'event') {
    targetUrl = '/?screen=calendar';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: notificationData,
            targetUrl: targetUrl
          });
          return client;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});