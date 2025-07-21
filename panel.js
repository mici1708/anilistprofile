document.addEventListener('DOMContentLoaded', () => {
  const result = document.getElementById('result');
  const loginBtn = document.getElementById('login');
  const backendURL = "https://anilistprofile.onrender.com";

  // Controllo che Twitch SDK sia presente PRIMA di accedere a window.Twitch.ext
  if (typeof window.Twitch === "undefined" || typeof window.Twitch.ext === "undefined") {
    console.warn('Twitch Extension Helper Library non caricata.');
    result.textContent = "Errore: questa pagina deve essere caricata all'interno di un'estensione Twitch.";
    return; // stop esecuzione
  }

  // Ora è sicuro usare window.Twitch.ext
  window.Twitch.ext.onAuthorized(auth => {
    const twitchToken = auth.token;
    const twitchUserId = auth.userId;

    console.log("Twitch auth:", { twitchUserId, twitchToken });

    if (!twitchUserId) {
      result.textContent = "Devi essere loggato su Twitch per usare l'estensione.";
      return;
    }

    loadAniListData(twitchToken);
  });

  function loadAniListData(twitchToken) {
    result.textContent = "Caricamento lista...";

    fetch(`${backendURL}/list`, {
      headers: {
        Authorization: `Bearer ${twitchToken}`
      }
    })
    .then(async res => {
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Errore risposta dal server: ${res.status} - ${errorText}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("Risposta completa:", data);

      if (data.error) {
        result.textContent = `Errore: ${data.error}`;
        return;
      }

      const lists = data.MediaListCollection?.lists;
      if (!lists || lists.length === 0) {
        result.textContent = "Nessun dato disponibile.";
        return;
      }

      result.innerHTML = `<h2>La tua lista Anime</h2>`;
      lists.forEach(list => {
        result.innerHTML += `<h3>${list.name}</h3>`;
        list.entries.forEach(entry => {
          const anime = entry.media;
          result.innerHTML += `
            <div style="margin-bottom: 10px;">
              <img src="${anime.coverImage.medium}" alt="cover di ${anime.title.romaji}" />
              ${anime.title.english || anime.title.romaji}
            </div>
          `;
        });
      });
    })
    .catch(err => {
      console.error(err);
      result.textContent = `Errore nel recuperare la lista: ${err.message}`;
    });
  }

  loginBtn.addEventListener('click', () => {
    window.open(`${backendURL}/auth/login`, '_blank');
  });

  window.addEventListener('message', (event) => {
    const allowedOrigins = [
      'https://supervisor.ext-twitch.tv',
      'https://extension-files.twitch.tv'
    ];

    if (!allowedOrigins.includes(event.origin)) {
      console.warn('Messaggio da origine non riconosciuta:', event.origin);
      return;
    }

    console.log('Messaggio Twitch ricevuto:', event.data);
  });
});
