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

          let count = 0;

          for (const list of lists) {
            if (!Array.isArray(list.entries)) continue;

            for (const entry of list.entries) {
              const media = entry.media;
              if (!media || !media.title || !media.coverImage) continue;

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
              count++;
            }
          }

          if (count === 0) {
            container.textContent = '⚠️ Nessun anime da mostrare.';
          }
        })
        .catch(err => {
          console.error("❌ [Browser] Errore nel caricamento:", err);
          document.getElementById('animeList').textContent = 'Failed to load anime list';
        });
    });
  });
});
