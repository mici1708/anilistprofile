import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In cima al file
const userDatabase = {}; // { twitchUserId: anilistUsername }

// Endpoint per salvare username (usato da settings.js)
app.post('/api/save-username', (req, res) => {
  const { twitchUserId, anilistUsername } = req.body;
  if (!twitchUserId || !anilistUsername) {
    return res.status(400).json({ error: 'Dati mancanti' });
  }
  userDatabase[twitchUserId] = anilistUsername;
  console.log(`Salvato username AniList per Twitch user ${twitchUserId}: ${anilistUsername}`);
  res.json({ success: true });
});

// Endpoint per recuperare username (usato da panel.js)
app.get('/api/get-username', (req, res) => {
  const authHeader = req.headers['authorization'];
  const twitchToken = authHeader && authHeader.split(' ')[1];
  if (!twitchToken) {
    return res.status(401).json({ error: 'Nessun token Twitch' });
  }
  // verifica token Twitch
  fetch('https://id.twitch.tv/oauth2/validate', {
    headers: { Authorization: `OAuth ${twitchToken}` }
  }).then(r => {
    if (!r.ok) throw new Error('Token Twitch non valido');
    return r.json();
  }).then(data => {
    const twitchUserId = data.user_id;
    const anilistUsername = userDatabase[twitchUserId];
    if (!anilistUsername) return res.status(404).json({ error: 'Username AniList non trovato' });
    res.json({ anilistUsername });
  }).catch(err => {
    res.status(401).json({ error: err.message });
  });
});


const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/anilist/:username', async (req, res) => {
  const username = req.params.username;

  const query = `
    query ($userName: String) {
      MediaListCollection(userName: $userName, type: ANIME) {
        lists {
          name
          entries {
            media {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                medium
              }
              episodes
              status
            }
            status
            score
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { userName: username } })
    });

    const data = await response.json();

    if (data.errors) {
      return res.status(404).json({ error: 'Utente non trovato o dati non accessibili' });
    }

    res.json(data.data.MediaListCollection);

  } catch (error) {
    console.error('Errore fetching AniList:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});
