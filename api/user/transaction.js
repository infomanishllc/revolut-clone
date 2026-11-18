const { getUsers, setUsers } = require("../_db.js");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const token = (req.headers.authorization || "").split(" ")[1];
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === token);
  if (idx === -1) return res.status(401).json({ error: "Invalid token" });
  const user = users[idx];
  const { amount, note, title, avatarUrl, initials } = req.body;
  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) return res.status(400).json({ error: "Invalid amount" });
  if (user.balance < amt) return res.status(400).json({ error: "Insufficient funds" });
  user.balance -= amt;
  const time = new Date().toTimeString().slice(0, 5);
  user.transactions.unshift({ id: `tx-${Date.now()}`, title, subtitle: `Today, ${time} · ${note || ""}`, amount: -amt, time, isOutgoing: true, avatarUrl: avatarUrl || "", initials: initials || "" });
  user.chatMessages.push({ id: `msg-${Date.now()}`, sender: "me", type: "payment", amount: amt, note: note || "", time });
  await setUsers(users);
  res.json({ success: true, balance: user.balance });
};
