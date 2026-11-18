const { getUsers } = require("../db.js");
const { userPayload, getSecondsRemaining } = require("../helpers.js");

module.exports = async function handler(req, res) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No authorization token" });
  const token = header.split(" ")[1];
  const users = await getUsers();
  const user = users.find((u) => u.id === token);
  if (!user) return res.status(401).json({ error: "Invalid token" });
  res.json({ user: userPayload(user), secondsRemaining: Math.floor(getSecondsRemaining(user)), durationMinutes: user.durationMinutes });
};
