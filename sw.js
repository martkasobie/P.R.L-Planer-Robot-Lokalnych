const CACHE_NAME = 'prl-v1-cache';
const ASSETS = [
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com'
];

// Instalacja i zapisywanie plików do pamięci podręcznej
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Pobieranie plików z keszu, gdy nie ma internetu
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Czyszczenie starego keszu przy aktualizacji
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});
