export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username } = req.body;

  if (!username) return res.status(400).json({ error: "Username mancante" });

  const query = `
    query ($name: String) {
      MediaListCollection(userName: $name, type: ANIME) {
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
    body: JSON.stringify({ query, variables: { name: username } })
  });

  const data = await response.json();
  res.status(200).json({ data });
}
