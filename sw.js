importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Konfiguracja Centrali
firebase.initializeApp({
  apiKey: "AIzaSyBp7RWF-GWZ0-AuGAjwyI5x0FecuzzODec",
  authDomain: "planer-robot-lokalnych.firebaseapp.com",
  projectId: "planer-robot-lokalnych",
  storageBucket: "planer-robot-lokalnych.firebasestorage.app",
  messagingSenderId: "807809303313",
  appId: "1:807809303313:web:b6d84d65f14a0ec60902b0"
});

const messaging = firebase.messaging();

const CACHE_NAME = 'prl-planer-v12'; // Wersja ostateczna (Pancerna)

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
  './weryfikacja.png', 
  './kierownik.png', 
  './ziemniaki.png', 
  './Ogórek1.png', 
  './1zł.png', 
  './karp.png', 
  './Kaseta.png', 
  './Kawa.png', 
  './krzyzyk.png', 
  './Kupon.png', 
  './kura.png', 
  './Maluch.png', 
  './mandarynka.png', 
  './mis.png', 
  './Pierog1.png', 
  './TURBOGUMA.png', 
  './waga.png', 
  './Zupa1.png', 
  './Bilet.png', 
  './termometr.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((name) => {
        if (name !== CACHE_NAME) return caches.delete(name);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Przepuszczamy zapytania Firebase bezpośrednio
  if (event.request.method !== 'GET') return; 
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.startsWith('http')) cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {});
    })
  );
});

messaging.onBackgroundMessage(function(payload) {
  console.log('[sw.js] Otrzymano tajną dyrektywę w tle', payload);
  if (payload.notification) return;
  
  const notificationTitle = payload.data?.title || 'CENTRALNE WEZWANIE';
  const notificationOptions = {
    body: payload.data?.body || 'Nowe wytyczne czekają w Planerze.',
    icon: 'icon-512.png',
    badge: 'icon-512.png',
    vibrate: [200, 100, 200, 100, 200]
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// PANCERNE KLIKNIĘCIE - BLOKUJEMY FIREBASE I WYMUSZAMY APLIKACJĘ
self.addEventListener('notificationclick', function(event) {
  event.stopImmediatePropagation(); // KRYTYCZNE: Odcinamy Firebase od kliknięcia
  event.notification.close();
  
  // Twardy adres z upewnieniem się, że ładuje plik:
  const exactUrl = 'https://martkasobie.github.io/P.R.L-Planer-Robot-Lokalnych/index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes('P.R.L-Planer-Robot-Lokalnych') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(exactUrl);
    })
  );
});
