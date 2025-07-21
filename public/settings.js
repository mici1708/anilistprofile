function saveSettings() {
  const username = document.getElementById('username').value.trim();

  if (!username) {
    showMessage("⚠️ Inserisci uno username valido.");
    return;
  }

  if (window.Twitch && window.Twitch.ext) {
    window.Twitch.ext.configuration.set('broadcaster', '1', JSON.stringify({ username }));
    console.log("Configurazione inviata:", JSON.stringify({ username }));
    showMessage("✅ Username salvato!");
  } else {
    showMessage("⚠️ Devi testare l'estensione dentro Twitch.");
  }
}

function showSavedUsername() {
  if (window.Twitch && window.Twitch.ext) {
    const config = window.Twitch.ext.configuration?.broadcaster;
    if (config && config.content) {
      try {
        const { username } = JSON.parse(config.content);
        const display = document.createElement('div');
        display.textContent = `🗂️ Username salvato: ${username}`;
        display.style.color = "#10b981"; // verde
        display.style.marginTop = "1rem";
        display.style.fontSize = "1rem";
        document.body.appendChild(display);
      } catch (err) {
        console.warn("Errore nel parsing configurazione:", err);
      }
    } else {
      console.log("Nessuna configurazione disponibile.");
    }
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
