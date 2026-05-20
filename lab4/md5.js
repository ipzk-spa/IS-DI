// MD5
function md5(text) {
  var bytes = new TextEncoder().encode(text);
  var words = md5Prepare(bytes);
  var a = 0x67452301;
  var b = 0xefcdab89;
  var c = 0x98badcfe;
  var d = 0x10325476;
  var K = [];
  var i, j, offset, M, aa, bb, cc, dd, f, g, tmp, sum;

  for (i = 0; i < 64; i++) {
    K[i] = (Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296)) | 0;
  }
  var S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];

  for (offset = 0; offset < words.length; offset += 16) {
    M = words.slice(offset, offset + 16);
    aa = a; bb = b; cc = c; dd = d;
    for (i = 0; i < 64; i++) {
      if (i < 16) { f = (bb & cc) | (~bb & dd); g = i; }
      else if (i < 32) { f = (dd & bb) | (~dd & cc); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = bb ^ cc ^ dd; g = (3 * i + 5) % 16; }
      else { f = cc ^ (bb | ~dd); g = (7 * i) % 16; }
      tmp = dd; dd = cc; cc = bb;
      sum = (aa + f + K[i] + M[g]) | 0;
      bb = (bb + rot(sum, S[i])) | 0;
      aa = tmp;
    }
    a = (a + aa) | 0; b = (b + bb) | 0; c = (c + cc) | 0; d = (d + dd) | 0;
  }
  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

function rot(x, n) {
  return ((x << n) | (x >>> (32 - n))) | 0;
}

function toHex(n) {
  var b = [(n & 255), ((n >> 8) & 255), ((n >> 16) & 255), ((n >> 24) & 255)];
  var s = "", i;
  for (i = 0; i < 4; i++) {
    s += (b[i] < 16 ? "0" : "") + b[i].toString(16);
  }
  return s;
}

function md5Prepare(bytes) {
  var bitLen = bytes.length * 8;
  var padLen = ((56 - ((bytes.length + 1) % 64)) + 64) % 64;
  var total = bytes.length + 1 + padLen + 8;
  var buf = new Uint8Array(total);
  var view = new DataView(buf.buffer);
  var words = [], i;
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  view.setUint32(total - 8, bitLen, true);
  view.setUint32(total - 4, Math.floor(bitLen / 4294967296), true);
  for (i = 0; i < total / 4; i++) {
    words[i] = view.getInt32(i * 4, true);
  }
  return words;
}

var USERS_KEY = "ib_lr4_users";

function generateSalt() {
  var s = "", i;
  for (i = 0; i < 16; i++) {
    s += Math.floor(Math.random() * 16).toString(16);
  }
  return s;
}

function hashPassword(password, salt) {
  return md5(password + salt);
}

function loadUsers() {
  var data = localStorage.getItem(USERS_KEY);
  if (!data) return [];
  try { return JSON.parse(data); } catch (e) { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function registerUser(login, password) {
  login = login.replace(/^\s+|\s+$/g, "");
  if (!login || !password) {
    return { ok: false, message: "Заповніть логін і пароль." };
  }
  var users = loadUsers();
  var i;
  for (i = 0; i < users.length; i++) {
    if (users[i].login === login) {
      return { ok: false, message: "Такий логін вже є." };
    }
  }
  var salt = generateSalt();
  users.push({ login: login, salt: salt, hash: hashPassword(password, salt) });
  saveUsers(users);
  return { ok: true, message: "Користувача зареєстровано." };
}

function authenticateUser(login, password) {
  login = login.replace(/^\s+|\s+$/g, "");
  var users = loadUsers();
  var user = null;
  var i;
  for (i = 0; i < users.length; i++) {
    if (users[i].login === login) { user = users[i]; break; }
  }
  if (!user) {
    return { ok: false, message: "Користувача не знайдено." };
  }
  if (user.hash !== hashPassword(password, user.salt)) {
    return { ok: false, message: "Невірний пароль." };
  }
  return { ok: true, message: "Вхід успішний. Вітаємо, " + login + "!" };
}
