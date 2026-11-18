import { getUsers, deleteUser } from "../../_db.js";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  // Get id from query param OR extract from URL path
  let id = req.query.id;
  if (!id) {
    const parts = req.url.split("/");
    id = parts[parts.length - 1].split("?")[0];
  }

  if (!id) return res.status(400).json({ error: "Missing user id" });

  const users = await getUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });

  await deleteUser(id);
  res.json({ success: true, name: user.name });
}
