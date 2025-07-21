window.Twitch.ext.onAuthorized(async (auth) => {
  window.Twitch.ext.configuration.onChanged(() => {
    const config = window.Twitch.ext.configuration.broadcaster;
    if (config && config.content) {
      const { username } = JSON.parse(config.content);
      fetch('https://your-server-url.com/get-anilist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
        .then(res => res.json())
        .then(data => {
          const container = document.getElementById('anime-list');
          container.innerHTML = '';
          data.data.MediaListCollection.lists.forEach(list => {
            const title = document.createElement('h3');
            title.textContent = list.name;
            container.appendChild(title);
            list.entries.forEach(entry => {
              const item = document.createElement('div');
              item.innerHTML = `
                <img src="${entry.media.coverImage.large}" width="80">
                ${entry.media.title.romaji || entry.media.title.english}
              `;
              container.appendChild(item);
            });
          });
        });
    }
  });
});
