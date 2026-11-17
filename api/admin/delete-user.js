import { getUsers, setUsers } from "../../_db.js";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();
  const { id } = req.query;
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  const [deleted] = users.splice(idx, 1);
  await setUsers(users);
  res.json({ success: true, name: deleted.name });
}
