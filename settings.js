window.addEventListener('message', (event) => {
  // Controlla che l'origine del messaggio sia Twitch
  if (event.origin !== 'https://supervisor.ext-twitch.tv' && 
      event.origin !== 'https://extension-files.twitch.tv') {
    console.warn('Messaggio da origine non riconosciuta:', event.origin);
    return; // ignora messaggi non da Twitch
  }

  // Qui processa il messaggio
  console.log('Messaggio ricevuto:', event.data);
});
