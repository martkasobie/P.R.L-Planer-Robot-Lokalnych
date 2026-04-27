const SW_VERSION = 'v20'; // <--- WERSJA 18: Ostateczna pacyfikacja marginesów!

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
    tag: 'prl-notif', 
    renotify: true
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 2. OBSŁUGA KLIKNIĘCIA - Wymuszamy otwarcie aplikacji
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

// 3. INSTALACJA I AKTUALIZACJA - Szybkie przejmowanie kontroli
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
