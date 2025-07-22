const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ CORS per Twitch Extensions
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
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Salva username dello streamer
let storedUsername = '';

app.post('/save-username', (req, res) => {
  const { username, userId } = req.body;
  console.log(`💾 [Node] Username ricevuto: ${username} da userId: ${userId}`);
  storedUsername = username;
  res.json({ success: true });
});

// ✅ Restituisce lista anime dello streamer
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
    res.status(500).json({ error: "Errore nel server" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [Node] Server avviato su http://localhost:${PORT}`);
});
