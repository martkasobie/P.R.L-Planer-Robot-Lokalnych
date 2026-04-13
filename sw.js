const CACHE_NAME = 'prl-v1';

// LISTA ZASOBÓW DO PRACY OFFLINE
const assets = [
  './',
  './index.html',
  './manifest.json',
  './ikona-192.png',
  './ikona-512.png',
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
  './termometr.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Oswald:wght@500;700&family=Special+Elite&family=Rye&family=VT323&display=swap'
];

// Instalacja i zapisywanie plików
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Serwowanie plików z pamięci
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
