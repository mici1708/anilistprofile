function saveSettings() {
  if (window.Twitch && window.Twitch.ext) {
    const username = document.getElementById('username').value;
    window.Twitch.ext.configuration.set('broadcaster', '1', JSON.stringify({ username }));
    showMessage("✅ Username salvato con successo!");
  } else {
    console.warn("Questa pagina non è in esecuzione nel contesto Twitch.");
    showMessage("⚠️ Devi caricare l'estensione tramite Twitch per testare.");
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

  setTimeout(() => {
    msg.remove();
  }, 3000);
}
