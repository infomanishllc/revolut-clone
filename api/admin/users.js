const { getUsers, setUsers } = require("../../lib/db.js");
const { userPayload, getSecondsRemaining } = require("../../lib/helpers.js");

module.exports = async function handler(req, res) {
  try {
  if (req.method === "GET") {
    const users = await getUsers();
    return res.json({
      users: users.map((u) => ({
        ...userPayload(u),
        secondsRemaining: Math.floor(getSecondsRemaining(u)),
        daysRemaining: 7,
        isExpired: getSecondsRemaining(u) <= 0,
        hasStarted: u.hasStarted,
        transactionCount: u.transactions.length,
      })),
    });
  }
  if (req.method === "POST") {
    const { name, revtag, accessCode, balance, durationMinutes, avatarUrl } = req.body;
    if (!name || !accessCode) return res.status(400).json({ error: "Name and accessCode required" });
    const users = await getUsers();
    if (users.find((u) => u.accessCode === accessCode)) return res.status(400).json({ error: "Access code already exists" });
    const now = new Date().toISOString();
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      initials: name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      revtag: revtag || `@${name.toLowerCase().replace(/\s+/g, "")}`,
      avatarUrl: avatarUrl || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random()*99)}.jpg`,
      accessCode,
      balance: parseFloat(balance) || 0,
      investBalance: 0,
      cryptoBalance: 0,
      sortCode: "04-00-76",
      accountNo: String(Math.floor(10000000 + Math.random() * 90000000)),
      createdAt: now,
      durationMinutes: parseFloat(durationMinutes) || 10080,
      firstLoginAt: null,
      expiresAt: null,
      isActive: true,
      hasStarted: false,
      transactions: [],
      chatMessages: [],
    };
    users.push(newUser);
    await setUsers(users);
    return res.json({ success: true, user: newUser });
  }
  res.status(405).end();
  } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
};
