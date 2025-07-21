let token = null;

Twitch.ext.onAuthorized(auth => {
  token = auth.token;

  document.getElementById('saveBtn').addEventListener('click', () => {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) return;

    fetch('/api/sedt-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ username })
    })
      .then(res => res.json())
      .then(data => {
        document.getElementById('status').textContent = 'Salvato con successo!';
      })
      .catch(err => {
        console.error(err);
        document.getElementById('status').textContent = 'Errore nel salvataggio.';
      });
  });
});
