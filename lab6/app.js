var OBJECTS = [
  { id: 'O1', name: 'Комерційні договори та база клієнтів' },
  { id: 'O2', name: 'Технологічна документація виробництва' },
  { id: 'O3', name: 'Кадровий облік і заробітна плата' },
  { id: 'O4', name: 'Виробничий план, склад, MES/ERP' }
];

var RI = ['Читання даних', 'Редагування', 'Видалення', 'Не має права доступу'];
var TO_BYTE = { 1: 8, 2: 4, 3: 2, 4: 1 };

function rowToPriv(row) {
  return row.map(function (v) { return TO_BYTE[v] || 1; });
}

function decodePriv(byte) {
  var b = byte, out = [];
  if (b >= 8) { b -= 8; out.push(RI[0]); }
  if (b >= 4) { b -= 4; out.push(RI[1]); }
  if (b >= 2) { b -= 2; out.push(RI[2]); }
  if (b === 1) out.push(RI[3]);
  return out.length ? out.join(', ') : RI[3];
}

var MATRIX = [
  { key: 'director', label: 'S1 director', values: [2, 2, 2, 2] },
  { key: 'engineer', label: 'S2 engineer', values: [4, 2, 4, 3] },
  { key: 'admin', label: 'S3 admin', values: [4, 3, 4, 2] },
  { key: 'accountant', label: 'S4 accountant', values: [2, 4, 1, 1] },
  { key: 'manager', label: 'S5 manager', values: [1, 4, 4, 1] },
  { key: 'operator', label: 'S6 operator', values: [4, 1, 4, 1] },
  { key: 'hr', label: 'S7 hr', values: [4, 4, 1, 4] }
];

var USERS = [
  { user: 'director',   pass: '111111', role: 'S1 — Директор',           priv: rowToPriv([2, 2, 2, 2]), ri: [2, 2, 2, 2] },
  { user: 'engineer',   pass: '222222', role: 'S2 — Головний інженер',    priv: rowToPriv([4, 2, 4, 3]), ri: [4, 2, 4, 3] },
  { user: 'admin',      pass: '333333', role: 'S3 — Адміністратор ІС',   priv: rowToPriv([4, 3, 4, 2]), ri: [4, 3, 4, 2] },
  { user: 'accountant', pass: '444444', role: 'S4 — Головний бухгалтер',  priv: rowToPriv([2, 4, 1, 1]), ri: [2, 4, 1, 1] },
  { user: 'manager',    pass: '555555', role: 'S5 — Комерційний відділ', priv: rowToPriv([1, 4, 4, 1]), ri: [1, 4, 4, 1] },
  { user: 'operator',   pass: '666666', role: 'S6 — Оператор лінії',     priv: rowToPriv([4, 1, 4, 1]), ri: [4, 1, 4, 1] },
  { user: 'hr',         pass: '777777', role: 'S7 — HR-менеджер',        priv: rowToPriv([4, 4, 1, 4]), ri: [4, 4, 1, 4] }
];

var current = null;
var rightsUnlocked = false;
var panels = {
  login: document.getElementById('login'),
  register: document.getElementById('register'),
  check: document.getElementById('check'),
  matrix: document.getElementById('matrix')
};

function show(id) {
  Object.keys(panels).forEach(function (k) {
    panels[k].classList.toggle('on', k === id);
  });
}

function buildRegRights() {
  var box = document.getElementById('reg-rights');
  box.innerHTML = '';
  rightsUnlocked = false;
  OBJECTS.forEach(function (o, i) {
    var div = document.createElement('div');
    div.className = 'row';
    var sel = '<select data-i="' + i + '">';
    sel += '<option value="1">1 — читання</option>';
    sel += '<option value="2">2 — редагування</option>';
    sel += '<option value="3">3 — видалення</option>';
    sel += '<option value="4" selected>4 — немає доступу</option></select>';
    div.innerHTML = '<b>' + o.id + '</b> ' + o.name + '<br>' + sel;
    box.appendChild(div);
  });
  setRegRightsDisabled(true);
}

function setRegRightsDisabled(disabled) {
  document.querySelectorAll('#reg-rights select').forEach(function (s) {
    s.disabled = disabled;
  });
}

function buildObjSelect() {
  var box = document.getElementById('chk-objects');
  box.innerHTML = '';
  OBJECTS.forEach(function (o, i) {
    var label = document.createElement('label');
    label.innerHTML = '<input type="checkbox" value="' + i + '" checked> ' + o.id + ' — ' + o.name;
    box.appendChild(label);
  });
}

function canViewAll() {
  return current && (current.user === 'admin' || current.user === 'director');
}

function buildCheckUsers() {
  var sel = document.getElementById('chk-user');
  sel.innerHTML = '';
  USERS.forEach(function (u) {
    if (!canViewAll() && u.user !== current.user) return;
    var opt = document.createElement('option');
    opt.value = u.user;
    opt.textContent = u.user + ' (' + u.role + ')';
    sel.appendChild(opt);
  });
  sel.disabled = !canViewAll();
  sel.value = current.user;
}

function syncCheckPanel() {
  document.getElementById('chk-name').textContent = current.user + ' (' + current.role + ')';
  document.getElementById('btn-reg-go').hidden = current.user !== 'admin';
  document.getElementById('chk-out').hidden = true;
  buildCheckUsers();
}

