importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBp7RWF-GWZ0-AuGAjwyI5x0FecuzzODec",
    authDomain: "planer-robot-lokalnych.firebaseapp.com",
    projectId: "planer-robot-lokalnych",
    storageBucket: "planer-robot-lokalnych.firebasestorage.app",
    messagingSenderId: "807809303313",
    appId: "1:807809303313:web:b6d84d65f14a0ec60902b0"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('[Nocny Stróż] Otrzymano wezwanie w tle: ', payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || 'SYRENA PORANNA!';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'Zgłoś gotowość do Czynu Społecznego!',
        icon: 'icon-512.png',
        badge: 'icon-512.png'
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});
