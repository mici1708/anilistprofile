export default async function handler(req, res) {
  // ✅ Gestione preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://anilistprofile.vercel.app'); // o '*'
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // ✅ Header CORS per la risposta normale
  res.setHeader('Access-Control-Allow-Origin', 'https://anilistprofile.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { name: username } })
    });

    const data = await response.json();
    res.status(200).json({ data });
  } catch (err) {
    console.error("❌ Errore nella chiamata a AniList:", err);
    res.status(500).json({ error: "Errore nel server" });
  }
}
