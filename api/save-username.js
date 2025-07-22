export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers.authorization;
  const { username, userId } = req.body;

  console.log("🔐 Richiesta ricevuta:");
  console.log("Authorization:", authHeader);
  console.log("Username:", username);
  console.log("User ID:", userId);

  res.status(200).json({ success: true, message: "Username ricevuto e salvato." });
}
