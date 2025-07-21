const saveBtn = document.getElementById('saveBtn');
const usernameInput = document.getElementById('usernameInput');
const statusDiv = document.getElementById('status');

// Ottieni token Twitch (puoi usare Twitch Extension Helper o passarlo da panel)
const twitchToken = window.Twitch ? window.Twitch.ext.viewer.session.token : null;

saveBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  if (!username) {
    statusDiv.textContent = 'Inserisci username AniList';
    return;
  }
  if (!twitchToken) {
    statusDiv.textContent = 'Token Twitch non disponibile';
    return;
  }

  // Ottieni userId da Twitch API validate
  try {
    const validateRes = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: { Authorization: `OAuth ${twitchToken}` }
    });
    if (!validateRes.ok) throw new Error('Token Twitch non valido');

    const validateData = await validateRes.json();
    const twitchUserId = validateData.user_id;

    // Salva al backend
    const saveRes = await fetch('/api/save-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ twitchUserId, anilistUsername: username })
    });
    const saveData = await saveRes.json();
    if (saveData.success) {
      statusDiv.textContent = 'Username salvato con successo!';
    } else {
      statusDiv.textContent = 'Errore salvataggio username.';
    }
  } catch (error) {
    statusDiv.textContent = 'Errore: ' + error.message;
  }
});
