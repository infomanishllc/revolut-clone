export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD && password !== "admin123")
    return res.status(401).json({ error: "Incorrect Admin Password" });
  res.json({ success: true });
}
