let token = null;

Twitch.ext.onAuthorized(auth => {
  token = auth.token;

  fetch('/api/get-username', {
    headers: { Authorization: 'Bearer ' + token }
  })
    .then(res => res.json())
    .then(data => {
      if (!data.anilistUsername) throw new Error('Nessuno username trovato');

      return fetch('/api/anilist/' + data.anilistUsername);
    })
    .then(res => res.json())
    .then(data => {
      const animeList = data?.data?.MediaListCollection?.lists?.flatMap(list => list.entries) || [];
      const container = document.getElementById('animeList');
      container.innerHTML = '<h2>Anime in visione:</h2><ul>' + animeList.map(e => `<li>${e.media.title.romaji}</li>`).join('') + '</ul>';
    })
    .catch(err => {
      console.error(err);
      document.getElementById('animeList').textContent = 'Errore durante il caricamento dei dati.';
    });
});
