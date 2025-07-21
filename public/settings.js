function saveSettings() {
  if (window.Twitch && window.Twitch.ext) {
    const username = document.getElementById('username').value;
    window.Twitch.ext.configuration.set('broadcaster', '1', JSON.stringify({ username }));
    alert('Username salvato!');
  } else {
    alert("Questa pagina deve essere caricata all'interno di Twitch per funzionare.");
  }
}
