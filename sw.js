const CACHE_NAME = 'prl-planer-v1';

// Pliki, które mają zostać zapisane w pamięci offline od razu
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Tutaj są Twoje pieczątki wyciągnięte z kodu HTML
  './weryfikacja.png', './kierownik.png', './ziemniaki.png', 
  './Ogórek1.png', './1zł.png', './karp.png', 
  './Kaseta.png', './Kawa.png', './krzyzyk.png', 
  './Kupon.png', './kura.png', './Maluch.png', 
  './mandarynka.png', './mis.png', './Pierog1.png', 
  './TURBOGUMA.png', './waga.png', './Zupa1.png', 
  './Bilet.png', './termometr.png'
];

// Instalacja Service Workera - zapisywanie plików do cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Zapisywanie plików aplikacji do pamięci podręcznej...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Aktywacja i czyszczenie starych wersji cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Usuwanie starego cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Przechwytywanie zapytań (Fetch) - tryb offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Jeśli plik jest w pamięci, zwróć go. Jeśli nie, pobierz z sieci (i opcjonalnie zapisz).
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Zapisuj w tle nowe zasoby, których nie było na liście początkowej
          if (event.request.url.startsWith('http')) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Zabezpieczenie, gdyby użytkownik był offline i próbował wejść na stronę główną
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
