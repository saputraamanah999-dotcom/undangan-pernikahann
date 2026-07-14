/* eslint-disable no-undef */
// firebase-messaging-sw.js
// FCM service worker — Vercel deployment
// CRITICAL: Pass through ALL options from server payload (tag, renotify, requireInteraction)
// so notifications don't collapse, don't auto-dismiss, and arrive reliably.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAonRasC2MVqzfpAblL4TvTAQ3O0bw5y0g",
  authDomain: "undanganadmin.firebaseapp.com",
  databaseURL: "https://undanganadmin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "undanganadmin",
  storageBucket: "undanganadmin.firebasestorage.app",
  messagingSenderId: "11785976446",
  appId: "1:11785976446:web:179f73e317b8e0970c362f",
  measurementId: "G-BVDV4F7648"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  const webpush = payload.data?.webpush || {};

  // Build options — pass through tag, renotify, requireInteraction from server
  const options = {
    body: notification.body || '',
    icon: '/BALI-ICON.webp',
    badge: '/BALI-ICON.webp',
    vibrate: [200, 100, 200],
    // These 3 are CRITICAL — prevent collapse & auto-dismiss
    tag: notification.tag || ('notif-' + Date.now()),
    renotify: true,
    requireInteraction: true,
    // Click action — open the wedding site
    data: {
      url: payload.fcmOptions?.link || payload.data?.link || '/',
    },
  };

  // Override with any options from server webpush payload
  if (payload.data?.tag) options.tag = payload.data.tag;
  if (payload.data?.renotify !== undefined) options.renotify = payload.data.renotify === 'true';
  if (payload.data?.requireInteraction !== undefined) options.requireInteraction = payload.data.requireInteraction === 'true';

  self.registration.showNotification(notification.title || 'Undangan Pernikahan', options);
});

// Handle notification click — focus existing tab or open new one
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing tab if it has the same URL
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          return;
        }
      }
      // No existing tab — open new one
      return self.clients.openWindow(urlToOpen);
    })
  );
});