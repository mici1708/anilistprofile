const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Middleware CORS dinamico per Twitch
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.endsWith('.ext-twitch.tv')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.static('.')); // Serve i file frontend dal root

app.post('/save-username', (req, res) => {
  const authHeader = req.headers.authorization;
  const { username, userId } = req.body;

  console.log("🔐 Richiesta ricevuta:");
  console.log("Authorization:", authHeader);
  console.log("Username:", username);
  console.log("User ID:", userId);

  res.json({ success: true, message: "Username ricevuto e salvato." });
});

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
