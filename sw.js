const SW_VERSION = 'v38'; // <--- Podbita wersja, wymuszamy aktualizację Magazynu!
const CACHE_NAME = 'prl-magazyn-' + SW_VERSION;

// Podstawowe akta, które muszą być na stałe w szufladzie
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png'
];

// --- 1. IMPORTY I KONFIGURACJA CENTRALI (FIREBASE) ---
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBp7RWF-GWZ0-AuGAjwyI5x0FecuzzODec",
  authDomain: "planer-robot-lokalnych.firebaseapp.com",
  projectId: "planer-robot-lokalnych",
  storageBucket: "planer-robot-lokalnych.firebasestorage.app",
  messagingSenderId: "807809303313",
  appId: "1:807809303313:web:b6d84d65f14a0ec60902b0"
});

const messaging = firebase.messaging();

// --- 2. OBSŁUGA SYRENY W TLE (FIREBASE) ---
messaging.onBackgroundMessage(function(payload) {
  console.log('Odebrano depeszę w tle:', payload);

  const notificationTitle = payload.data?.title || payload.notification?.title || 'SYRENA PORANNA!';
  const notificationOptions = {
    body: payload.data?.body || payload.notification?.body || 'Zgłoś gotowość do Czynu Społecznego!',
    icon: 'icon-512.png',
    badge: 'icon-512.png',
    tag: 'prl-notif', 
    renotify: true
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- 3. OBSŁUGA KLIKNIĘCIA W POWIADOMIENIE ---
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = 'https://martkasobie.github.io/P.R.L-Planer-Robot-Lokalnych/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// --- 4. INSTALACJA I AKTUALIZACJA MAGAZYNU (OFFLINE) ---
self.addEventListener('install', event => {
  self.skipWaiting(); // Szybkie przejmowanie kontroli
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Niszczarka: Usuwanie starych akt', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// --- 5. WYDAWANIE DOKUMENTÓW (SIEĆ Z PIERWSZEŃSTWEM, OFFLINE W ZAPASIE) ---
self.addEventListener('fetch', event => {
  // UWAGA: Ignorujemy zapytania do bazy Firebase, one zawsze muszą iść siecią!
  if (event.request.url.includes('firebaseio.com') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Jeśli MAMY internet, odświeżamy szufladę najnowszym plikiem
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // Jeśli BRAK INTERNETU (offline), szukamy w szufladzie
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Jeśli przeglądarka chce załadować stronę, ładujemy zapasowy index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
