function saveSettings() {
  const username = document.getElementById('username').value.trim();

  if (!username) {
    showMessage("⚠️ Inserisci uno username valido.");
    return;
  }

  if (window.Twitch && window.Twitch.ext) {
    window.Twitch.ext.configuration.set('broadcaster', '1', JSON.stringify({ username }));
    console.log("Configurazione salvata:", username);
    showMessage("✅ Username salvato!");
  } else {
    showMessage("⚠️ Devi aprire questa pagina dentro Twitch.");
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

function showSavedUsername() {
  const config = window.Twitch?.ext?.configuration?.broadcaster;
  if (config?.content) {
    try {
      const { username } = JSON.parse(config.content);
      const label = document.createElement('div');
      label.textContent = `🗂️ Username salvato: ${username}`;
      label.style.marginTop = "1rem";
      label.style.color = "#10b981";
      document.body.appendChild(label);
    } catch (err) {
      console.warn("Errore nel parsing:", err);
    }
  }
}

window.Twitch.ext.onAuthorized(() => {
  showSavedUsername();
});
