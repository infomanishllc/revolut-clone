const { getUsers, setUsers } = require("../../lib/db.js");
const { checkExpiry } = require("../../lib/helpers.js");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const token = (req.headers.authorization || "").split(" ")[1];
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === token);
  if (idx === -1) return res.status(401).json({ error: "Invalid token" });
  const user = users[idx];
  if (!checkExpiry(user, res)) return;
  const { name, revtag, sortCode, accountNo, balance } = req.body;
  if (name) user.name = name;
  if (revtag) user.revtag = revtag;
  if (sortCode) user.sortCode = sortCode;
  if (accountNo) user.accountNo = accountNo;
  if (balance !== undefined) user.balance = parseFloat(balance);
  await setUsers(users);
  res.json({ success: true });
};
