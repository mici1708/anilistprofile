import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
