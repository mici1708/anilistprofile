let token = '';
let userId = '';

const twitch = window.Twitch.ext;

twitch.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;
  console.log("🟢 Twitch autorizzato. Token ricevuto:", token);
});

twitch.configuration.onChanged(() => {
  setTimeout(() => {
    showSavedUsername();
  }, 500);
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('save-btn').addEventListener('click', saveSettings);
  document.getElementById('reset-btn').addEventListener('click', resetSettings);
});

function saveSettings() {
  const username = document.getElementById('username').value.trim();
  if (!username) return showMessage("⚠️ Inserisci uno username valido.");

  const payload = JSON.stringify({ username });

  // ✅ Salva su Twitch Configuration Service
  twitch.configuration.set('broadcaster', '1', payload);
  
  console.log("💾 Configurazione Twitch salvata:", username);
  showMessage("✅ Username salvato su Twitch!");

  // ✅ Invia anche al tuo server Node.js
	fetch('https://anilistprofile.vercel.app/api/save-username', {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + token
	  },
	  body: JSON.stringify({ username, userId })
	})

    .then(res => res.json())
    .then(data => {
      console.log("📨 Risposta dal server:", data);
      showMessage("✅ Username salvato anche sul server!");
    })
    .catch(err => {
      console.error("❌ Errore nel salvataggio server:", err);
      showMessage("❌ Errore nel salvataggio sul server.");
    });
}

function resetSettings() {
  twitch.configuration.set('broadcaster', '1', "");
  console.log("🧹 Configurazione Twitch resettata.");
  showMessage("🧹 Configurazione cancellata.");
  document.getElementById('saved-username').textContent = "";
  document.getElementById('raw-config').textContent = "";
}

function showSavedUsername() {
  const config = twitch.configuration?.broadcaster;
  console.log("📋 Config Twitch:", config);

  if (config?.content) {
    document.getElementById('raw-config').textContent = config.content;

    try {
      const { username } = JSON.parse(config.content);
      document.getElementById('saved-username').textContent = `🗂️ Username salvato: ${username}`;
      showMessage(`✅ Configurazione letta: ${username}`);
    } catch (err) {
      console.error("❌ Errore nel parsing:", err);
      showMessage("❌ Errore nel parsing configurazione.");
    }
  } else {
    console.warn("⚠️ Nessuna configurazione disponibile.");
    showMessage("⚠️ Nessuna configurazione disponibile.");
    document.getElementById('raw-config').textContent = "(vuoto)";
  }
}

function showMessage(text) {
  const msg = document.createElement('div');
  msg.textContent = text;
  msg.style.position = 'fixed';
  msg.style.bottom = '20px';
  msg.style.left = '50%';
  msg.style.transform = 'translateX(-50%)';
  msg.style.backgroundColor = '#9146FF';
  msg.style.color = '#fff';
  msg.style.padding = '10px 20px';
  msg.style.borderRadius = '6px';
  msg.style.fontSize = '14px';
  msg.style.zIndex = '9999';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}
