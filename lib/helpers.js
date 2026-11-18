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

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const FIRST = ["Alice","Kurt","Caitlin","Harry","Suzanne","Ava","Phoebe","Brooke","Colin","Franklin","Vicki","Olivia","Julian","Molly","Larry","Jenny","Arnold","Terry","Anna","Marcus"];
const LAST  = ["Gregory","Alexander","Watts","George","Moreno","Harris","Ramirez","Graham","Johnson","Bryant","Moore","Marshall","Cook","Silva","Welch","Sutton","Taylor","Holt","Harvey","Reed"];
const MALE_P   = [13,27,30,34,39,42,43,50,51,59,60,65,68,70,76,84,86,99,0,5];
const FEMALE_P = [22,25,27,30,33,47,55,57,58,59,70,72,74,76,77,90,92,11,22,25];

function generateContacts() {
  const contacts = [];
  const used = new Set();
  for (let i = 0; i < 20; i++) {
    let fi, li;
    do { fi = rand(0,19); li = rand(0,19); } while (used.has(`${fi}-${li}`));
    used.add(`${fi}-${li}`);
    const first = FIRST[fi], last = LAST[li];
    const isFemale = fi % 2 === 0;
    const gender = isFemale ? "women" : "men";
    const portraits = isFemale ? FEMALE_P : MALE_P;
    contacts.push({
      id: `c-live-${i}-${Date.now()}`,
      name: `${first} ${last}`,
      revtag: `@${first.toLowerCase()}${last.toLowerCase()}`,
      avatarUrl: `https://randomuser.me/api/portraits/${gender}/${portraits[i % portraits.length]}.jpg`,
      initials: `${first[0]}${last[0]}`,
      lastAmount: rand(100, 1500),
      lastDate: "16 Nov",
      bankSubtitle: `Sort code 04-00-${String(20 + i).padStart(2,"0")} · Acc -${rand(1000,9999)}`
    });
  }
  return contacts;
}

function generateFakeProfile() {
  const fi = rand(0,19), li = rand(0,19);
  const first = FIRST[fi], last = LAST[li];
  const isFemale = fi % 2 === 0;
  const gender = isFemale ? "women" : "men";
  const portraits = isFemale ? FEMALE_P : MALE_P;
  return {
    name: `${first} ${last}`,
    initials: `${first[0]}${last[0]}`,
    revtag: `@${first.toLowerCase()}${last.toLowerCase()}`,
    sortCode: `04-00-${String(rand(20,39)).padStart(2,"0")}`,
    accountNo: String(rand(10000000, 99999999)),
    avatarUrl: `https://randomuser.me/api/portraits/${gender}/${portraits[rand(0,19)]}.jpg`
  };
}

function checkExpiry(user, res) {
  if (!user.isActive) { res.status(403).json({ error: "Account is disabled." }); return false; }
  if (user.firstLoginAt && getSecondsRemaining(user) <= 0) { res.status(403).json({ error: "Session expired." }); return false; }
  return true;
}

module.exports = { getSecondsRemaining, userPayload, generateContacts, generateFakeProfile, checkExpiry };
