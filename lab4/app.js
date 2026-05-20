function setMsg(el, text, ok) {
  el.textContent = text;
  if (!text) {
    el.className = "msg";
  } else if (ok) {
    el.className = "msg ok";
  } else {
    el.className = "msg err";
  }
}

function renderUsersTable() {
  var tbody = document.querySelector("#users-table tbody");
  var users = loadUsers();
  var html = "", i;
  if (users.length === 0) {
    tbody.innerHTML = '<tr class="empty"><td colspan="3">Порожньо</td></tr>';
    return;
  }
  for (i = 0; i < users.length; i++) {
    html += "<tr><td>" + users[i].login + "</td><td><code>" + users[i].salt +
      "</code></td><td><code>" + users[i].hash + "</code></td></tr>";
  }
  tbody.innerHTML = html;
}

// Реєстрація та вхід
document.getElementById("btn-register").onclick = function () {
  var r = registerUser(
    document.getElementById("reg-login").value,
    document.getElementById("reg-pass").value
  );
  setMsg(document.getElementById("reg-msg"), r.message, r.ok);
  if (r.ok) renderUsersTable();
};

document.getElementById("btn-auth").onclick = function () {
  var r = authenticateUser(
    document.getElementById("auth-login").value,
    document.getElementById("auth-pass").value
  );
  setMsg(document.getElementById("auth-msg"), r.message, r.ok);
};

document.getElementById("btn-clear-users").onclick = function () {
  saveUsers([]);
  renderUsersTable();
};

// MD5
document.getElementById("btn-md5-salt").onclick = function () {
  document.getElementById("md5-salt").value = generateSalt();
};

document.getElementById("btn-md5").onclick = function () {
  var pass = document.getElementById("md5-pass").value;
  var salt = document.getElementById("md5-salt").value;
  var out = document.getElementById("md5-out");
  var msg = document.getElementById("md5-msg");
  if (!pass) {
    out.textContent = "—";
    setMsg(msg, "Введіть пароль.", false);
    return;
  }
  if (!salt) {
    out.textContent = "—";
    setMsg(msg, "Введіть або згенеруйте сіль.", false);
    return;
  }
  out.textContent = hashPassword(pass, salt);
  setMsg(msg, "Хеш обчислено (пароль + сіль).", true);
};

// RSA
document.getElementById("btn-rsa-demo").onclick = function () {
  document.getElementById("rsa-p").value = 3;
  document.getElementById("rsa-q").value = 11;
  document.getElementById("rsa-msg").value = "CAB";
  document.getElementById("btn-rsa-encrypt").click();
};

document.getElementById("btn-rsa-encrypt").onclick = function () {
  try {
    var p = parseInt(document.getElementById("rsa-p").value, 10);
    var q = parseInt(document.getElementById("rsa-q").value, 10);
    var res = rsaEncrypt(document.getElementById("rsa-msg").value, p, q);
    document.getElementById("rsa-cipher-out").value = res.cipherStr;
    document.getElementById("rsa-cipher-in").value = res.cipherStr;
    document.getElementById("rsa-plain").value = "";
    document.getElementById("rsa-keys").textContent =
      "n=" + res.keys.n + ", fi=" + res.keys.fi + "\n" +
      "e=" + res.keys.e + ", d=" + res.keys.d;
  } catch (e) {
    alert(e.message);
  }
};

document.getElementById("btn-rsa-decrypt").onclick = function () {
  try {
    var p = parseInt(document.getElementById("rsa-p").value, 10);
    var q = parseInt(document.getElementById("rsa-q").value, 10);
    var cipherStr = document.getElementById("rsa-cipher-in").value;
    var dec = rsaDecryptFromText(cipherStr, p, q);
    document.getElementById("rsa-plain").value = dec.text;
  } catch (e) {
    alert(e.message);
  }
};

// LSB
var lsbW = 0, lsbH = 0;
var canvasSrc = document.getElementById("canvas-src");
var canvasOut = document.getElementById("canvas-out");
var ctxSrc = canvasSrc.getContext("2d");
var ctxOut = canvasOut.getContext("2d");

document.getElementById("lsb-image").onchange = function (e) {
  var file = e.target.files[0];
  if (!file) return;
  var img = new Image();
  img.onload = function () {
    lsbW = img.width;
    lsbH = img.height;
    canvasSrc.width = lsbW;
    canvasSrc.height = lsbH;
    canvasOut.width = lsbW;
    canvasOut.height = lsbH;
    ctxSrc.drawImage(img, 0, 0);
    ctxOut.drawImage(img, 0, 0);
    document.getElementById("lsb-download").className = "btn hidden";
    document.getElementById("lsb-capacity-text").textContent =
      "Розмір " + lsbW + "x" + lsbH + ". Макс. символів: ~" + (lsbW * lsbH - 4);
    setMsg(document.getElementById("lsb-msg"), "Зображення завантажено.", true);
  };
  img.src = URL.createObjectURL(file);
};

document.getElementById("btn-lsb-hide").onclick = function () {
  var msg = document.getElementById("lsb-msg");
  if (!lsbW) {
    setMsg(msg, "Завантажте зображення.", false);
    return;
  }
  try {
    ctxOut.drawImage(canvasSrc, 0, 0);
    var text = document.getElementById("lsb-text").value;
    if (!text) throw new Error("Введіть текст.");
    hideTextInImage(ctxOut, lsbW, lsbH, text);
    canvasToBlob(canvasOut).then(function (blob) {
      var link = document.getElementById("lsb-download");
      link.href = URL.createObjectURL(blob);
      link.className = "btn";
      setMsg(msg, "Текст приховано.", true);
    });
  } catch (err) {
    setMsg(msg, err.message, false);
  }
};

document.getElementById("btn-lsb-extract").onclick = function () {
  var msg = document.getElementById("lsb-msg");
  if (!lsbW) {
    setMsg(msg, "Завантажте зображення.", false);
    return;
  }
  try {
    document.getElementById("lsb-extracted").value =
      extractTextFromImage(ctxOut, lsbW, lsbH);
    setMsg(msg, "Текст витягнуто.", true);
  } catch (err) {
    setMsg(msg, err.message, false);
  }
};

renderUsersTable();
