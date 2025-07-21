const container = document.getElementById('anime-list');
container.innerHTML = 'Caricamento lista...'; // Primo messaggio visivo

let username = '';

// Funzione che recupera e mostra la lista
function fetchAnimeList(user) {
  fetch('https://anilistprofile.onrender.com/get-anilist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user })
  })
    .then(res => res.json())
    .then(data => {
      container.innerHTML = '';

      const lists = data?.data?.MediaListCollection?.lists;
      if (!lists || lists.length === 0) {
        container.innerHTML = 'ℹ️ Nessuna lista trovata per questo utente.';
        return;
      }

      lists.forEach(list => {
        const title = document.createElement('h3');
        title.textContent = list.name;
        container.appendChild(title);

        list.entries.forEach(entry => {
          const item = document.createElement('div');
          item.className = 'anime-entry';
          item.innerHTML = `
            <img src="${entry.media.coverImage.large}" width="80" />
            <span class="anime-title">${entry.media.title.romaji || entry.media.title.english}</span>
          `;
          container.appendChild(item);
        });
      });
    })
    .catch(err => {
      console.error('❌ Errore nella richiesta al server:', err);
      container.innerHTML = '❌ Errore nel caricamento dei dati.';
    });
}

// Twitch event binding
window.Twitch.ext.onAuthorized(() => {
  // Se la configurazione è già disponibile
  const config = window.Twitch.ext.configuration.broadcaster;
  if (config && config.content) {
    try {
      const parsed = JSON.parse(config.content);
      username = parsed.username;
      console.log('Username trovato:', username);
      fetchAnimeList(username);
    } catch (err) {
      console.error('Errore nel parsing della configurazione:', err);
      container.innerHTML = '❌ Errore nella configurazione.';
    }
  }

  // In ascolto di cambiamenti successivi
  window.Twitch.ext.configuration.onChanged(() => {
    const cfg = window.Twitch.ext.configuration.broadcaster;
    if (cfg && cfg.content) {
      try {
        const parsed = JSON.parse(cfg.content);
        username = parsed.username;
        console.log('Username aggiornato:', username);
        fetchAnimeList(username);
      } catch (err) {
        console.error('Errore nel parsing aggiornato:', err);
        container.innerHTML = '❌ Errore nella configurazione aggiornata.';
      }
    } else {
      container.innerHTML = '⚠️ Nessun username AniList configurato.';
    }
  });
});
