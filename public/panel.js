const usernameInput = document.getElementById('usernameInput');
const loadBtn = document.getElementById('loadBtn');
const statusDiv = document.getElementById('status');
const animeListDiv = document.getElementById('animeList');

async function fetchAnimeList(username) {
  statusDiv.textContent = 'Caricamento...';
  animeListDiv.innerHTML = '';

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
    const json = await response.json();

    if (json.errors) {
      statusDiv.textContent = 'Errore nel caricamento della lista: ' + json.errors[0].message;
      return;
    }

    const lists = json.data.MediaListCollection.lists;
    if (!lists.length) {
      statusDiv.textContent = 'Nessuna lista trovata per questo username.';
      return;
    }

    statusDiv.textContent = `Lista caricata per ${username}`;

    // Visualizza la lista anime (esempio: solo la prima lista)
    const firstList = lists[0];
    animeListDiv.innerHTML = `<h2>${firstList.name}</h2>`;
    firstList.entries.forEach(entry => {
      const media = entry.media;
      const title = media.english || media.romaji || media.native || 'Titolo sconosciuto';
      animeListDiv.innerHTML += `
        <div class="anime-item">
          <img src="${media.coverImage.medium}" alt="${title}" />
          <strong>${title}</strong> — Episodi: ${media.episodes || '?'} — Stato: ${entry.status} — Progress: ${entry.progress}
        </div>`;
    });
  } catch (error) {
    statusDiv.textContent = 'Errore di rete o API: ' + error.message;
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

// Se vuoi, puoi caricare username da localStorage qui e fare fetch automatico
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
