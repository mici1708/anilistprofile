let token = '';
let userId = '';

window.Twitch.ext.onAuthorized(auth => {
  token = auth.token;
  userId = auth.userId;
  console.log("🔐 [Browser] Twitch authorized:", auth);
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  console.log(`📤 [Browser] Invio username: ${username}`);

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
    document.getElementById('status').textContent = 'Username saved!';
  })
  .catch(err => {
    console.error("❌ [Browser] Errore nel salvataggio:", err);
    document.getElementById('status').textContent = 'Failed to save username';
  });
});
