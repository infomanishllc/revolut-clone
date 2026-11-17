import { getUsers, setUsers } from "../_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No authorization token" });
  const token = header.split(" ")[1];
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === token);
  if (idx === -1) return res.status(401).json({ error: "Invalid token" });
  const user = users[idx];
  const { text } = req.body;
  user.chatMessages.push({ id: `msg-${Date.now()}`, sender: "me", type: "text", text, time: new Date().toTimeString().slice(0, 5) });
  await setUsers(users);
  res.json({ success: true });
}
