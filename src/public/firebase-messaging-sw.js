// Firebase Cloud Messaging Service Worker
// This handles push notifications when the app is in the background or closed

// Import Firebase scripts (v9+ modular)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase with the same config as firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyBqmZ6G_7SoMJUhQFd6LeBLUEnhl-zHCPc",
  authDomain: "jamaahnet.firebaseapp.com",
  projectId: "jamaahnet",
  storageBucket: "jamaahnet.firebasestorage.app",
  messagingSenderId: "518685266898",
  appId: "1:518685266898:web:6c55f0b4e33fb1eb6a6e0b",
  measurementId: "G-6N81WG7N4C"
};

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Customize notification here
  const notificationTitle = payload.notification?.title || 'Jamaah.net';
  const notificationOptions = {
    body: payload.notification?.body || 'Anda menerima notifikasi baru',
    icon: '/logo192.png', // Update this path to your app's icon
    badge: '/badge-72x72.png', // Update this path to your badge icon
    tag: payload.data?.type || 'general',
    data: payload.data,
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();

  // Extract notification data
  const notificationData = event.notification.data || {};
  const { chatId, senderId, type, messageId } = notificationData;

  // Determine the target URL based on notification type
  let targetUrl = '/';
  
  if (type === 'message' && chatId) {
    // Open the specific chat screen
    targetUrl = `/?screen=chat&chatId=${chatId}&senderId=${senderId}`;
  } else if (type === 'product') {
    targetUrl = '/?screen=marketplace';
  } else if (type === 'donation') {
    targetUrl = '/?screen=donation';
  } else if (type === 'event') {
    targetUrl = '/?screen=calendar';
  }

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Navigate the existing window to the target URL
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: notificationData,
            targetUrl: targetUrl
          });
          return client;
        }
      }
      
      // If no window is open, open a new one with the target URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});