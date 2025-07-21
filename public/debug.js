const container = document.getElementById('anime-list');
container.innerHTML = 'Caricamento dati...';

const username = "mici1708"; // 👉 Username fisso per test

fetch('https://anilistprofile.onrender.com/get-anilist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username })
})
  .then(res => res.json())
  .then(data => {
    console.log("📦 Risposta simulata:", data);
    container.innerHTML = '';

    const lists = data?.data?.MediaListCollection?.lists;
    if (!lists || lists.length === 0) {
      container.innerHTML = '⚠️ Nessuna lista trovata.';
      return;
    }

    lists.forEach(list => {
      const title = document.createElement('h3');
      title.textContent = list.name;
      container.appendChild(title);

      list.entries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'anime-entry';
        item.innerHTML = `
          <img src="${entry.media.coverImage.large}" width="80" />
          <span class="anime-title">${entry.media.title.romaji || entry.media.title.english}</span>
        `;
        container.appendChild(item);
      });
    });
  })
  .catch(err => {
    console.error("❌ Errore nella chiamata:", err);
    container.innerHTML = '❌ Errore nel caricamento.';
  });
