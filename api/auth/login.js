const { getUsers, saveUser } = require("../../lib/db.js");
const { userPayload, getSecondsRemaining } = require("../../lib/helpers.js");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).end();
    const { accessCode } = req.body;
    const users = await getUsers();
    const user = users.find((u) => u.accessCode === accessCode);
    if (!user) return res.status(401).json({ error: "Invalid access code. Please check with your administrator." });
    if (!user.isActive) return res.status(403).json({ error: "Account is disabled." });
    const secondsRemaining = Math.floor(getSecondsRemaining(user));
    if (user.firstLoginAt && secondsRemaining <= 0) return res.status(403).json({ error: "Your session has expired. Access is no longer available." });
    const deviceId = Buffer.from((req.headers["user-agent"] || "") + (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "")).toString("base64").slice(0, 32);
    if (user.deviceId && user.deviceId !== deviceId) return res.status(403).json({ error: "This access code is already in use on another device." });
    if (!user.deviceId) { user.deviceId = deviceId; await saveUser(user); }
    res.json({ token: user.id, user: userPayload(user), secondsRemaining, durationMinutes: user.durationMinutes });
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
};
