window.addEventListener('message', (event) => {
  const allowedOrigins = [
    'https://supervisor.ext-twitch.tv',
    'https://extension-files.twitch.tv'
  ];

  if (!allowedOrigins.includes(event.origin)) {
    console.warn('Messaggio da origine non riconosciuta:', event.origin);
    return;
  }

  console.log('Messaggio ricevuto:', event.data);
  // Aggiungi qui la gestione specifica per i messaggi in settings
});
