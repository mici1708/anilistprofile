const container = document.getElementById('anime-list');
container.innerHTML = 'Caricamento lista...';

function fetchAnimeList(username) {
  if (!username) {
    container.innerHTML = '⚠️ Nessuno username configurato.';
    return;
  }

  console.log("👤 Fetch dati per:", username);

  fetch('https://anilistprofile.onrender.com/get-anilist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  })
    .then(res => res.json())
    .then(data => {
      console.log("📦 Risposta:", data);
      container.innerHTML = '';

      const lists = data?.data?.MediaListCollection?.lists;
      if (!lists || lists.length === 0) {
        container.innerHTML = 'ℹ️ Nessuna lista trovata.';
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
      console.error("❌ Errore nella chiamata:", err);
      container.innerHTML = '❌ Errore nel caricamento.';
    });
}

function tryReadUsernameFromConfig() {
  const config = window.Twitch?.ext?.configuration?.broadcaster;
  console.log("📋 Config Twitch:", config);

  if (config?.content) {
    try {
      const { username } = JSON.parse(config.content);
      console.log("✅ Username dalla configurazione:", username);
      fetchAnimeList(username);
    } catch (err) {
      console.error("❌ Errore nel parsing:", err);
      container.innerHTML = '❌ Errore nella configurazione.';
    }
  } else {
    container.innerHTML = '⚠️ Nessuna configurazione disponibile.';
  }
}

window.Twitch.ext.onAuthorized(() => {
  console.log("🟢 Twitch autorizzato");
  tryReadUsernameFromConfig();
});

window.Twitch.ext.configuration.onChanged(() => {
  console.log("🔄 Configurazione aggiornata");
  tryReadUsernameFromConfig();
});
