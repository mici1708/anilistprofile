const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://anilistprofile.onrender.com',
    'https://extension-files.twitch.tv'
  ],
  credentials: true
}));

app.use(session({ secret: 'segreto', resave: false, saveUninitialized: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Request ricevuta: ${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Twitch JWT keys client
const client = jwksClient({
  jwksUri: 'https://id.twitch.tv/oauth2/keys'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      callback(err, null);
      return;
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Finto database per associare userId Twitch a token AniList
const fakeDB = {}; // { twitchUserId: aniListToken }

async function getAniListTokenFromDB(userId) {
  return fakeDB[userId];
}

// Config AniList OAuth
const CLIENT_ID = '28694';
const CLIENT_SECRET = 'LFwP12ZuNJFhwVVv4GqQttj8UPzMSaGvo8BQg9XV';
const REDIRECT_URI = 'https://anilistprofile.onrender.com/auth/anilist/callback';

app.get('/settings.html', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'settings.html');
  res.sendFile(filePath, err => {
    if (err) {
      console.error('Errore invio settings.html:', err);
      res.status(err.status || 500).end();
    } else {
      console.log('settings.html inviato correttamente');
    }
  });
});

app.get('/auth/anilist', (req, res) => {
  const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`;
  res.redirect(authUrl);
});

app.get('/auth/anilist/callback', async (req, res) => {
  const code = req.query.code;
  console.log('Code ricevuto:', code);

  try {
    const response = await fetch('https://anilist.co/api/v2/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code
      })
    });

    const data = await response.json();

    if (data.access_token) {
      // Qui per ora userId fittizio, va modificato per avere userId reale Twitch (es. da query o sessione)
      const userId = 'finto-userid-twitch'; 

      // Salva nel "DB" la coppia userId -> token AniList
      fakeDB[userId] = data.access_token;

      console.log('✅ Access token ottenuto con successo e salvato per userId:', userId);
      res.redirect('/settings.html');
    } else {
      console.error('❌ Token non ricevuto:', data);
      res.status(400).json({ error: 'Token non ricevuto', details: data });
    }

  } catch (error) {
    console.error('❌ Errore callback:', error);
    res.status(500).json({ error: 'Errore nel callback', details: error });
  }
});

app.get('/api/token', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const twitchToken = authHeader && authHeader.split(' ')[1];

  if (!twitchToken) {
    return res.status(401).json({ error: 'Nessun token Twitch inviato' });
  }

  try {
    const validationRes = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: { Authorization: `OAuth ${twitchToken}` }
    });

    if (!validationRes.ok) {
      const errData = await validationRes.json();
      console.error('Errore validazione token Twitch:', errData);
      return res.status(401).json({ error: 'Token Twitch non valido', details: errData });
    }

    const twitchUser = await validationRes.json();
    const userId = twitchUser.user_id;

    // Recupera il token AniList dal DB in base a userId
    const token = await getAniListTokenFromDB(userId);

    if (!token) {
      return res.status(404).json({ error: 'Token AniList non trovato' });
    }

    res.json({ token });

  } catch (error) {
    console.error('Errore verifica token Twitch:', error);
    res.status(500).json({ error: 'Errore nel controllo token Twitch' });
  }
});


const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server attivo su http://localhost:${PORT}`));
