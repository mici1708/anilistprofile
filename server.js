const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ CORS flessibile per Twitch Hosted Test
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      undefined,
      null,
      '',
      'https://localhost.twitch.tv',
      'https://supervisor.ext-twitch.tv',
      'https://extension-files.twitch.tv'
    ];
    if (!origin || origin.endsWith('.ext-twitch.tv') || allowed.includes(origin)) {
      console.log(`✅ [Node] Origin consentito: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`🚫 [Node] Origin bloccato: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Salva username dello streamer
let storedUsername = '';

app.post('/save-username', (req, res) => {
  try {
    const { username, userId } = req.body;

    if (!username || !userId) {
      console.warn("⚠️ [Node] Dati mancanti:", req.body);
      return res.status(400).json({ error: "Missing username or userId" });
    }

    console.log(`💾 [Node] Username ricevuto: ${username} da userId: ${userId}`);
    storedUsername = username;
    res.json({ success: true, message: "Username salvato correttamente" });
  } catch (err) {
    console.error("❌ [Node] Errore interno:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

// ✅ Restituisce lista anime da AniList
app.get('/get-anilist', async (req, res) => {
  console.log(`📡 [Node] Richiesta lista anime per: ${storedUsername}`);
  if (!storedUsername) return res.status(400).json({ error: "Username non configurato" });

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
      body: JSON.stringify({ query, variables: { name: storedUsername } })
    });

    const data = await response.json();
    console.log(`📦 [Node] Risposta AniList ricevuta per ${storedUsername}`);
    res.json({ data });
  } catch (err) {
    console.error('❌ [Node] Errore nella chiamata a AniList:', err);
    res.status(500).json({ error: "Errore nel server AniList" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [Node] Server avviato su http://localhost:${PORT}`);
});
