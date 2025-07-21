function fetchAniList(anilistUser) {
  fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query {
          MediaListCollection(userName: "${anilistUser}", type: ANIME) {
            lists {
              name
              entries {
                media {
                  title {
                    romaji
                  }
                }
              }
            }
          }
        }
      `
    })
  })
    .then(res => res.json())
    .then(data => {
      const result = document.getElementById("result");
      result.innerHTML = "";

      if (!data.data || !data.data.MediaListCollection) {
        result.textContent = "Nessun dato trovato.";
        return;
      }

      data.data.MediaListCollection.lists.forEach(list => {
        const title = document.createElement("h3");
        title.textContent = list.name;
        result.appendChild(title);

        list.entries.forEach(entry => {
          const item = document.createElement("div");
          item.textContent = "• " + entry.media.title.romaji;
          result.appendChild(item);
        });
      });
    })
    .catch(error => {
      console.error("Errore AniList:", error);
      document.getElementById("result").textContent = "Errore durante il caricamento.";
    });
}

function loadFromTwitch() {
  Twitch.ext.onAuthorized(() => {
    Twitch.ext.configuration.onChanged(() => {
      const config = Twitch.ext.configuration.broadcaster;
      if (config && config.content) {
        try {
          const { anilistUser } = JSON.parse(config.content);
          if (anilistUser) fetchAniList(anilistUser);
          else document.getElementById("result").textContent = "Utente non configurato.";
        } catch (e) {
          console.error("Errore parsing config:", e);
        }
      }
    });
  });
}

// Fallback debug: browser senza Twitch
if (typeof Twitch !== "undefined" && Twitch.ext) {
  loadFromTwitch();
} else {
  console.log("DEBUG MODE: Browser senza Twitch");
  fetchAniList("Gigguk"); // <-- Cambia con un utente reale per test locale
}
