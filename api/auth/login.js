const { getUsers } = require("../db.js");
const { userPayload, getSecondsRemaining } = require("../helpers.js");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();
    const { accessCode } = req.body;
    const users = await getUsers();
    const user = users.find((u) => u.accessCode === accessCode);
    if (!user) return res.status(401).json({ error: "Invalid access code. Please check with your administrator." });
    res.json({ token: user.id, user: userPayload(user), secondsRemaining: Math.floor(getSecondsRemaining(user)), durationMinutes: user.durationMinutes });
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
};
