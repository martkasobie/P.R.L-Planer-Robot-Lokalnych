const SW_VERSION = 'v1'; // <--- TUTAJ ZMIENIAJ NUMEREK PRZY KAŻDEJ AKTUALIZACJI APLIKACJI

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// KONFIGURACJA CENTRALI
firebase.initializeApp({
  apiKey: "AIzaSyBp7RWF-GWZ0-AuGAjwyI5x0FecuzzODec",
  authDomain: "planer-robot-lokalnych.firebaseapp.com",
  projectId: "planer-robot-lokalnych",
  storageBucket: "planer-robot-lokalnych.firebasestorage.app",
  messagingSenderId: "807809303313",
  appId: "1:807809303313:web:b6d84d65f14a0ec60902b0"
});

const messaging = firebase.messaging();

// 1. OBSŁUGA TŁA - Wyświetlamy nasze ładne powiadomienie z ikoną PRL
messaging.onBackgroundMessage(function(payload) {
  console.log('Odebrano depeszę w tle:', payload);

  const notificationTitle = payload.data?.title || payload.notification?.title || 'SYRENA PORANNA!';
  const notificationOptions = {
    body: payload.data?.body || payload.notification?.body || 'Zgłoś gotowość do Czynu Społecznego!',
    icon: 'icon-512.png',
    badge: 'icon-512.png',
    tag: 'prl-notif', // Zapobiega nadmiernemu spamowaniu
    renotify: true
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 2. OBSŁUGA KLIKNIĘCIA - Wymuszamy otwarcie aplikacji
self.addEventListener('notificationclick', function(event) {
  // Zamykamy powiadomienie po kliknięciu
  event.notification.close();
  
  // Adres Twojej aplikacji (identyczny jak ten zainstalowany w telefonie)
  const targetUrl = 'https://martkasobie.github.io/P.R.L-Planer-Robot-Lokalnych/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Jeśli aplikacja jest już otwarta w tle, przełączamy na nią (focus)
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Jeśli aplikacja jest zamknięta, otwieramy ją jako nowe okno
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 3. INSTALACJA I AKTUALIZACJA - Szybkie przejmowanie kontroli
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
