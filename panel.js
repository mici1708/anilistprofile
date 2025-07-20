document.addEventListener('DOMContentLoaded', () => {
  const result = document.getElementById('result');
  const loginBtn = document.getElementById('login');

  const backendURL = "https://anilistprofile.onrender.com";

  const token = new URLSearchParams(window.location.search).get("token");

  if (token) {
    // Mostra messaggio di login fatto
    result.textContent = "Login fatto! Caricamento lista...";

    // Dopo 2 secondi carica la lista
    setTimeout(() => {
      fetch(`${backendURL}/list`, {
        headers: {
          Authorization: token
        }
      })
      .then(res => res.json())
      .then(data => {
        const user = data.data.Viewer;
        result.innerHTML = `<h2>Lista di ${user.name}</h2>`;
        user.animeList.lists.forEach(list => {
          result.innerHTML += `<h3>${list.name}</h3>`;
          list.entries.forEach(entry => {
            const anime = entry.media;
            result.innerHTML += `
              <div>
                <img src="${anime.coverImage.medium}" alt="cover">
                ${anime.title.english || anime.title.romaji}
              </div>
            `;
          });
        });
      })
      .catch(() => {
        result.textContent = "Errore nel recuperare la lista.";
      });
    }, 2000);
  } else {
    loginBtn.addEventListener('click', () => {
      window.location.href = `${backendURL}/auth/login`;
    });
  }

  // Listener per i messaggi postMessage da Twitch
  window.addEventListener('message', (event) => {
    const allowedOrigins = [
      'https://supervisor.ext-twitch.tv',
      'https://extension-files.twitch.tv'
    ];

    if (!allowedOrigins.includes(event.origin)) {
      console.warn('Messaggio da origine non riconosciuta:', event.origin);
      return; // Ignora messaggi non autorizzati
    }

    // Qui puoi gestire il messaggio ricevuto
    console.log('Messaggio Twitch ricevuto:', event.data);
  });
});
