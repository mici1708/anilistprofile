let token = ''
let userId = '';

function waitForTwitchSDK(callback, retries = 20) {
  if (window.Twitch && window.Twitch.ext) {
    console.log("✅ [Browser] Twitch SDK disponibile");
    callback();
  } else if (retries > 0) {
    console.warn("⏳ [Browser] Twitch SDK non ancora disponibile, ritento...");
    setTimeout(() => waitForTwitchSDK(callback, retries - 1), 250);
  } else {
    console.error("❌ [Browser] Twitch SDK non disponibile dopo vari tentativi");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  waitForTwitchSDK(() => {
    window.Twitch.ext.onAuthorized(auth => {
      token = auth.token;
      userId = auth.userId;
      console.log("🔐 [Browser] Twitch authorized:", auth);
    });
  });

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
