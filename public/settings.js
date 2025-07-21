let token = null;
let userId = null;

Twitch.ext.onAuthorized(auth => {
  token = auth.token;

  // Decodifica JWT per ottenere lo user_id
  const payload = JSON.parse(atob(token.split('.')[1]));
  userId = payload.user_id;

  // Ora è sicuro attivare i pulsanti o eseguire azioni
  document.getElementById('saveBtn').disabled = false;
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const username = document.getElementById('anilistUsername').value.trim();
  const message = document.getElementById('message');

  if (!username || !userId) {
    message.textContent = 'Errore: inserisci un username valido e attendi l\'autorizzazione.';
    return;
  }

  fetch('/api/save-username', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      twitchUserId: userId,
      anilistUsername: username
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        message.textContent = 'Username salvato con successo!';
      } else {
        message.textContent = 'Errore nel salvataggio.';
      }
    })
    .catch(() => {
      message.textContent = 'Errore nella richiesta al server.';
    });
});
