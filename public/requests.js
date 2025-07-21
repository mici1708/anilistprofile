export async function setUsername(username, token) {
  const response = await fetch('https://anilistprofile.onrender.com/api/set-username', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ username })
  });

  if (!response.ok) throw new Error('Errore nel salvataggio');
  return response.json();
}

export async function getUsername(token) {
  const response = await fetch('https://anilistprofile.onrender.com/api/get-username', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) throw new Error('Errore nel recupero username');
  const data = await response.json();
  return data.anilistUsername;
}

export async function fetchAniListData(username) {
  const response = await fetch(`https://anilistprofile.onrender.com/api/anilist/${username}`);
  if (!response.ok) throw new Error('Errore nel recupero dati AniList');
  return await response.json();
}
