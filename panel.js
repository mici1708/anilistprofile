document.addEventListener('DOMContentLoaded', () => {
  console.log("Panel.js caricato");
  
  if (!window.Twitch) {
    console.error("window.Twitch NON definito!");
  } else {
    console.log("window.Twitch è definito");
  }
  
  if (!window.Twitch?.ext) {
    console.error("window.Twitch.ext NON definito!");
  } else {
    console.log("window.Twitch.ext è definito");
    
    window.Twitch.ext.onAuthorized(auth => {
      console.log("onAuthorized chiamato");
      console.log("Auth oggetto:", auth);
  
      if (!auth.userId) {
        console.warn("Utente NON loggato Twitch");
      } else {
        console.log("Utente Twitch ID:", auth.userId);
        console.log("Token Twitch Extension:", auth.token);
      }
    });
  
    window.Twitch.ext.onError(err => {
      console.error("Errore Twitch Extension:", err);
    });
  }
  
  // Eventuale gestione messaggi Twitch
  window.addEventListener('message', (event) => {
    console.log("Messaggio ricevuto da:", event.origin);
    console.log("Dati messaggio:", event.data);
  });
    
  const result = document.getElementById('result');
  const loginBtn = document.getElementById('login');
  const backendURL = "https://anilistprofile.onrender.com";

  // Funzione per caricare la lista da backend con un token
  function loadAniListData(token) {
    result.textContent = "Caricamento lista...";

    fetch(`${backendURL}/list`, {
      headers: { Authorization: `Bearer ${token}` }
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

  // Se siamo dentro Twitch Extension SDK
  if (window.Twitch && window.Twitch.ext) {
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
  } else {
    // fallback: token da URL per test in browser
    const token = new URLSearchParams(window.location.search).get("token");
    console.log("Token frontend:", token);

    if (token) {
      loadAniListData(token);
    } else {
      loginBtn.addEventListener('click', () => {
        window.location.href = `${backendURL}/auth/login`;
      });
    }
  }

  // Eventuale gestione messaggi Twitch
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
