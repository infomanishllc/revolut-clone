import { getUsers, getUser } from "../_db.js";
import { userPayload, getSecondsRemaining } from "../_helpers.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { accessCode } = req.body;
  const users = await getUsers();
  const user = users.find((u) => u.accessCode === accessCode);
  if (!user) return res.status(401).json({ error: "Invalid access code. Please check with your administrator." });
  res.json({
    token: user.id,
    user: userPayload(user),
    secondsRemaining: Math.floor(getSecondsRemaining(user)),
    durationMinutes: user.durationMinutes,
  });
}
