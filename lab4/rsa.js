// RSA
var CHAR_MAP = {
  "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7, "H": 8, "I": 9, "J": 10,
  "K": 11, "L": 12, "M": 13, "N": 14, "O": 15, "P": 16, "Q": 17, "R": 18, "S": 19,
  "T": 20, "U": 21, "V": 22, "W": 23, "X": 24, "Y": 25, "Z": 26, " ": 27
};

function letterToNum(ch) {
  ch = ch.toUpperCase();
  if (CHAR_MAP[ch] !== undefined) return CHAR_MAP[ch];
  return -1;
}

function numToLetter(n) {
  var letters = " abcdefghijklmnopqrstuvwxyz";
  if (n >= 1 && n <= 26) return letters.charAt(n);
  if (n === 27) return " ";
  return "?";
}

function gcd(a, b) {
  while (b !== 0) {
    var t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function modPow(num, pow, mod) {
  return Math.round(Math.pow(num, pow)) % mod;
}

function makeKeys(p, q) {
  var n = p * q;
  var fi = (p - 1) * (q - 1);
  var d = 2, e = 1, i;
  for (i = 2; i < fi; i++) {
    if (gcd(i, fi) === 1) { d = i; break; }
  }
  for (i = 1; i < fi; i++) {
    if ((d * i) % fi === 1) { e = i; break; }
  }
  return { n: n, fi: fi, e: e, d: d };
}

function rsaEncrypt(msg, p, q) {
  var keys = makeKeys(p, q);
  var nums = [];
  var cipher = [];
  var i, ch, c;
  msg = msg.toUpperCase();
  for (i = 0; i < msg.length; i++) {
    ch = letterToNum(msg.charAt(i));
    if (ch < 0) throw new Error("Лише літери A-Z та пробіл.");
    nums.push(ch);
    cipher.push(modPow(ch, keys.e, keys.n));
  }
  return {
    cipher: cipher,
    cipherStr: cipher.join(" "),
    keys: keys,
    nums: nums
  };
}

function rsaDecrypt(cipher, keys, len) {
  var plain = [];
  var text = "";
  var i, n;
  for (i = 0; i < len; i++) {
    n = modPow(cipher[i], keys.d, keys.n);
    plain.push(n);
    text += numToLetter(n);
  }
  return { plain: plain, text: text };
}

function parseCipherText(str) {
  var parts = str.replace(/^\s+|\s+$/g, "").split(/\s+/);
  var cipher = [];
  var i, num;
  for (i = 0; i < parts.length; i++) {
    if (!parts[i]) continue;
    num = parseInt(parts[i], 10);
    if (isNaN(num)) throw new Error("Шифротекст — лише числа через пробіл.");
    cipher.push(num);
  }
  if (cipher.length === 0) throw new Error("Введіть шифротекст.");
  return cipher;
}

function rsaDecryptFromText(cipherStr, p, q) {
  var keys = makeKeys(p, q);
  var cipher = parseCipherText(cipherStr);
  return rsaDecrypt(cipher, keys, cipher.length);
}
