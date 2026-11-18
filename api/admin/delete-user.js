import { getUsers, deleteUser } from "../../_db.js";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();
  const { id } = req.query;
  const users = await getUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });
  await deleteUser(id);
  res.json({ success: true, name: user.name });
}
