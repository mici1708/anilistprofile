document.addEventListener('DOMContentLoaded', () => {
  const result = document.getElementById('result');
  const loginBtn = document.getElementById('login');
  const backendURL = "https://anilistprofile.onrender.com";

  // Funzione per caricare la lista anime dal backend con token
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
      result.textContent = `Errore nel recuperare la lista: ${err.message}`;
    });
  }

  // Se siamo dentro Twitch Extension SDK
  if (window.Twitch && window.Twitch.ext) {
    window.Twitch.ext.onAuthorized(auth => {
      const twitchToken = auth.token;
      const twitchUserId = auth.userId;

      if (!twitchUserId) {
        result.textContent = "Devi essere loggato su Twitch per usare l'estensione.";
        return;
      }

      loadAniListData(twitchToken);
    });
  } else {
    // Fallback: token da URL per test in browser
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      loadAniListData(token);
    } else {
      loginBtn.addEventListener('click', () => {
        window.location.href = `${backendURL}/auth/login`;
      });
    }
  }
});
