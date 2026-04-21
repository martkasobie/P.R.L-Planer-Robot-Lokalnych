const CACHE_NAME = 'prl-planer-v5';

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
      console.log('Obywatelu! Archiwizuję nowe akta, ikonę i pieczątki w pamięci urządzenia...');
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
        caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.startsWith('http')) {
            cache.put(event.request, networkResponse.clone());
          }
        });
        return networkResponse;
      }).catch(() => {
        // Zignoruj błędy sieci w trybie offline
      });
      
      return cachedResponse || fetchPromise;
    })
  );
});

// Odbieranie dyrektyw z centrali (Push Notification Event)
self.addEventListener('push', function(event) {
  // Jeśli serwer prześle dane, używamy ich, inaczej dajemy domyślny komunikat
  const data = event.data ? event.data.json() : { 
      title: 'CENTRALNE WEZWANIE', 
      body: 'Obywatelu, staw się do planera natychmiast!' 
  };

  const options = {
    body: data.body,
    icon: './icon-512.png',
    badge: './icon-512.png', // Mała ikonka na pasku
    vibrate: [200, 100, 200, 100, 200], // Rytm alarmu
    data: {
      url: './index.html' // Gdzie przekierować po kliknięciu
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Reakcja Obywatela na wezwanie (Notification Click Event)
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Zamknij powiadomienie

  // Otwórz aplikację, jeśli Obywatel kliknął
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Sprawdź, czy karta jest już otwarta, jeśli tak - przenieś na nią focus
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.indexOf(event.notification.data.url) !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      // Jeśli nie ma otwartej karty, otwórz nową
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
