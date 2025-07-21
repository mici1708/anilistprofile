const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

app.use(session({ secret: 'segreto', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));

const CLIENT_ID = 'IL_TUO_CLIENT_ID_ANILIST';
const REDIRECT_URI = 'https://anilistprofile.onrender.com/auth/anilist/callback';

app.get('/auth/anilist', (req, res) => {
  const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`;
  res.redirect(authUrl);
});

app.get('/auth/anilist/callback', async (req, res) => {
  const code = req.query.code;
  const response = await fetch('https://anilist.co/api/v2/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: 'IL_TUO_CLIENT_SECRET_ANILIST',
      redirect_uri: REDIRECT_URI,
      code
    })
  });

  const data = await response.json();
  req.session.token = data.access_token;
  res.redirect('/settings.html');
});

app.get('/api/token', (req, res) => {
  if (req.session.token) {
    res.json({ token: req.session.token });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server attivo su ${PORT}`));
