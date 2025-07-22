const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.')); // Serve i file frontend dal root

app.post('/get-anilist', async (req, res) => {
  const { username } = req.body;

  console.log("📥 Richiesta ricevuta da client:");
  console.log("👤 Username:", username);

  if (!username) {
    console.warn("⚠️ Nessuno username fornito.");
    return res.status(400).json({ error: "Username mancante" });
  }

  try {
    const query = `
      query ($name: String) {
        MediaListCollection(userName: $name, type: ANIME) {
          lists {
            name
            entries {
              media {
                title {
                  romaji
                  english
                }
                coverImage {
                  large
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { name: username } })
    });

    const data = await response.json();

    console.log("📦 Risposta da AniList:");
    console.dir(data, { depth: null });

    res.json({ data });
  } catch (err) {
    console.error("❌ Errore nella chiamata a AniList:", err);
    res.status(500).json({ error: "Errore nel server" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});
