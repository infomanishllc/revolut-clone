const express = require("express");
const path = require("path");
const https = require("https");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── helpers ──────────────────────────────────────────────────────────────────
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pad(n) { return String(n).padStart(2, "0"); }
function accSuffix() { return `-${rand(1000, 9999)}`; }
function sortCode(n) { return `04-00-${pad(n)}`; }

const FIRST = ["Alice","Kurt","Caitlin","Harry","Suzanne","Ava","Phoebe","Brooke","Colin","Franklin","Vicki","Olivia","Julian","Molly","Larry","Jenny","Arnold","Terry","Anna","Marcus"];
const LAST  = ["Gregory","Alexander","Watts","George","Moreno","Harris","Ramirez","Graham","Johnson","Bryant","Moore","Marshall","Cook","Silva","Welch","Sutton","Taylor","Holt","Harvey","Reed"];
const MALE_PORTRAITS  = [13,27,30,34,39,42,43,50,51,59,60,65,68,70,76,84,86,99,0,5];
const FEMALE_PORTRAITS= [22,25,27,30,33,47,55,57,58,59,70,72,74,76,77,90,92,11,22,25];

function generateContacts() {
  const contacts = [];
  const used = new Set();
  for (let i = 0; i < 20; i++) {
    let fi, li;
    do { fi = rand(0,19); li = rand(0,19); } while (used.has(`${fi}-${li}`));
    used.add(`${fi}-${li}`);
    const first = FIRST[fi], last = LAST[li];
    const isFemale = fi % 2 === 0;
    const portraits = isFemale ? FEMALE_PORTRAITS : MALE_PORTRAITS;
    const gender = isFemale ? "women" : "men";
    const portraitIdx = portraits[i % portraits.length];
    contacts.push({
      id: `c-live-${i}-${Date.now()}`,
      name: `${first} ${last}`,
      revtag: `@${first.toLowerCase()}${last.toLowerCase()}`,
      avatarUrl: `https://randomuser.me/api/portraits/${gender}/${portraitIdx}.jpg`,
      initials: `${first[0]}${last[0]}`,
      lastAmount: rand(100, 1500),
      lastDate: "16 Nov",
      bankSubtitle: `${sortCode(20 + i)} · Acc ${accSuffix()}`
    });
  }
  return contacts;
}

function generateFakeProfile() {
  const fi = rand(0,19), li = rand(0,19);
  const first = FIRST[fi], last = LAST[li];
  const isFemale = fi % 2 === 0;
  const gender = isFemale ? "women" : "men";
  const portraits = isFemale ? FEMALE_PORTRAITS : MALE_PORTRAITS;
  return {
    name: `${first} ${last}`,
    initials: `${first[0]}${last[0]}`,
    revtag: `@${first.toLowerCase()}${last.toLowerCase()}`,
    sortCode: sortCode(rand(20, 39)),
    accountNo: String(rand(10000000, 99999999)),
    avatarUrl: `https://randomuser.me/api/portraits/${gender}/${portraits[rand(0,19)]}.jpg`
  };
}

// ── in-memory DB ──────────────────────────────────────────────────────────────
const users = [
  {
    id: "user-hazem-default",
    name: "Eleanor Whitmore",
    initials: "EW",
    revtag: "@eleanorwhitmore",
    avatarUrl: "https://unavatar.io/revolut/eleanorwhitmore?fallback=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1534528741775-53994a69daeb%3Fw%3D200",
    accessCode: "123456",
    balance: 38318,
    investBalance: 5944.82,
    cryptoBalance: 6931.88,
    sortCode: "04-00-76",
    accountNo: "95352532",
    createdAt: "2026-11-17T10:00:00.000Z",
    durationMinutes: 10080,
    firstLoginAt: "2026-11-17T08:33:39.166Z",
    expiresAt: "2026-11-24T08:33:39.166Z",
    isActive: true,
    hasStarted: true,
    transactions: [
      { id: "tx-1794905480971", title: "Isabelc47m", subtitle: "Today, 14:36 · Double Tappin Like Crazy", amount: -1000, time: "14:36", isOutgoing: true, avatarUrl: "https://unavatar.io/revolut/isabelc47m?fallback=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1534528741775-53994a69daeb%3Fw%3D150%26auto%3Dformat%26fit%3Dcrop%26q%3D80", initials: "I" },
      { id: "t1", title: "Joshua Sutton", subtitle: "Today, 22:58 · Racing", amount: -600, time: "22:58", isOutgoing: true, avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", initials: "JS" },
      { id: "t2", title: "Noah Ashworth", subtitle: "Today, 21:15 · Dinner & Drinks", amount: -85, time: "21:15", isOutgoing: true, avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", initials: "NA" }
    ],
    chatMessages: [
      { id: "m1", sender: "me", type: "payment", amount: 1000, note: "Double Tappin Like Crazy", time: "23:00" },
      { id: "msg-1794905480971", sender: "me", type: "payment", amount: 1000, note: "Double Tappin Like Crazy", time: "14:36" }
    ]
  }
];

const ADMIN_PASSWORD = "admin123";

function getSecondsRemaining(user) {
  if (!user.firstLoginAt) return user.durationMinutes * 60;
  const elapsed = (Date.now() - new Date(user.firstLoginAt).getTime()) / 1000;
  return Math.max(0, user.durationMinutes * 60 - elapsed);
}

function userPayload(user) {
  return {
    id: user.id,
    name: user.name,
    initials: user.initials,
    revtag: user.revtag,
    avatarUrl: user.avatarUrl,
    accessCode: user.accessCode,
    balance: user.balance,
    investBalance: user.investBalance,
    cryptoBalance: user.cryptoBalance,
    sortCode: user.sortCode,
    accountNo: user.accountNo,
    createdAt: user.createdAt,
    durationMinutes: user.durationMinutes,
    firstLoginAt: user.firstLoginAt,
    expiresAt: user.expiresAt,
    isActive: user.isActive,
    transactions: user.transactions,
    chatMessages: user.chatMessages,
  };
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No authorization token" });
  const token = header.split(" ")[1];
  const user = users.find((u) => u.id === token);
  if (!user) return res.status(401).json({ error: "Invalid token" });
  req.user = user;
  next();
}

// ── routes ────────────────────────────────────────────────────────────────────

app.post("/api/auth/login", (req, res) => {
  const { accessCode } = req.body;
  const user = users.find((u) => u.accessCode === accessCode);
  if (!user) return res.status(401).json({ error: "Invalid access code. Please check with your administrator." });
  res.json({
    token: user.id,
    user: userPayload(user),
    secondsRemaining: Math.floor(getSecondsRemaining(user)),
    durationMinutes: user.durationMinutes,
  });
});

app.post("/api/auth/admin-login", (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: "Incorrect Admin Password" });
  res.json({ success: true });
});

