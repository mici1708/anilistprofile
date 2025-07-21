const statusDiv = document.getElementById('status');
const animeListDiv = document.getElementById('animeList');

async function fetchAnimeList(username) {
  statusDiv.textContent = 'Caricamento lista anime di ' + username + '...';
  animeListDiv.innerHTML = '';

  const query = `
  query ($name: String) {
    MediaListCollection(userName: $name, type: ANIME) {
      lists {
        name
        entries {
          media {
            id
            title { romaji english native }
            coverImage { medium }
            status
            episodes
          }
          status
          progress
        }
      }
    }
  }`;

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { name: username } })
    });
    const data = await response.json();
    if (data.errors) throw new Error(data.errors[0].message);

    const lists = data.data.MediaListCollection.lists;
    if (!lists || lists.length === 0) {
      statusDiv.textContent = 'Nessuna lista trovata per ' + username;
      return;
    }
    statusDiv.textContent = 'Lista caricata per ' + username;

    const firstList = lists[0];
    animeListDiv.innerHTML = `<h2>${firstList.name}</h2>`;
    firstList.entries.forEach(entry => {
      const media = entry.media;
      const title = media.english || media.romaji || media.native || 'Sconosciuto';
      animeListDiv.innerHTML += `
        <div>
          <img src="${media.coverImage.medium}" alt="${title}" style="height:80px; vertical-align:middle;" />
          <strong>${title}</strong> — Episodi: ${media.episodes || '?'} — Stato: ${entry.status} — Progress: ${entry.progress}
        </div>`;
    });
  } catch (e) {
    statusDiv.textContent = 'Errore caricamento lista: ' + e.message;
  }
}

async function loadUsernameAndAnime() {
  // Recupera token Twitch dall'extension helper o da qualche altro modo
  const twitchToken = window.Twitch ? window.Twitch.ext.viewer.session.token : null;
  if (!twitchToken) {
    statusDiv.textContent = 'Token Twitch non disponibile';
    return;
  }

  try {
    const res = await fetch('/api/get-username', {
      headers: { Authorization: 'Bearer ' + twitchToken }
    });
    const data = await res.json();
    if (data.anilistUsername) {
      fetchAnimeList(data.anilistUsername);
    } else {
      statusDiv.textContent = 'Nessun username AniList associato.';
    }
  } catch (error) {
    statusDiv.textContent = 'Errore recupero username: ' + error.message;
  }
}

loadUsernameAndAnime();
