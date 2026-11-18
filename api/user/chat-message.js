const { getUsers, setUsers } = require("../_db.js");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const token = (req.headers.authorization || "").split(" ")[1];
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === token);
  if (idx === -1) return res.status(401).json({ error: "Invalid token" });
  const user = users[idx];
  const { text } = req.body;
  user.chatMessages.push({ id: `msg-${Date.now()}`, sender: "me", type: "text", text, time: new Date().toTimeString().slice(0, 5) });
  await setUsers(users);
  res.json({ success: true });
};
