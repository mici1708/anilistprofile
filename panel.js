window.onload = () => {
  const container = document.getElementById('anime-list');
  if (!container) {
    console.error("❌ Elemento #anime-list non trovato nel DOM.");
    return;
  }

  function fetchAnimeList(username) {
    if (!username) {
      container.innerHTML = '⚠️ Nessuno username disponibile.';
      return;
    }

    container.innerHTML = `⏳ Carico dati per: ${username}...`;
    console.log("👤 Carico dati per:", username);

    fetch('https://anilistprofile.onrender.com/get-anilist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    })
      .then(res => res.json())
      .then(data => {
        console.log("📦 Risposta ricevuta:", data);
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
        container.innerHTML = '❌ Errore nella chiamata.';
        console.error("Errore:", err);
      });
  }

  function tryReadFromTwitch() {
    const config = window.Twitch.ext.configuration?.broadcaster;
    console.log("📋 Config Twitch:", config);

    if (config?.content) {
      try {
        const { username } = JSON.parse(config.content);
        console.log("✅ Username Twitch:", username);
        fetchAnimeList(username);
      } catch (err) {
        container.innerHTML = '❌ Errore nel parsing configurazione.';
        console.error("Errore:", err);
      }
    } else {
      container.innerHTML = '⚠️ Nessuna configurazione disponibile.';
    }
  }

  window.Twitch.ext.onAuthorized(() => {
    tryReadFromTwitch();
  });

  window.Twitch.ext.configuration.onChanged(() => {
    tryReadFromTwitch();
  });
};
