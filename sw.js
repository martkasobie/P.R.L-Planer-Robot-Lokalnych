importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBp7RWF-GWZ0-AuGAjwyI5x0FecuzzODec",
  authDomain: "planer-robot-lokalnych.firebaseapp.com",
  projectId: "planer-robot-lokalnych",
  storageBucket: "planer-robot-lokalnych.firebasestorage.app",
  messagingSenderId: "807809303313",
  appId: "1:807809303313:web:b6d84d65f14a0ec60902b0"
});

const messaging = firebase.messaging();

// Odbieranie w tle - Wersja Inteligentna (v14)
messaging.onBackgroundMessage(function(payload) {
  console.log('Odebrano depeszę:', payload);

  // Archiwista sprawdza czy wysłałaś własny tytuł i treść w Custom Data (Krok 5 w Firebase)
  const notificationTitle = payload.data?.title || payload.notification?.title || 'SYRENA PORANNA!';
  const notificationOptions = {
    body: payload.data?.body || payload.notification?.body || 'Zaloguj się do Planera i zgłoś gotowość do Czynu Społecznego!',
    icon: 'icon-512.png',
    badge: 'icon-512.png',
    tag: 'prl-notif', 
    renotify: true
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ROZKAZ OSTATECZNY KLIKNIĘCIA - Otwiera aplikację, nie Chrome
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const targetUrl = 'https://martkasobie.github.io/P.R.L-Planer-Robot-Lokalnych/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // 1. Jeśli apka jest już gdzieś otwarta, przełącz na nią
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. Jeśli nie jest otwarta, otwórz ją jako czyste okno aplikacji
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
