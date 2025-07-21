const input = document.getElementById('usernameInput');
const saveBtn = document.getElementById('saveBtn');
const statusDiv = document.getElementById('status');

// Carica username salvato (localStorage)
input.value = localStorage.getItem('anilistUsername') || '';

saveBtn.addEventListener('click', () => {
  const username = input.value.trim();
  if (!username) {
    statusDiv.textContent = 'Inserisci un username valido.';
    statusDiv.style.color = 'red';
    return;
  }

  // Puoi fare una semplice verifica che username esista su AniList
  fetch(`/api/anilist/${encodeURIComponent(username)}`)
    .then(res => {
      if (!res.ok) throw new Error('Utente non trovato');
      return res.json();
    })
    .then(() => {
      localStorage.setItem('anilistUsername', username);
      statusDiv.textContent = 'Username salvato con successo!';
      statusDiv.style.color = 'green';
    })
    .catch(() => {
      statusDiv.textContent = 'Errore: username non trovato su AniList.';
      statusDiv.style.color = 'red';
    });
});
