document.addEventListener('DOMContentLoaded', () => {
  const result = document.getElementById('result');
  const loginBtn = document.getElementById('login');
  const backendURL = "https://anilistprofile.onrender.com";

  // Variabili Twitch
  let twitchUserId = null;
  let twitchToken = null;

  // Inizializza Twitch Extension SDK
  window.Twitch.ext.onAuthorized(auth => {
    twitchToken = auth.token; // Token JWT di Twitch Extension
    twitchUserId = auth.userId;

    console.log("Twitch auth:", { twitchUserId, twitchToken });

    if (!twitchUserId) {
      result.textContent = "Devi essere loggato su Twitch per usare l'estensione.";
      return;
    }

    // Ora chiedi al backend i dati AniList legati a questo utente Twitch
    loadAniListData();
  });

  function loadAniListData() {
    result.textContent = "Caricamento lista...";

    fetch(`${backendURL}/list`, {
      headers: {
        // Passa token Twitch al backend
        'Authorization': `Bearer ${twitchToken}`
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
    // Qui puoi aprire la pagina di login AniList tramite backend, 
    // e associare il token AniList all’utente Twitch lato backend
    window.open(`${backendURL}/auth/login`, '_blank');
  });

  // Puoi aggiungere listener per messaggi Twitch se ti servono
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
