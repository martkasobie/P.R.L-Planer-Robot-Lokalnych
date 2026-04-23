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

const CACHE_NAME = 'prl-planer-v11'; // Pancerna wersja 11

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
      console.log('Obywatelu! Archiwizuję akta (v11) w pamięci urządzenia...');
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
  if (event.request.method !== 'GET') {
    return; 
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.startsWith('http')) {
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
  
  if (payload.notification) {
      return;
  }
  
  const notificationTitle = payload.data?.title || 'CENTRALNE WEZWANIE';
  const notificationOptions = {
    body: payload.data?.body || 'Nowe wytyczne czekają w Planerze.',
    icon: ICON_URL,
    badge: ICON_URL,
    vibrate: [200, 100, 200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// OSTATECZNA CENZURA KLIKNIĘCIA
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Nieważne, co przysyła Firebase, my ZAWSZE wymuszamy ten jeden poprawny adres:
  const exactUrl = 'https://martkasobie.github.io/P.R.L-Planer-Robot-Lokalnych/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Jeśli apka jest już otwarta gdzieś w tle, po prostu ją pokaż (focus)
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === exactUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Jeśli apka jest całkowicie zamknięta, otwórz ją na nowo pod twardym adresem
      if (clients.openWindow) {
        return clients.openWindow(exactUrl);
      }
    })
  );
});
