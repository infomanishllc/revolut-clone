const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisCmd(...args) {
  const res = await fetch(`${UPSTASH_URL}/${args.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const data = await res.json();
  return data.result;
}

const DEFAULT_USERS = [
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

export async function getUsers() {
  const raw = await redisCmd("GET", "users");
  if (!raw) {
    await setUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function setUsers(users) {
  await redisCmd("SET", "users", JSON.stringify(users));
}

export async function getUser(id) {
  const users = await getUsers();
  return users.find((u) => u.id === id);
}

export async function saveUser(updated) {
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === updated.id);
  if (idx !== -1) users[idx] = updated;
  else users.push(updated);
  await setUsers(users);
}
