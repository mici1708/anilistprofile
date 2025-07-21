function saveSettings() {
  const username = document.getElementById('username').value;
  window.Twitch.ext.configuration.set('broadcaster', '1', JSON.stringify({ username }));
  alert('Username salvato!');
}