app.get("/api/user/me", auth, (req, res) => {
  const user = req.user;
  res.json({ user: userPayload(user), secondsRemaining: Math.floor(getSecondsRemaining(user)), durationMinutes: user.durationMinutes });
});

app.get("/api/user/fetch-real-profile", auth, (req, res) => {
  res.json(generateFakeProfile());
});

app.post("/api/user/transaction", auth, (req, res) => {
  const user = req.user;
  const { amount, note, title, avatarUrl, initials } = req.body;
  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) return res.status(400).json({ error: "Invalid amount" });
  if (user.balance < amt) return res.status(400).json({ error: "Insufficient funds" });
  user.balance -= amt;
  const time = new Date().toTimeString().slice(0, 5);
  const id = `tx-${Date.now()}`;
  user.transactions.unshift({ id, title, subtitle: `Today, ${time} · ${note || ""}`, amount: -amt, time, isOutgoing: true, avatarUrl: avatarUrl || "", initials: initials || "" });
  user.chatMessages.push({ id: `msg-${Date.now()}`, sender: "me", type: "payment", amount: amt, note: note || "", time });
  res.json({ success: true, balance: user.balance });
});

app.post("/api/user/add-money", auth, (req, res) => {
  const user = req.user;
  const { amount, method } = req.body;
  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) return res.status(400).json({ error: "Invalid amount" });
  user.balance += amt;
  const time = new Date().toTimeString().slice(0, 5);
  user.transactions.unshift({ id: `tx-${Date.now()}`, title: "Added Money", subtitle: `Today, ${time} · ${method || "Top up"}`, amount: amt, time, isOutgoing: false, initials: "AM" });
  res.json({ success: true, balance: user.balance });
});

app.post("/api/user/update-profile", auth, (req, res) => {
  const user = req.user;
  const { name, revtag, sortCode, accountNo, balance } = req.body;
  if (name) user.name = name;
  if (revtag) user.revtag = revtag;
  if (sortCode) user.sortCode = sortCode;
  if (accountNo) user.accountNo = accountNo;
  if (balance !== undefined) user.balance = parseFloat(balance);
  res.json({ success: true });
});

app.post("/api/user/chat-message", auth, (req, res) => {
  const user = req.user;
  const { text } = req.body;
  user.chatMessages.push({ id: `msg-${Date.now()}`, sender: "me", type: "text", text, time: new Date().toTimeString().slice(0, 5) });
  res.json({ success: true });
});

app.get("/api/live-contacts", auth, (req, res) => {
  res.json(generateContacts());
});

app.get("/api/admin/users", (req, res) => {
  res.json({
    users: users.map((u) => ({
      ...userPayload(u),
      secondsRemaining: Math.floor(getSecondsRemaining(u)),
      daysRemaining: 7,
      isExpired: getSecondsRemaining(u) <= 0,
      hasStarted: u.hasStarted,
      transactionCount: u.transactions.length,
    })),
  });
});

app.post("/api/admin/create-user", (req, res) => {
  const { name, revtag, accessCode, balance, durationMinutes, avatarUrl } = req.body;
  if (!name || !accessCode) return res.status(400).json({ error: "Name and accessCode required" });
  if (users.find((u) => u.accessCode === accessCode)) return res.status(400).json({ error: "Access code already exists" });
  const now = new Date().toISOString();
  const dur = parseFloat(durationMinutes) || 10080;
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    initials: name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    revtag: revtag || `@${name.toLowerCase().replace(/\s+/g, "")}`,
    avatarUrl: avatarUrl || "",
    accessCode,
    balance: parseFloat(balance) || 0,
    investBalance: 0,
    cryptoBalance: 0,
    sortCode: "04-00-76",
    accountNo: String(rand(10000000, 99999999)),
    createdAt: now,
    durationMinutes: dur,
    firstLoginAt: null,
    expiresAt: null,
    isActive: true,
    hasStarted: false,
    transactions: [],
    chatMessages: [],
  };
  users.push(newUser);
  res.json({ success: true, user: newUser });
});

app.delete("/api/admin/delete-user/:id", (req, res) => {
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  const [deleted] = users.splice(idx, 1);
  res.json({ success: true, name: deleted.name });
});

app.listen(PORT, () => {
  console.log(`✅  http://localhost:${PORT}`);
  console.log(`   Login code    : 123456`);
  console.log(`   Admin password: admin123`);
});
