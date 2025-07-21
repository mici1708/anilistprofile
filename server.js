const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const userDatabase = {}; // Twitch user_id => AniList username

// ✅ Salva lo username da settings
app.post('/api/set-username', (req, res) => {
  const { username } = req.body;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token mancante' });

  verifyTwitchToken(token)
    .then(user_id => {
      userDatabase[user_id] = username;
      res.json({ message: 'Username salvato con successo' });
    })
    .catch(err => res.status(401).json({ error: err.message }));
});

// ✅ Recupera lo username per l’utente autenticato
app.get('/api/get-username', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token mancante' });

  verifyTwitchToken(token)
    .then(user_id => {
      const username = userDatabase[user_id];
      if (!username) return res.status(404).json({ error: 'Username non trovato' });
      res.json({ anilistUsername: username });
    })
    .catch(err => res.status(401).json({ error: err.message }));
});

// ✅ Recupera dati AniList
app.get('/api/anilist/:username', async (req, res) => {
  const username = req.params.username;
  try {
    const query = `
      query {
        MediaListCollection(userName: "${username}", type: ANIME, status: CURRENT) {
          lists {
            name
            entries {
              media {
                title { romaji }
              }
            }
          }
        }
      }
    `;
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero dati AniList' });
  }
});

// ✅ Funzione per verificare (o simulare) token Twitch
function verifyTwitchToken(token) {
  const isTesting = true; // Imposta a false per produzione

  if (isTesting) {
    return Promise.resolve('123456'); // user_id simulato
  }

  return fetch('https://id.twitch.tv/oauth2/validate', {
    headers: { Authorization: `OAuth ${token}` }
  }).then(res => {
    if (!res.ok) throw new Error('Token Twitch non valido');
    return res.json();
  }).then(data => data.user_id);
}

app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});
