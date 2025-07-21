let authToken = null;

Twitch.ext.onAuthorized(auth => {
  authToken = auth.token;
});

document.getElementById("save").addEventListener("click", () => {
  const anilistUser = document.getElementById("anilistUser").value.trim();

  if (!anilistUser) {
    document.getElementById("status").textContent = "Inserisci un nome utente valido.";
    return;
  }

  Twitch.ext.configuration.set("broadcaster", "1", JSON.stringify({ anilistUser }));
  document.getElementById("status").textContent = "Salvato con successo!";
});
