window.Twitch.ext.onAuthorized(auth => {
  console.log("🔐 [Browser] Viewer authorized:", auth);

  fetch('https://anilistprofile.onrender.com/get-anilist')
    .then(res => res.json())
    .then(({ data }) => {
      console.log("📦 [Browser] Dati ricevuti:", data);
      const container = document.getElementById('animeList');
      container.innerHTML = '';

      if (!data || !data.MediaListCollection) {
        container.textContent = 'No data found.';
        return;
      }

      data.MediaListCollection.lists.forEach(list => {
        list.entries.forEach(entry => {
          const media = entry.media;
          const title = media.title.english || media.title.romaji;
          const img = media.coverImage.large;

          const div = document.createElement('div');
          div.className = 'anime';
          div.innerHTML = `<img src="${img}" alt="${title}"><strong>${title}</strong>`;
          container.appendChild(div);
        });
      });
    })
    .catch(err => {
      console.error("❌ [Browser] Errore nel caricamento:", err);
      document.getElementById('animeList').textContent = 'Failed to load anime list';
    });
});
