document.addEventListener('DOMContentLoaded', () => {
  const result = document.getElementById('result');
  const loginBtn = document.getElementById('login');
  const backendURL = "https://anilistprofile.onrender.com";
  const token = new URLSearchParams(window.location.search).get("token");
  console.log("Token frontend:", token);  // verifica che esista e sia corretto

  if (token) {
    result.textContent = "Login fatto! Caricamento lista...";

    setTimeout(() => {
      fetch(`${backendURL}/list`, {
        headers: {
          Authorization: `Bearer ${token}` // ✅ CORRETTO
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
        if (!data.data || !data.data.Viewer) {
          result.textContent = "Nessun dato disponibile.";
          return;
        }

        const user = data.data.Viewer;
        result.innerHTML = `<h2>Lista di ${user.name}</h2>`;

        // se la tua query nel backend include anche MediaListCollection
        if (data.data.MediaListCollection?.lists) {
          data.data.MediaListCollection.lists.forEach(list => {
            result.innerHTML += `<h3>${list.name}</h3>`;
            list.entries.forEach(entry => {
              const anime = entry.media;
              result.innerHTML += `
                <div>
                  <img src="${anime.coverImage.medium}" alt="cover di ${anime.title.romaji}" />
                  ${anime.title.english || anime.title.romaji}
                </div>
              `;
            });
          });
        } else {
          result.innerHTML += "<p>La lista non è disponibile.</p>";
        }
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

  // Listener per messaggi Twitch (postMessage)
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
