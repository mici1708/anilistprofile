export default async function handler(req, res) {
  // ✅ Gestione preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://anilistprofile.vercel.app'); // o '*'
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // ✅ Header CORS per la risposta normale
  res.setHeader('Access-Control-Allow-Origin', 'https://anilistprofile.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const authHeader = req.headers.authorization;
  const { username, userId } = req.body;

  console.log("🔐 Richiesta ricevuta:");
  console.log("Authorization:", authHeader);
  console.log("Username:", username);
  console.log("User ID:", userId);

  res.status(200).json({ success: true, message: "Username ricevuto e salvato." });
}
