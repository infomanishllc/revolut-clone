const { getUsers } = require("../../lib/db.js");
const { userPayload, getSecondsRemaining } = require("../../lib/helpers.js");

module.exports = async function handler(req, res) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No authorization token" });
  const token = header.split(" ")[1];
  const users = await getUsers();
  const user = users.find((u) => u.id === token);
  if (!user) return res.status(401).json({ error: "Invalid token" });
  if (!user.isActive) return res.status(403).json({ error: "Account is disabled." });
  const secondsRemaining = Math.floor(getSecondsRemaining(user));
  if (user.firstLoginAt && secondsRemaining <= 0) return res.status(403).json({ error: "Session expired." });
  res.json({ user: userPayload(user), secondsRemaining, durationMinutes: user.durationMinutes });
};
