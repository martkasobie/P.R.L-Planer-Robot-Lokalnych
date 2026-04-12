const CACHE_NAME = 'prl-v2-cache';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com'
];

// Instalacja i zapisywanie plików do pamięci podręcznej
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Otwieranie schowka biurokratycznego...');
      // addAll zawiedzie, jeśli któryś z plików nie istnieje (404)
      return cache.addAll(ASSETS);
    }).catch(error => {
      console.error('Błąd przy instalacji archiwum:', error);
    })
  );
  // Zmusza SW do natychmiastowego przejęcia kontroli
  self.skipWaiting();
});

// Pobieranie plików z keszu, gdy nie ma internetu
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Jeśli plik jest w pamięci, zwróć go. Jeśli nie, pobierz z sieci.
      return response || fetch(event.request).catch(() => {
        // Tu można by zwrócić stronę błędu offline, gdybyśmy taką mieli
        console.log('Obywatelu, brak łączności i brak pliku w archiwum!');
      });
    })
  );
});

// Czyszczenie starego keszu przy aktualizacji systemu
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  // Powoduje, że SW od razu kontroluje otwarte karty
  return self.clients.claim();
});
