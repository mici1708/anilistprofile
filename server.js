require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors()); // abilita CORS per tutte le rotte

app.get('/test', (req, res) => {
  res.send('Server funzionante!');
});

app.get('/auth/login', (req, res) => {
  const url = `https://anilist.co/api/v2/oauth/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}`;
  res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const response = await axios.post('https://anilist.co/api/v2/oauth/token', {
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      code,
    });
    const { access_token } = response.data;
    console.log("Token ricevuto:", access_token);
    res.redirect(`https://mici1708.github.io/anilistprofile/panel.html?token=${access_token}`);
  } catch (error) {
    console.error("Errore login AniList:", error.response?.data || error.message);
    res.status(500).send('Errore login');
  }
});

app.get('/list', async (req, res) => {
  const rawAuth = req.headers.authorization;
  const token = rawAuth?.startsWith("Bearer ") ? rawAuth.split(' ')[1] : rawAuth;

  if (!token) {
    return res.status(401).json({ error: 'Token mancante' });
  }

  try {
    // Step 1 – Ottieni l'userId
    const viewerRes = await axios.post(
      'https://graphql.anilist.co',
      {
        query: `
          query {
            Viewer {
              id
              name
            }
          }
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const userId = viewerRes.data.data.Viewer.id;

    // Step 2 – Ottieni la lista dell’utente
    const listRes = await axios.post(
      'https://graphql.anilist.co',
      {
        query: `
          query {
            MediaListCollection(userId: ${userId}, type: ANIME) {
              lists {
                name
                entries {
                  media {
                    id
                    title {
                      romaji
                      english
                    }
                    coverImage {
                      medium
                    }
                  }
                }
              }
            }
          }
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(listRes.data.data);
  } catch (err) {
    console.error('Errore nel backend:', err.response?.data || err.message);
    res.status(500).json({ error: 'Errore nel recuperare la lista' });
  }
});

app.listen(3000, () => {
  console.log('✅ Server avviato su http://localhost:3000');
});
