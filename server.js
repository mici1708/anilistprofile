require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();  // <-- qui UNA SOLA VOLTA

app.use(cors());

app.get('/test', (req, res) => {
  res.send('Server funzionante!');
});

app.listen(3000, () => {
  console.log('Server avviato su http://localhost:3000');
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
    res.redirect(`https://mici1708.github.io/anilistprofile/panel.html?token=${access_token}`);
  } catch (error) {
    res.status(500).send('Errore login');
  }
});


app.get('/list', async (req, res) => {
  const token = req.headers.authorization;
  try {
    const response = await axios.post(
      'https://graphql.anilist.co',
      {
        query: `
          query {
            Viewer {
              name
              animeList: mediaListCollection(type: ANIME) {
                lists {
                  name
                  entries {
                    media {
                      id
                      title { romaji english }
                      coverImage { medium }
                    }
                  }
                }
              }
            }
          }
        `
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recuperare la lista' });
  }
});
