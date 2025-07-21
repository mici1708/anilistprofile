let token = null;

Twitch.ext.onAuthorized(auth => {
  token = auth.token;

  document.getElementById('saveBtn').addEventListener('click', () => {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) return;

    fetch('https://anilistprofile.onrender.com/api/set-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // <--- questa riga è fondamentale
      },
      body: JSON.stringify({
        twitchUserId: userId,
        anilistUsername: username
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
