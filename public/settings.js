function saveSettings() {
  if (window.Twitch && window.Twitch.ext) {
    const username = document.getElementById('username').value;
    window.Twitch.ext.configuration.set('broadcaster', '1', JSON.stringify({ username }));

    const msg = document.createElement('div');
    msg.textContent = "✅ Username salvato!";
    msg.style.color = "#4ade80"; // verde
    document.body.appendChild(msg);
  } else {
    console.warn("Questa pagina non è in esecuzione nel contesto Twitch.");
  }
}
