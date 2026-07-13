/* eslint-disable no-undef */
// firebase-messaging-sw.js
// Minimal FCM service worker untuk Vercel deployment
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
  const title = payload.notification?.title || 'Undangan Pernikahan';
  const options = {
    body: payload.notification?.body || '',
    icon: '/BALI-ICON.webp',
    badge: '/BALI-ICON.webp'
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow('/');
      }
    })
  );
});