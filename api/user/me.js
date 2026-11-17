import { getUsers } from "../_db.js";
import { userPayload, getSecondsRemaining } from "../_helpers.js";

function authUser(req, users) {
  const header = req.headers.authorization;
  if (!header) return null;
  const token = header.split(" ")[1];
  return users.find((u) => u.id === token) || null;
}

export default async function handler(req, res) {
  const users = await getUsers();
  const user = authUser(req, users);
  if (!user) return res.status(401).json({ error: "No authorization token" });
  res.json({ user: userPayload(user), secondsRemaining: Math.floor(getSecondsRemaining(user)), durationMinutes: user.durationMinutes });
}
