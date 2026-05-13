const admin = require('firebase-admin');

// 1. Pobieramy tajny klucz z sejfu GitHuba
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// 2. Logujemy się do Twojej Centrali
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://planer-robot-lokalnych-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

async function sendNotifications() {
  console.log("URUCHAMIAM ROBOTA WYSYŁKOWEGO...");
  try {
    // 3. Odczytujemy listę obecności (tokeny z bazy)
    const snapshot = await db.ref('tokens').once('value');
    const tokensData = snapshot.val();
    
    if (!tokensData) {
      console.log("Brak aktywnych tokenów w bazie. Robot wraca spać.");
      return;
    }

    const tokens = Object.values(tokensData).map(t => t.token);
    console.log(`Znaleziono ${tokens.length} obywateli. Przygotowuję depeszę...`);

    // 4. WYSYŁAMY WIADOMOŚĆ CICHĄ (DATA-ONLY) 
    // To sprawia, że system Android jej nie widzi, a Service Worker generuje jedno powiadomienie otwierające APK!
    const message = {
      data: {
        title: 'CO SIĘ GAPISZ? DO ROBOTY!',
        body: 'Otwieraj Planer, przybijaj pieczątki i zawstydź lenia w sobie.'
      },
      tokens: tokens
    };

    // 5. Strzał z syreny
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Raport z frontu: Wysłano pomyślnie ${response.successCount}, Błędów: ${response.failureCount}`);
  } catch (error) {
    console.error("Awaria maszyny:", error);
  } finally {
    process.exit();
  }
}

sendNotifications();
