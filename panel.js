async function getAniListData() {
  try {
    const res = await fetch('/api/token');
    const { token } = await res.json();

    const userRes = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          query {
            Viewer {
              name
              avatar { large }
            }
          }
        `
      })
    });

    const { data } = await userRes.json();
    document.getElementById('anilist-info').innerHTML = `
      <h2>${data.Viewer.name}</h2>
      <img src="${data.Viewer.avatar.large}" width="100" />
    `;
  } catch (err) {
    document.getElementById('anilist-info').innerText = 'Errore nel caricamento.';
  }
}

document.addEventListener('DOMContentLoaded', getAniListData);
