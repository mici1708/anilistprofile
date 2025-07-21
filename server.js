import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const PORT = process.env.PORT || 10000;

app.post('/get-anilist', async (req, res) => {
  const { username } = req.body;

  const query = `
    query ($username: String) {
      MediaListCollection(userName: $username, type: ANIME) {
        lists {
          name
          entries {
            media {
              title {
                romaji
                english
              }
              coverImage {
                large
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { username } })
  });

  const data = await response.json();
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
