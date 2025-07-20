const btn = document.getElementById('fetch-btn');
const input = document.getElementById('anime-id');
const result = document.getElementById('result');

btn.addEventListener('click', () => {
  const id = parseInt(input.value);
  if (!id) return alert('Inserisci un ID valido');

  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        title { romaji english }
        coverImage { medium }
        description(asHtml: false)
      }
    }`;

  fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { id } })
  })
  .then(res => res.json())
  .then(data => {
    if (data.errors) {
      result.textContent = 'Errore: ' + data.errors[0].message;
    } else {
      const m = data.data.Media;
      result.innerHTML = `
        <h3>${m.title.english || m.title.romaji}</h3>
        <img src="${m.coverImage.medium}" alt="Copertina">
        <p>${m.description?.substring(0, 200)}…</p>
      `;
    }
  })
  .catch(err => result.textContent = 'Errore rete');
});
