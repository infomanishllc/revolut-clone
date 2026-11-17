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
  const { amount, method } = req.body;
  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) return res.status(400).json({ error: "Invalid amount" });
  user.balance += amt;
  const time = new Date().toTimeString().slice(0, 5);
  user.transactions.unshift({ id: `tx-${Date.now()}`, title: "Added Money", subtitle: `Today, ${time} · ${method || "Top up"}`, amount: amt, time, isOutgoing: false, initials: "AM" });
  await setUsers(users);
  res.json({ success: true, balance: user.balance });
}
