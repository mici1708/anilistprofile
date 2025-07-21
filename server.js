const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

// Abilita CORS
app.use(cors());

// Serve tutti i file statici dalla stessa cartella di server.js
app.use(express.static(path.join(__dirname)));

app.use(session({
  secret: 'anilist-secret',
  resave: false,
  saveUninitialized: true
}));

// Route di fallback per test
app.get('/', (req, res) => {
  res.send('Estensione Twitch attiva!');
});

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
