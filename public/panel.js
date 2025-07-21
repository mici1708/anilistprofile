const usernameInput = document.getElementById('usernameInput');
const loadBtn = document.getElementById('loadBtn');
const statusDiv = document.getElementById('status');
const animeListDiv = document.getElementById('animeList');

async function fetchAnimeList(username) {
  statusDiv.textContent = 'Caricamento...';
  animeListDiv.innerHTML = '';
  console.log(`Richiesta lista anime per utente: ${username}`);

  const query = `
  query ($name: String) {
    MediaListCollection(userName: $name, type: ANIME) {
      lists {
        name
        entries {
          media {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              medium
            }
            status
            episodes
          }
          status
          progress
        }
      }
    }
  }`;

  const variables = { name: username };

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      statusDiv.textContent = `Errore HTTP: ${response.status}`;
      console.error('Errore HTTP:', response);
      return;
    }

    const json = await response.json();
    console.log('Risposta API AniList:', json);

    if (json.errors) {
      statusDiv.textContent = 'Errore API: ' + json.errors[0].message;
      console.error('Errori API:', json.errors);
      return;
    }

    const lists = json.data.MediaListCollection.lists;
    if (!lists || lists.length === 0) {
      statusDiv.textContent = 'Nessuna lista trovata per questo username.';
      console.warn('Lista vuota o inesistente');
      return;
    }

    statusDiv.textContent = `Lista caricata per ${username}`;

    const firstList = lists[0];
    animeListDiv.innerHTML = `<h2>${firstList.name}</h2>`;
    firstList.entries.forEach(entry => {
      const media = entry.media;
      const title = media.english || media.romaji || media.native || 'Titolo sconosciuto';
      animeListDiv.innerHTML += `
        <div class="anime-item">
          <img src="${media.coverImage.medium}" alt="${title}" style="height:80px; vertical-align:middle;"/>
          <strong>${title}</strong> — Episodi: ${media.episodes || '?'} — Stato: ${entry.status} — Progress: ${entry.progress}
        </div>`;
    });
  } catch (error) {
    statusDiv.textContent = 'Errore di rete o API: ' + error.message;
    console.error('Errore fetch:', error);
  }
}

loadBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (!username) {
    statusDiv.textContent = 'Inserisci un username AniList valido.';
    return;
  }
  fetchAnimeList(username);
});

// Carica username da localStorage e avvia fetch automatico
const savedUsername = localStorage.getItem('anilistUsername');
if (savedUsername) {
  usernameInput.value = savedUsername;
  fetchAnimeList(savedUsername);
}

loadBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (username) {
    localStorage.setItem('anilistUsername', username);
  }
});
