const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function supabase(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "resolution=merge-duplicates" : "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (method === "DELETE" || res.status === 204) return null;
  return res.json();
}

const DEFAULT_USERS = [
  {
    id: "user-hazem-default",
    name: "Eleanor Whitmore",
    initials: "EW",
    revtag: "@eleanorwhitmore",
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
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
  const rows = await supabase("GET", "users?select=data");
  if (!rows || rows.length === 0) {
    // seed default user
    for (const u of DEFAULT_USERS) {
      await supabase("POST", "users", { id: u.id, data: u });
    }
    return DEFAULT_USERS;
  }
  return rows.map((r) => r.data);
}

export async function setUsers(users) {
  for (const u of users) {
    await supabase("POST", "users", { id: u.id, data: u });
  }
}

export async function getUser(id) {
  const rows = await supabase("GET", `users?id=eq.${id}&select=data`);
  return rows && rows[0] ? rows[0].data : null;
}

export async function saveUser(updated) {
  await supabase("POST", "users", { id: updated.id, data: updated });
}
