const container = document.getElementById('anime-list');
container.innerHTML = 'Caricamento lista...';

// 🔍 Funzione principale
function fetchAnimeList(username) {
  if (!username) {
    container.innerHTML = '⚠️ Nessuno username disponibile.';
    return;
  }

  console.log("👤 Carico dati per:", username);

  fetch('https://anilistprofile.onrender.com/get-anilist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  })
    .then(res => res.json())
    .then(data => {
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

// 🧠 Lettura da query string
function getUsernameFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('user');
}

// 📦 Lettura da localStorage
function getUsernameFromStorage() {
  return localStorage.getItem('anilistUsername');
}

// 🧠 Lettura da configurazione Twitch
function tryReadFromTwitch() {
  const config = window.Twitch?.ext?.configuration?.broadcaster;
  console.log("📋 Config Twitch:", config);

  if (config?.content) {
    try {
      const { username } = JSON.parse(config.content);
      console.log("✅ Username Twitch:", username);
      fetchAnimeList(username);
      return true;
    } catch (err) {
      console.error("❌ Errore nel parsing Twitch:", err);
    }
  }
  return false;
}

// 🚀 Avvio intelligente
function start() {
  const twitchAvailable = !!window.Twitch?.ext;

  if (twitchAvailable) {
    window.Twitch.ext.onAuthorized(() => {
      if (!tryReadFromTwitch()) {
        fallbackUsername();
      }
    });

    window.Twitch.ext.configuration.onChanged(() => {
      tryReadFromTwitch();
    });
  } else {
    fallbackUsername();
  }
}

// 🛟 Fallback alternativo
function fallbackUsername() {
  const urlUser = getUsernameFromURL();
  if (urlUser) {
    console.log("🔎 Username da URL:", urlUser);
    fetchAnimeList(urlUser);
    return;
  }

  const storedUser = getUsernameFromStorage();
  if (storedUser) {
    console.log("💾 Username da localStorage:", storedUser);
    fetchAnimeList(storedUser);
    return;
  }

  container.innerHTML = '⚠️ Nessuno username configurato.';
}

start();
