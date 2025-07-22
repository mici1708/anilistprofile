function saveSettings() {
  const username = document.getElementById('username').value.trim();
  if (!username) return showMessage("⚠️ Inserisci uno username valido.");

  const payload = JSON.stringify({ username });
  window.Twitch.ext.configuration.set('broadcaster', '1', payload);
  console.log("💾 Configurazione salvata:", username);
  showMessage("✅ Username salvato!");
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

function showSavedUsername() {
  const config = window.Twitch.ext.configuration?.broadcaster;
  if (config?.content) {
    try {
      const { username } = JSON.parse(config.content);
      document.getElementById('saved-username').textContent = `🗂️ Username salvato: ${username}`;
      console.log("✅ Configurazione letta:", username);
    } catch (err) {
      console.error("❌ Errore nel parsing:", err);
    }
  } else {
    console.warn("⚠️ Nessuna configurazione disponibile.");
  }
}

window.Twitch.ext.onAuthorized(() => {
  console.log("🟢 Twitch autorizzato");
  // Non leggere la configurazione qui
});

window.Twitch.ext.configuration.onChanged(() => {
  console.log("🔄 Configurazione aggiornata");
  showSavedUsername();
});
