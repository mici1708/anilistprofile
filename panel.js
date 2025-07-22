function waitForTwitchSDK(callback, retries = 20) {
  if (window.Twitch && window.Twitch.ext) {
    console.log("✅ [Browser] Twitch SDK disponibile");
    callback();
  } else if (retries > 0) {
    console.warn("⏳ [Browser] Twitch SDK non ancora disponibile, ritento...");
    setTimeout(() => waitForTwitchSDK(callback, retries - 1), 250);
  } else {
    console.error("❌ [Browser] Twitch SDK non disponibile dopo vari tentativi");
    document.getElementById('animeList').textContent = 'Twitch SDK non disponibile';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  waitForTwitchSDK(() => {
    window.Twitch.ext.onAuthorized(auth => {
      console.log("🔐 [Browser] Viewer authorized:", auth);

      fetch('https://anilistprofile.onrender.com/get-anilist')
        .then(res => res.json())
        .then(response => {
          console.log("📦 [Browser] Dati ricevuti:", response);

          const container = document.getElementById('animeList');
          container.innerHTML = '';

          const lists = response?.data?.data?.MediaListCollection?.lists;
          if (!Array.isArray(lists) || lists.length === 0) {
            container.textContent = '⚠️ Nessuna lista trovata.';
            return;
          }

          lists.forEach(list => {
            if (!Array.isArray(list.entries) || list.entries.length === 0) return;

            // 🏷️ Crea intestazione per la lista (es. Completed, Watching)
            const sectionTitle = document.createElement('h3');
            sectionTitle.textContent = list.name;
            sectionTitle.className = 'list-title';
            container.appendChild(sectionTitle);

            list.entries.forEach(entry => {
              const media = entry.media;
              if (!media || !media.title || !media.coverImage) return;

              const title = media.title.english || media.title.romaji || 'Untitled';
              const img = media.coverImage.large || '';

              const div = document.createElement('div');
              div.className = 'anime';
              div.innerHTML = `
                <div style="margin-bottom:10px;">
                  <img src="${img}" alt="${title}" style="height:100px; vertical-align:middle; margin-right:10px;">
                  <span><strong>${title}</strong></span>
                </div>
              `;
              container.appendChild(div);
            });
          });
        })
        .catch(err => {
          console.error("❌ [Browser] Errore nel caricamento:", err);
          document.getElementById('animeList').textContent = 'Failed to load anime list';
        });
    });
  });
});
