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

const CACHE_NAME = 'prl-planer-v9'; // Podbita wersja bufora!

// Twarde adresy URL, żeby system się nie gubił po kliknięciu w powiadomienie
const APP_URL = 'https://martkasobie.github.io/P.R.L-Planer-Robot-Lokalnych/';
const ICON_URL = 'https://martkasobie.github.io/P.R.L-Planer-Robot-Lokalnych/icon-512.png';

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
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Obywatelu! Archiwizuję akta (v9) w pamięci urządzenia...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Niszczenie starych akt z bufora:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.startsWith('http') && !event.request.url.includes('firestore')) {
            cache.put(event.request, responseToCache);
          }
        });
        return networkResponse;
      }).catch(() => {});
      return cachedResponse || fetchPromise;
    })
  );
});

// Odbieranie dyrektyw
messaging.onBackgroundMessage(function(payload) {
  console.log('[sw.js] Otrzymano tajną dyrektywę w tle', payload);
  
  // URZĘDOWA CENZURA: Ignorujemy twarde powiadomienia, żeby uniknąć duplikatów.
  if (payload.notification) {
      console.log('[sw.js] Firebase wyświetla to z automatu. Pasuję.');
      return;
  }
  
  const notificationTitle = payload.data?.title || 'CENTRALNE WEZWANIE';
  const notificationOptions = {
    body: payload.data?.body || 'Nowe wytyczne czekają w Planerze.',
    icon: ICON_URL,
    badge: ICON_URL,
    vibrate: [200, 100, 200, 100, 200],
    data: { url: APP_URL }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Obsługa kliknięcia powiadomienia
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Wymuszamy otwarcie prawidłowego, twardego adresu
  const urlToOpen = event.notification.data?.url || APP_URL;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.indexOf(urlToOpen) !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
