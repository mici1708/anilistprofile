let token = null;

Twitch.ext.onAuthorized(auth => {
  token = auth.token;

  fetch('/api/get-username', {
    headers: { Authorization: 'Bearer ' + token }
  })
    .then(res => res.json())
    .then(data => {
      const username = data.anilistUsername;
      if (!username) throw new Error('Username non trovato');

      return fetch(`/api/anilist/${username}`);
    })
    .then(res => res.json())
    .then(renderAnimeList)
    .catch(err => {
      document.getElementById('animeList').textContent = 'Errore durante il caricamento dei dati.';
      console.error('Errore:', err);
    });
});
