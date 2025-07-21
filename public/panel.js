const container = document.getElementById('anime-list');
container.innerHTML = 'Caricamento lista...'; // Mostriamo prima qualcosa

window.Twitch.ext.onAuthorized(() => {
  window.Twitch.ext.configuration.onChanged(() => {
    const config = window.Twitch.ext.configuration.broadcaster;

    if (!config || !config.content) {
      container.innerHTML = '⚠️ Nessun username AniList configurato.';
      return;
    }

    let username = '';
    try {
      const parsed = JSON.parse(config.content);
      username = parsed.username;
    } catch (err) {
      console.error('Errore nel parsing della configurazione:', err);
      container.innerHTML = '❌ Errore nella configurazione.';
      return;
    }

    fetch('https://anilistprofile.onrender.com/get-anilist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    })
      .then(res => res.json())
      .then(data => {
        container.innerHTML = ''; // Puliamo

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
        console.error('Errore nella richiesta al server:', err);
        container.innerHTML = '❌ Errore nel caricamento dei dati.';
      });
  });
});
