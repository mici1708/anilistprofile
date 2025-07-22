const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ CORS dinamico per Twitch Extensions
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.endsWith('.ext-twitch.tv')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

app.use(express.json());

// ✅ Serve i file statici (frontend Twitch)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Salva username Twitch
app.post('/save-username', (req, res) => {
  const authHeader = req.headers.authorization;
  const { username, userId } = req.body;

  console.log("🔐 Richiesta ricevuta:");
  console.log("Authorization:", authHeader);
  console.log("Username:", username);
  console.log("User ID:", userId);

  res.json({ success: true, message: "Username ricevuto e salvato." });
});

// ✅ Ottieni lista anime da AniList
app.post('/get-anilist', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username mancante" });
  }

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

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { name: username } })
    });

    const data = await response.json();
    res.json({ data });
  } catch (err) {
    console.error("❌ Errore nella chiamata a AniList:", err);
    res.status(500).json({ error: "Errore nel server" });
  }
});

// ✅ Avvio server
app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});