function getMatrixRows() {
  if (!current) return [];
  if (current.user === 'admin' || current.user === 'director') return MATRIX;
  return [{ key: current.user, label: current.user, values: current.ri || [4, 4, 4, 4] }];
}

function renderMatrix() {
  var h = '<table><tr><th></th><th>O1</th><th>O2</th><th>O3</th><th>O4</th></tr>';
  getMatrixRows().forEach(function (r) {
    h += '<tr><td class="name">' + r.label + '</td>';
    for (var i = 0; i < 4; i++) h += '<td>' + r.values[i] + '</td>';
    h += '</tr>';
  });
  h += '</table>';
  document.getElementById('mat-table').innerHTML = h;
}

document.getElementById('btn-in').onclick = function () {
  var u = document.getElementById('in-user').value.trim();
  var p = document.getElementById('in-pass').value;
  var err = document.getElementById('in-err');
  var found = USERS.filter(function (x) { return x.user === u && x.pass === p; })[0];
  if (!found) {
    err.textContent = 'Невірний логін або пароль';
    err.hidden = false;
    return;
  }
  err.hidden = true;
  current = found;
  syncCheckPanel();
  show('check');
};

document.getElementById('btn-reg-go').onclick = function () {
  if (!current || current.user !== 'admin') {
    return;
  }
  buildRegRights();
  document.getElementById('reg-user').value = '';
  document.getElementById('reg-pass').value = '';
  document.getElementById('reg-code').value = '';
  document.getElementById('reg-msg').hidden = true;
  show('register');
};

document.getElementById('btn-code').onclick = function () {
  var msg = document.getElementById('reg-msg');
  if (document.getElementById('reg-code').value !== '80085') {
    rightsUnlocked = false;
    setRegRightsDisabled(true);
    msg.className = 'err';
    msg.textContent = 'Невірний код';
    msg.hidden = false;
    return;
  }
  rightsUnlocked = true;
  setRegRightsDisabled(false);
  msg.className = 'ok';
  msg.textContent = 'Код прийнято';
  msg.hidden = false;
};

document.getElementById('btn-reg-save').onclick = function () {
  var u = document.getElementById('reg-user').value.trim();
  var p = document.getElementById('reg-pass').value;
  var msg = document.getElementById('reg-msg');
  if (!current || current.user !== 'admin') {
    return;
  }
  if (!u || !p) {
    msg.className = 'err';
    msg.textContent = 'Заповніть поля';
    msg.hidden = false;
    return;
  }
  if (!rightsUnlocked) {
    msg.className = 'err';
    msg.textContent = 'Введіть код доступу';
    msg.hidden = false;
    return;
  }
  var priv = [];
  var ri = [];
  document.querySelectorAll('#reg-rights select').forEach(function (s) {
    var v = Number(s.value);
    ri.push(v);
    priv.push(TO_BYTE[v] || 1);
  });
  var i = -1;
  USERS.forEach(function (x, n) { if (x.user === u) i = n; });
  var entry = { user: u, pass: p, role: 'новий користувач', priv: priv, ri: ri };
  if (i >= 0) USERS[i] = entry; else USERS.push(entry);
  var m = -1;
  MATRIX.forEach(function (x, n) { if (x.key === u) m = n; });
  var matrixEntry = { key: u, label: u, values: ri };
  if (m >= 0) MATRIX[m] = matrixEntry; else MATRIX.push(matrixEntry);
  msg.className = 'ok';
  msg.textContent = 'Користувача ' + u + ' зареєстровано!';
  msg.hidden = false;
  buildCheckUsers();
};

document.getElementById('btn-chk').onclick = function () {
  if (!current) return;
  var key = document.getElementById('chk-user').value;
  var target = USERS.filter(function (x) { return x.user === key; })[0] || current;
  var selected = [];
  document.querySelectorAll('#chk-objects input:checked').forEach(function (x) {
    selected.push(Number(x.value));
  });
  var out = document.getElementById('chk-out');
  if (!selected.length) {
    out.textContent = 'Оберіть хоча б один об’єкт';
    out.hidden = false;
    return;
  }
  var html = '<b>' + target.user + '</b><table><tr><th>Об’єкт</th><th>Право</th></tr>';
  selected.forEach(function (i) {
    html += '<tr><td class="name">' + OBJECTS[i].id + ' — ' + OBJECTS[i].name + '</td><td>' + decodePriv(target.priv[i]) + '</td></tr>';
  });
  html += '</table>';
  out.innerHTML = html;
  out.hidden = false;
};

document.getElementById('btn-mat-go').onclick = function () {
  renderMatrix();
  show('matrix');
};

document.querySelectorAll('.btn-main').forEach(function (btn) {
  btn.onclick = function () {
    if (current) {
      syncCheckPanel();
      show('check');
    } else {
      show('login');
    }
  };
});

document.getElementById('btn-logout').onclick = function () {
  current = null;
  rightsUnlocked = false;
  document.getElementById('in-user').value = '';
  document.getElementById('in-pass').value = '';
  document.getElementById('in-err').hidden = true;
  document.getElementById('chk-out').hidden = true;
  show('login');
};

buildObjSelect();
