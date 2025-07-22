let token = '';
let userId = '';

function initTwitch() {
  if (window.Twitch && window.Twitch.ext) {
    console.log("✅ [Browser] Twitch SDK disponibile");

    window.Twitch.ext.onAuthorized(auth => {
      token = auth.token;
      userId = auth.userId;
      console.log("🔐 [Browser] Twitch authorized:", auth);
    });
  } else {
    console.warn("⚠️ [Browser] Twitch SDK non disponibile. Sei fuori da Hosted Test?");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTwitch();

  const saveBtn = document.getElementById('saveBtn');
  const usernameInput = document.getElementById('username');
  const statusText = document.getElementById('status');

  saveBtn.addEventListener('click', () => {
    const username = usernameInput.value;
    console.log(`📤 [Browser] Invio username: ${username}`);

    if (!username) {
      statusText.textContent = '⚠️ Inserisci un username';
      return;
    }

    fetch('https://anilistprofile.onrender.com/save-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ username, userId })
    })
    .then(res => res.json())
    .then(data => {
      console.log("✅ [Browser] Username salvato:", data);
      statusText.textContent = 'Username saved!';
    })
    .catch(err => {
      console.error("❌ [Browser] Errore nel salvataggio:", err);
      statusText.textContent = 'Failed to save username';
    });
  });
});
