const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');

const app = express();

// ✅ Abilita CORS solo per le origini consentite (sviluppo + Twitch)
app.use(cors({
  origin: [
    'http://localhost:3000', // sviluppo locale
    'https://anilistprofile.onrender.com', // il tuo server pubblico
    'https://extension-files.twitch.tv' // Twitch extension runtime
  ],
  credentials: true
}));

// ✅ Middleware
app.use(session({ secret: 'segreto', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 🔒 Aggiungi le tue chiavi reali qui
const CLIENT_ID = '28694';
const CLIENT_SECRET = 'LFwP12ZuNJFhwVVv4GqQttj8UPzMSaGvo8BQg9XV';
const REDIRECT_URI = 'https://anilistprofile.onrender.com/auth/anilist/callback';

// 🌐 Redirect al login AniList
app.get('/auth/anilist', (req, res) => {
  const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`;
  res.redirect(authUrl);
});

// 🔁 Callback dopo il login
app.get('/auth/anilist/callback', async (req, res) => {
  const code = req.query.code;

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
      req.session.token = data.access_token;
      res.redirect('/settings.html');
    } else {
      res.status(400).json({ error: 'Token non ricevuto', details: data });
    }

  } catch (error) {
    res.status(500).json({ error: 'Errore nel callback', details: error });
  }
});

// 🪪 API per ottenere il token da frontend
app.get('/api/token', (req, res) => {
  if (req.session.token) {
    res.json({ token: req.session.token });
  } else {
    res.status(401).json({ error: 'Utente non autenticato' });
  }
});

// 🚀 Avvio server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server attivo su ${PORT}`));
