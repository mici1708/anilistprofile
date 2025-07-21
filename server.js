const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const userDatabase = {}; // Twitch user_id => AniList username

// Funzione di debug per stampare info richieste
function logRequest(req) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.method === 'POST') console.log('Body:', req.body);
}

// ✅ Salva lo username da settings
app.post('/api/set-username', (req, res) => {
  logRequest(req);

  const { username } = req.body;
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Header Authorization mancante' });

  // Authorization: Bearer <token>
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Header Authorization malformato' });
  }
  const token = parts[1];

  if (!username) return res.status(400).json({ error: 'Username mancante' });

  verifyTwitchToken(token)
    .then(user_id => {
      userDatabase[user_id] = username;
      console.log(`Salvato username AniList: ${username} per user_id Twitch: ${user_id}`);
      res.json({ message: 'Username salvato con successo' });
    })
    .catch(err => {
      console.error('Errore verifica token:', err);
      res.status(401).json({ error: err.message });
    });
});

// ✅ Recupera lo username per l’utente autenticato
app.get('/api/get-username', (req, res) => {
  logRequest(req);

  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Header Authorization mancante' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Header Authorization malformato' });
  }
  const token = parts[1];

  verifyTwitchToken(token)
    .then(user_id => {
      const username = userDatabase[user_id];
      if (!username) return res.status(404).json({ error: 'Username non trovato' });
      res.json({ anilistUsername: username });
    })
    .catch(err => {
      console.error('Errore verifica token:', err);
      res.status(401).json({ error: err.message });
    });
});

// ✅ Recupera dati AniList
app.get('/api/anilist/:username', async (req, res) => {
  logRequest(req);

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
    console.error('Errore fetch AniList:', err);
    res.status(500).json({ error: 'Errore nel recupero dati AniList' });
  }
});

// ✅ Funzione per verificare (o simulare) token Twitch
function verifyTwitchToken(token) {
  const isTesting = true; // Imposta a false per produzione

  if (isTesting) {
    console.log('Token Twitch simulato accettato:', token);
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
