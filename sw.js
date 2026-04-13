const CACHE_NAME = 'prl-planer-v2'; // Zmieniłem wersję na v2, aby wymusić odświeżenie

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
      console.log('Obywatelu! Archiwizuję ikonę i pieczątki w pamięci urządzenia...');
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
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
