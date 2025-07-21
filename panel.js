document.addEventListener('DOMContentLoaded', () => {
  const result = document.getElementById('result');
  const loginBtn = document.getElementById('login');
  const backendURL = "https://anilistprofile.onrender.com";
  const token = new URLSearchParams(window.location.search).get("token");
  console.log("Token frontend:", token);

  if (token) {
    result.textContent = "Login fatto! Caricamento lista...";

    setTimeout(() => {
      fetch(`${backendURL}/list`, {
        headers: {
          Authorization: `Bearer ${token}`
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
    }, 2000);

  } else {
    loginBtn.addEventListener('click', () => {
      window.location.href = `${backendURL}/auth/login`;
    });
  }

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
    // Qui puoi aggiungere la gestione specifica dei messaggi Twitch
  });
});
