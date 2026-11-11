/**
 * T-Safe Dental Care — Google Sheets backend (Google Apps Script)
 * --------------------------------------------------------------
 * Paste this whole file into  Extensions → Apps Script  of your Google Sheet,
 * run  setup()  once, then  Deploy → New deployment → Web app
 * (Execute as: Me · Who has access: Anyone). Full steps are in SETUP.md.
 *
 * Sheets (tabs) created by setup():
 *   Products · Users · Sessions · Orders · Reviews · Subscribers
 */

// ----------------------------- CONFIG ---------------------------------
var CONFIG = {
  OWNER_EMAIL: '',            // new-order alerts are emailed here ('' = off)
  EMAIL_CUSTOMERS: true,      // email the customer when their order status changes (needs customer email)
  DELIVERY_FEE: 200,
  FREE_DELIVERY_FROM: 999,
  SESSION_DAYS: 30,
  MAX_PROOF_BYTES: 1024 * 1024,
  REVIEWS_NEED_APPROVAL: true // set Approved = TRUE in the Reviews tab to publish
};

var STATUSES = ['Order Placed', 'Payment Verified', 'Packed', 'Out For Delivery', 'Delivered', 'Cancelled'];
var PAY_METHODS = ['easypaisa', 'jazzcash', 'meezan'];

var HEADERS = {
  Products:    ['ID', 'Name', 'Price', 'MRP', 'Stock', 'Colors', 'Active'],
  Users:       ['UserID', 'Name', 'Email', 'Phone', 'Salt', 'PasswordHash', 'Role', 'CreatedAt'],
  Sessions:    ['TokenHash', 'UserID', 'Expires'],
  Orders:      ['OrderID', 'CreatedAt', 'UpdatedAt', 'UserID', 'Name', 'Email', 'Phone', 'Address', 'City',
                'Items', 'Subtotal', 'Delivery', 'Total', 'PaymentMethod', 'ProofURL', 'Status',
                'Courier', 'TrackingNo', 'History'],
  Reviews:     ['ReviewID', 'CreatedAt', 'UserID', 'Name', 'Rating', 'Title', 'Text', 'Approved'],
  Subscribers: ['Email', 'CreatedAt']
};

var SEED_PRODUCTS = [
  ['nano',   'Nano Toothbrush With Travel Case', 450, 900,  500, 'White,Black,Green,Pink', 'TRUE'],
  ['tongue', 'Essential Tongue Cleaner',         500, 999,  500, '',                       'TRUE'],
  ['aura',   'Soft Aura 15K Toothbrush',         999, 1999, 300, 'Jazz White,Attitude Black', 'TRUE'],
  ['bundle', 'Brush + Clean Bundle',             900, 1900, 300, 'White,Black,Green,Pink', 'TRUE']
];

// ----------------------------- SETUP ----------------------------------
/** Run once from the editor (select "setup" → Run). Safe to run again. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]])
        .setFontWeight('bold').setBackground('#ffe45c');
      sh.setFrozenRows(1);
    }
    // plain-text format so phone numbers keep their leading 0 and ISO dates stay text
    sh.getRange(1, 1, sh.getMaxRows(), HEADERS[name].length).setNumberFormat('@');
  });
  var p = ss.getSheetByName('Products');
  if (p.getLastRow() === 1) p.getRange(2, 1, SEED_PRODUCTS.length, 7).setValues(SEED_PRODUCTS);
  var def = ss.getSheetByName('Sheet1');
  if (def && def.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(def);
  proofFolder_();
  MailApp.getRemainingDailyQuota(); // touches Mail so Google asks for that permission now, not at the first order
  Logger.log('Setup complete. Now deploy as a Web app.');
}

/** Optional: add a daily time-driven trigger for this to delete expired login sessions. */
function purgeSessions() {
  var sh = sheet_('Sessions'), rows = readAll_('Sessions'), now = new Date();
  for (var i = rows.length - 1; i >= 0; i--) {
    if (new Date(rows[i].Expires) < now) sh.deleteRow(rows[i]._row);
  }
}

// ----------------------------- ROUTER ---------------------------------
function doGet() {
  return json_({ ok: true, data: { service: 'T-Safe API', time: new Date().toISOString() } });
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var fn = Object.prototype.hasOwnProperty.call(ACTIONS, body.action) ? ACTIONS[body.action] : null;
    if (!fn) fail_('Unknown action.');
    return json_({ ok: true, data: fn(body) });
  } catch (err) {
    var msg = (err && err.userMessage) ? err.message : 'Something went wrong. Please try again.';
    if (!(err && err.userMessage)) console.error(err && err.stack || err);
    return json_({ ok: false, error: msg });
  }
}

var ACTIONS = {
  products: products_,
  register: register_,
  login: login_,
  me: me_,
  logout: logout_,
  createOrder: createOrder_,
  myOrders: myOrders_,
  trackOrder: trackOrder_,
  adminOrders: adminOrders_,
  adminUpdateOrder: adminUpdateOrder_,
  adminDeleteOrder: adminDeleteOrder_,
  adminUsers: adminUsers_,
  adminUpdateUser: adminUpdateUser_,
  adminDeleteUser: adminDeleteUser_,
  adminProducts: adminProducts_,
  adminUpdateProduct: adminUpdateProduct_,
  adminReviews: adminReviews_,
  adminUpdateReview: adminUpdateReview_,
  adminDeleteReview: adminDeleteReview_,
  adminSubscribers: adminSubscribers_,
  reviews: reviews_,
  addReview: addReview_,
  subscribe: subscribe_
};

// ----------------------------- HELPERS --------------------------------
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function fail_(m) { var e = new Error(m); e.userMessage = true; throw e; }
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(n) { var s = ss_().getSheetByName(n); if (!s) fail_('Backend not set up: run setup() first.'); return s; }
function nowIso_() { return new Date().toISOString(); }
function str_(v, max) { return String(v == null ? '' : v).trim().slice(0, max || 200); }

/** Stop spreadsheet formula injection: a cell that starts with = + - @ is executed as a formula. */
function safe_(v) {
  v = String(v == null ? '' : v);
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}
function unsafe_(v) { v = String(v == null ? '' : v); return v.charAt(0) === "'" && /^'[=+\-@\t\r]/.test(v) ? v.slice(1) : v; }

function sha256_(s) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
  return raw.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}
function hashPassword_(salt, pw) {
  var h = salt + pw;
  for (var i = 0; i < 500; i++) h = sha256_(h + salt);
  return h;
}

function readAll_(name) {
  var sh = sheet_(name), last = sh.getLastRow();
  var head = HEADERS[name];
  if (last < 2) return [];
  var vals = sh.getRange(2, 1, last - 1, head.length).getValues();
  return vals.map(function (r, i) {
    var o = { _row: i + 2 };
    head.forEach(function (h, c) { o[h] = r[c]; });
    return o;
  });
}
function appendRow_(name, obj) {
  var sh = sheet_(name);
  var row = HEADERS[name].map(function (h) { return safe_(obj[h]); });
  sh.appendRow(row);
}
function updateCells_(name, rowNum, obj) {
  var sh = sheet_(name), head = HEADERS[name];
  Object.keys(obj).forEach(function (k) {
    var c = head.indexOf(k);
    if (c >= 0) sh.getRange(rowNum, c + 1).setValue(safe_(obj[k]));
  });
}

function normPhone_(p) {
  var d = String(p || '').replace(/[^\d]/g, '');
  if (d.indexOf('92') === 0 && d.length === 12) d = '0' + d.slice(2);
  return d;
}
function isPhone_(p) { return /^03\d{9}$/.test(normPhone_(p)); }
function isEmail_(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim()); }

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) fail_('The shop is busy right now. Please try again in a moment.');
  try { return fn(); } finally { lock.releaseLock(); }
}

// ----------------------------- AUTH -----------------------------------
function publicUser_(u) {
  return { id: u.UserID, name: unsafe_(u.Name), email: u.Email, phone: normPhone_(u.Phone), role: String(u.Role || 'customer').toLowerCase() };
}
function newSession_(userId) {
  var token = Utilities.getUuid() + Utilities.getUuid();
  var exp = new Date(Date.now() + CONFIG.SESSION_DAYS * 864e5).toISOString();
  appendRow_('Sessions', { TokenHash: sha256_(token), UserID: userId, Expires: exp });
  return token;
}
function userFromToken_(token) {
  if (!token) return null;
  var th = sha256_(String(token));
  var s = readAll_('Sessions').filter(function (r) { return r.TokenHash === th; })[0];
  if (!s || new Date(s.Expires) < new Date()) return null;
  return readAll_('Users').filter(function (u) { return u.UserID === s.UserID; })[0] || null;
}
function needUser_(token) { return userFromToken_(token) || fail_('Please log in to continue.'); }
function needAdmin_(token) {
  var u = needUser_(token);
  if (String(u.Role).toLowerCase() !== 'admin') fail_('Admins only.');
  return u;
}

function register_(b) {
  var name = str_(b.name, 80), email = str_(b.email, 120).toLowerCase(), phone = normPhone_(b.phone), pw = String(b.password || '');
  if (name.length < 2) fail_('Please enter your full name.');
  if (!isEmail_(email)) fail_('Please enter a valid email address.');
  if (!isPhone_(phone)) fail_('Enter a valid Pakistani mobile number (03XXXXXXXXX).');
  if (pw.length < 8 || pw.length > 100) fail_('Password must be at least 8 characters.');
  return withLock_(function () {
    var users = readAll_('Users');
    if (users.some(function (u) { return String(u.Email).toLowerCase() === email; })) fail_('An account with this email already exists.');
    var id = 'U-' + (users.length + 1) + '-' + Utilities.getUuid().slice(0, 4);
    var salt = Utilities.getUuid();
    var u = { UserID: id, Name: name, Email: email, Phone: phone, Salt: salt, PasswordHash: hashPassword_(salt, pw), Role: 'customer', CreatedAt: nowIso_() };
    appendRow_('Users', u);
    return { token: newSession_(id), user: publicUser_(u) };
  });
}

function login_(b) {
  var id = str_(b.identifier, 120).toLowerCase(), pw = String(b.password || '');
  if (!id || !pw) fail_('Enter your email/phone and password.');
  var phone = normPhone_(id);
  var u = readAll_('Users').filter(function (x) {
    return String(x.Email).toLowerCase() === id || (phone && normPhone_(x.Phone) === phone);
  })[0];
  if (!u || hashPassword_(String(u.Salt), pw) !== String(u.PasswordHash)) {
    Utilities.sleep(400); // slow down guessing
    fail_('Wrong email/phone or password.');
  }
  return { token: newSession_(u.UserID), user: publicUser_(u) };
}

function me_(b) { return { user: publicUser_(needUser_(b.token)) }; }

function logout_(b) {
  if (!b.token) return {};
  var th = sha256_(String(b.token));
  var s = readAll_('Sessions').filter(function (r) { return r.TokenHash === th; })[0];
  if (s) sheet_('Sessions').deleteRow(s._row);
  return {};
}

// ----------------------------- PRODUCTS -------------------------------
function loadProducts_() {
  return readAll_('Products').map(function (p) {
    return {
      id: String(p.ID), name: String(p.Name), price: Number(p.Price), mrp: Number(p.MRP),
      stock: p.Stock === '' || p.Stock == null ? null : Number(p.Stock),
      colors: String(p.Colors || '').split(',').map(function (c) { return c.trim(); }).filter(Boolean),
      active: String(p.Active).toUpperCase() !== 'FALSE', _row: p._row
    };
  });
}
function products_() {
  return loadProducts_().map(function (p) { return { id: p.id, name: p.name, price: p.price, mrp: p.mrp, stock: p.stock, active: p.active }; });
}

// ----------------------------- ORDERS ---------------------------------
function orderOut_(o, full) {
  var items = []; var history = [];
  try { items = JSON.parse(o.Items); } catch (e) {}
  try { history = JSON.parse(o.History); } catch (e) {}
  var out = {
    id: o.OrderID, createdAt: o.CreatedAt, updatedAt: o.UpdatedAt, status: o.Status,
    items: items, subtotal: Number(o.Subtotal), delivery: Number(o.Delivery), total: Number(o.Total),
    paymentMethod: o.PaymentMethod, courier: unsafe_(o.Courier), trackingNo: unsafe_(o.TrackingNo), history: history
  };
  if (full) {
    out.userId = o.UserID;
    out.proofUrl = o.ProofURL;
    out.customer = { name: unsafe_(o.Name), email: unsafe_(o.Email), phone: normPhone_(o.Phone), address: unsafe_(o.Address), city: unsafe_(o.City) };
  }
  return out;
}

function proofFolder_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('PROOF_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var f = DriveApp.createFolder('T-Safe Payment Proofs'); // private to the sheet owner
  props.setProperty('PROOF_FOLDER_ID', f.getId());
  return f;
}

function saveProof_(orderId, proof) {
  var type = String(proof.type || '');
  var allowed = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' };
  if (!allowed[type]) fail_('Proof must be a JPG, PNG or PDF file.');
  var data = String(proof.data || '');
  if (!data) fail_('Please upload your proof of payment.');
  if (data.length > CONFIG.MAX_PROOF_BYTES * 1.4) fail_('Proof file is larger than 1 MB.');
  var bytes = Utilities.base64Decode(data);
  if (bytes.length > CONFIG.MAX_PROOF_BYTES) fail_('Proof file is larger than 1 MB.');
  var blob = Utilities.newBlob(bytes, type, orderId + '.' + allowed[type]);
  return proofFolder_().createFile(blob).getUrl();
}

function createOrder_(b) {
  var user = needUser_(b.token); // ordering requires a logged-in account
  var c = b.customer || {};
  var name = str_(c.name, 80), email = str_(c.email, 120), phone = normPhone_(c.phone),
      address = str_(c.address, 300), city = str_(c.city, 60);
  if (name.length < 2) fail_('Please enter your name.');
  if (!isPhone_(phone)) fail_('Enter a valid Pakistani mobile number (03XXXXXXXXX).');
  if (email && !isEmail_(email)) fail_('That email address does not look right.');
  if (address.length < 8) fail_('Please enter your full delivery address.');
  if (city.length < 2) fail_('Please enter your city.');
  if (PAY_METHODS.indexOf(b.paymentMethod) < 0) fail_('Choose a payment method.');
  if (!b.proof || !b.proof.data) fail_('Please upload your proof of payment.');
  if (!Array.isArray(b.items) || !b.items.length || b.items.length > 20) fail_('Your cart is empty.');

  return withLock_(function () {
    // Prices always come from the Products sheet — never from the browser.
    var catalog = loadProducts_(), byId = {};
    catalog.forEach(function (p) { byId[p.id] = p; });

    var lines = [], wanted = {};
    b.items.forEach(function (it) {
      var p = byId[String(it.id)];
      if (!p || !p.active) fail_('A product in your cart is no longer available.');
      var qty = Math.floor(Number(it.qty));
      if (!(qty >= 1 && qty <= 20)) fail_('Invalid quantity.');
      var color = '';
      if (p.colors.length) {
        color = String(it.color || '');
        if (p.colors.indexOf(color) < 0) fail_('Please choose a colour for ' + p.name + '.');
      }
      wanted[p.id] = (wanted[p.id] || 0) + qty;
      var line = { id: p.id, name: p.name, color: color, qty: qty, price: p.price, mrp: p.mrp };
      // "Personalize Your Brush" — name written on the Soft Aura 15K (max 20 chars)
      var custom = p.id === 'aura' ? str_(it.custom, 20) : '';
      if (custom) line.custom = custom;
      lines.push(line);
    });
    Object.keys(wanted).forEach(function (id) {
      var p = byId[id];
      if (p.stock !== null && p.stock < wanted[id]) fail_(p.stock <= 0 ? p.name + ' is sold out.' : 'Only ' + p.stock + ' of ' + p.name + ' left in stock.');
    });

    var subtotal = lines.reduce(function (s, l) { return s + l.price * l.qty; }, 0);
    var delivery = subtotal >= CONFIG.FREE_DELIVERY_FROM ? 0 : CONFIG.DELIVERY_FEE;

    var props = PropertiesService.getScriptProperties();
    var seq = Number(props.getProperty('ORDER_SEQ') || 10000) + 1;
    var orderId = 'TS-' + seq;

    var proofUrl = saveProof_(orderId, b.proof);
    props.setProperty('ORDER_SEQ', String(seq));

    // decrement stock
    Object.keys(wanted).forEach(function (id) {
      var p = byId[id];
      if (p.stock !== null) updateCells_('Products', p._row, { Stock: p.stock - wanted[id] });
    });

    var ts = nowIso_();
    appendRow_('Orders', {
      OrderID: orderId, CreatedAt: ts, UpdatedAt: ts, UserID: user.UserID,
      Name: name, Email: email, Phone: phone, Address: address, City: city,
      Items: JSON.stringify(lines), Subtotal: subtotal, Delivery: delivery, Total: subtotal + delivery,
      PaymentMethod: b.paymentMethod, ProofURL: proofUrl, Status: 'Order Placed',
      Courier: '', TrackingNo: '', History: JSON.stringify([{ status: 'Order Placed', at: ts, note: '' }])
    });

    notifyOwner_(orderId, name, phone, subtotal + delivery, proofUrl);
    return { orderId: orderId, total: subtotal + delivery };
  });
}

function myOrders_(b) {
  var u = needUser_(b.token);
  return readAll_('Orders')
    .filter(function (o) { return o.UserID === u.UserID; })
    .reverse().map(function (o) { return orderOut_(o, true); })
    .map(function (o) { delete o.proofUrl; return o; });
}

function trackOrder_(b) {
  var id = str_(b.orderId, 30).toUpperCase(), phone = normPhone_(b.phone);
  var o = readAll_('Orders').filter(function (x) { return String(x.OrderID).toUpperCase() === id; })[0];
  if (!o || normPhone_(o.Phone) !== phone) {
    Utilities.sleep(400);
    fail_('No order found with that Order ID and phone number.');
  }
  var out = orderOut_(o, false);
  out.customer = { name: unsafe_(o.Name), city: unsafe_(o.City) };
  return out;
}

function adminOrders_(b) {
  needAdmin_(b.token);
  return readAll_('Orders').reverse().map(function (o) { return orderOut_(o, true); });
}

function adminUpdateOrder_(b) {
  needAdmin_(b.token);
  return withLock_(function () {
    var o = readAll_('Orders').filter(function (x) { return x.OrderID === b.orderId; })[0];
    if (!o) fail_('Order not found.');
    var patch = { UpdatedAt: nowIso_() };
    if (b.courier !== undefined) patch.Courier = str_(b.courier, 60);
    if (b.trackingNo !== undefined) patch.TrackingNo = str_(b.trackingNo, 60);

    // Optional: correct the customer's delivery details.
    if (b.customer) {
      var c = b.customer;
      var cn = str_(c.name, 80), ce = str_(c.email, 120), cp = normPhone_(c.phone), ca = str_(c.address, 300), cc = str_(c.city, 60);
      if (cn.length < 2) fail_('Customer name is too short.');
      if (!isPhone_(cp)) fail_('Enter a valid Pakistani mobile number (03XXXXXXXXX).');
      if (ce && !isEmail_(ce)) fail_('That email address does not look right.');
      if (ca.length < 8) fail_('Delivery address is too short.');
      if (cc.length < 2) fail_('Please enter the city.');
      patch.Name = cn; patch.Email = ce; patch.Phone = cp; patch.Address = ca; patch.City = cc;
    }

    var statusChanged = false;
    if (b.status && b.status !== o.Status) {
      if (STATUSES.indexOf(b.status) < 0) fail_('Invalid status.');
      var history = []; try { history = JSON.parse(o.History); } catch (e) {}
      history.push({ status: b.status, at: nowIso_(), note: str_(b.note, 200) });
      patch.Status = b.status;
      patch.History = JSON.stringify(history);
      statusChanged = true;
      adjustStockOnCancel_(o, b.status);
    }
    updateCells_('Orders', o._row, patch);
    var fresh = readAll_('Orders').filter(function (x) { return x.OrderID === b.orderId; })[0];
    if (statusChanged) notifyCustomer_(fresh);
    return orderOut_(fresh, true);
  });
}

/** Permanently delete an order row (stock is returned unless it was already cancelled). */
function adminDeleteOrder_(b) {
  needAdmin_(b.token);
  return withLock_(function () {
    var o = readAll_('Orders').filter(function (x) { return x.OrderID === b.orderId; })[0];
    if (!o) fail_('Order not found.');
    adjustStockOnCancel_(o, 'Cancelled');
    sheet_('Orders').deleteRow(o._row);
    return {};
  });
}

/** Give stock back when an order is cancelled (and take it again if a cancellation is reversed). */
function adjustStockOnCancel_(order, newStatus) {
  var was = order.Status === 'Cancelled', will = newStatus === 'Cancelled';
  if (was === will) return;
  var items = []; try { items = JSON.parse(order.Items); } catch (e) {}
  var byId = {}; loadProducts_().forEach(function (p) { byId[p.id] = p; });
  items.forEach(function (it) {
    var p = byId[it.id];
    if (p && p.stock !== null) {
      byId[it.id].stock = p.stock + (will ? it.qty : -it.qty);
      updateCells_('Products', p._row, { Stock: Math.max(0, byId[it.id].stock) });
    }
  });
}

// ----------------------------- ADMIN: USERS ---------------------------
function adminUserOut_(u, orders) {
  var mine = orders.filter(function (o) { return o.UserID === u.UserID && o.Status !== 'Cancelled'; });
  return {
    id: u.UserID, name: unsafe_(u.Name), email: String(u.Email), phone: normPhone_(u.Phone),
    role: String(u.Role || 'customer').toLowerCase(), createdAt: u.CreatedAt,
    orders: mine.length, spent: mine.reduce(function (s, o) { return s + Number(o.Total || 0); }, 0)
  };
}

function adminUsers_(b) {
  needAdmin_(b.token);
  var orders = readAll_('Orders');
  return readAll_('Users').reverse().map(function (u) { return adminUserOut_(u, orders); });
}

function deleteSessionsOf_(userId, keepTokenHash) {
  var sh = sheet_('Sessions'), rows = readAll_('Sessions');
  for (var i = rows.length - 1; i >= 0; i--) {
    if (rows[i].UserID === userId && rows[i].TokenHash !== keepTokenHash) sh.deleteRow(rows[i]._row);
  }
}

function adminUpdateUser_(b) {
  var me = needAdmin_(b.token);
  return withLock_(function () {
    var users = readAll_('Users');
    var u = users.filter(function (x) { return x.UserID === b.userId; })[0];
    if (!u) fail_('User not found.');
    var isSelf = u.UserID === me.UserID, patch = {};

    if (b.name !== undefined) {
      var n = str_(b.name, 80); if (n.length < 2) fail_('Please enter the full name.'); patch.Name = n;
    }
    if (b.email !== undefined) {
      var em = str_(b.email, 120).toLowerCase(); if (!isEmail_(em)) fail_('Please enter a valid email address.');
      if (users.some(function (x) { return x.UserID !== u.UserID && String(x.Email).toLowerCase() === em; })) fail_('Another account already uses that email.');
      patch.Email = em;
    }
    if (b.phone !== undefined) {
      var ph = normPhone_(b.phone); if (!isPhone_(ph)) fail_('Enter a valid Pakistani mobile number (03XXXXXXXXX).'); patch.Phone = ph;
    }
    if (b.role !== undefined) {
      var role = String(b.role).toLowerCase();
      if (role !== 'customer' && role !== 'admin') fail_('Invalid role.');
      if (role !== String(u.Role || 'customer').toLowerCase() && isSelf) fail_('You cannot change your own role.');
      patch.Role = role;
    }
    var pwChanged = false;
    if (b.newPassword) {
      var pw = String(b.newPassword);
      if (pw.length < 8 || pw.length > 100) fail_('Password must be at least 8 characters.');
      var salt = Utilities.getUuid();
      patch.Salt = salt; patch.PasswordHash = hashPassword_(salt, pw);
      pwChanged = true;
    }
    updateCells_('Users', u._row, patch);
    if (pwChanged) deleteSessionsOf_(u.UserID, isSelf ? sha256_(String(b.token)) : null); // sign the user out everywhere
    var fresh = readAll_('Users').filter(function (x) { return x.UserID === u.UserID; })[0];
    return adminUserOut_(fresh, readAll_('Orders'));
  });
}

/** Delete an account + its login sessions. Their past orders stay in the Orders sheet. */
function adminDeleteUser_(b) {
  var me = needAdmin_(b.token);
  return withLock_(function () {
    var u = readAll_('Users').filter(function (x) { return x.UserID === b.userId; })[0];
    if (!u) fail_('User not found.');
    if (u.UserID === me.UserID) fail_('You cannot delete your own account.');
    deleteSessionsOf_(u.UserID, null);
    sheet_('Users').deleteRow(u._row);
    return {};
  });
}

// ----------------------------- ADMIN: PRODUCTS ------------------------
function adminProductOut_(p) {
  return { id: p.id, name: p.name, price: p.price, mrp: p.mrp, stock: p.stock, colors: p.colors, active: p.active };
}
function adminProducts_(b) {
  needAdmin_(b.token);
  return loadProducts_().map(adminProductOut_);
}
function adminUpdateProduct_(b) {
  needAdmin_(b.token);
  return withLock_(function () {
    var p = loadProducts_().filter(function (x) { return x.id === String(b.id); })[0];
    if (!p) fail_('Product not found.');
    var patch = {};
    if (b.price !== undefined) {
      var price = Math.round(Number(b.price)); if (!(price >= 0)) fail_('Enter a valid price.'); patch.Price = price;
    }
    if (b.mrp !== undefined) {
      var mrp = Math.round(Number(b.mrp)); if (!(mrp >= 0)) fail_('Enter a valid MRP.'); patch.MRP = mrp;
    }
    if (b.stock !== undefined) { // blank / null = unlimited
      if (b.stock === '' || b.stock === null) patch.Stock = '';
      else { var st = Math.floor(Number(b.stock)); if (!(st >= 0)) fail_('Enter a valid stock number.'); patch.Stock = st; }
    }
    if (b.active !== undefined) patch.Active = b.active ? 'TRUE' : 'FALSE';
    updateCells_('Products', p._row, patch);
    return adminProductOut_(loadProducts_().filter(function (x) { return x.id === p.id; })[0]);
  });
}

// ----------------------------- ADMIN: REVIEWS / SUBSCRIBERS -----------
function adminReviews_(b) {
  needAdmin_(b.token);
  return readAll_('Reviews').reverse().map(function (r) {
    return { id: r.ReviewID, createdAt: r.CreatedAt, userId: r.UserID, name: unsafe_(r.Name), rating: Number(r.Rating),
             title: unsafe_(r.Title), text: unsafe_(r.Text), approved: String(r.Approved).toUpperCase() === 'TRUE' };
  });
}
function adminUpdateReview_(b) {
  needAdmin_(b.token);
  return withLock_(function () {
    var r = readAll_('Reviews').filter(function (x) { return x.ReviewID === b.reviewId; })[0];
    if (!r) fail_('Review not found.');
    updateCells_('Reviews', r._row, { Approved: b.approved ? 'TRUE' : 'FALSE' });
    return {};
  });
}
function adminDeleteReview_(b) {
  needAdmin_(b.token);
  return withLock_(function () {
    var r = readAll_('Reviews').filter(function (x) { return x.ReviewID === b.reviewId; })[0];
    if (!r) fail_('Review not found.');
    sheet_('Reviews').deleteRow(r._row);
    return {};
  });
}
function adminSubscribers_(b) {
  needAdmin_(b.token);
  return readAll_('Subscribers').reverse().map(function (s) { return { email: String(s.Email), createdAt: s.CreatedAt }; });
}

// ----------------------------- REVIEWS / NEWSLETTER -------------------
function reviews_() {
  return readAll_('Reviews')
    .filter(function (r) { return String(r.Approved).toUpperCase() === 'TRUE'; })
    .reverse()
    .map(function (r) {
      return { id: r.ReviewID, createdAt: r.CreatedAt, name: unsafe_(r.Name), rating: Number(r.Rating), title: unsafe_(r.Title), text: unsafe_(r.Text), approved: true };
    });
}

function addReview_(b) {
  var u = needUser_(b.token);
  var rating = Math.floor(Number(b.rating));
  if (!(rating >= 1 && rating <= 5)) fail_('Choose a star rating.');
  var text = str_(b.text, 600);
  if (text.length < 5) fail_('Please write a few words about your experience.');
  return withLock_(function () {
    var n = Math.max(0, sheet_('Reviews').getLastRow() - 1);
    appendRow_('Reviews', {
      ReviewID: 'R-' + (n + 1), CreatedAt: nowIso_(), UserID: u.UserID, Name: u.Name, Rating: rating,
      Title: str_(b.title, 80), Text: text, Approved: CONFIG.REVIEWS_NEED_APPROVAL ? 'FALSE' : 'TRUE'
    });
    return { pending: CONFIG.REVIEWS_NEED_APPROVAL };
  });
}

function subscribe_(b) {
  var email = str_(b.email, 120).toLowerCase();
  if (!isEmail_(email)) fail_('Please enter a valid email address.');
  return withLock_(function () {
    var exists = readAll_('Subscribers').some(function (s) { return String(s.Email).toLowerCase() === email; });
    if (!exists) appendRow_('Subscribers', { Email: email, CreatedAt: nowIso_() });
    return {};
  });
}

// ----------------------------- EMAIL ----------------------------------
function notifyOwner_(orderId, name, phone, total, proofUrl) {
  if (!CONFIG.OWNER_EMAIL) return;
  try {
    MailApp.sendEmail(CONFIG.OWNER_EMAIL, 'New T-Safe order ' + orderId,
      'Order ' + orderId + '\nCustomer: ' + name + ' (' + phone + ')\nTotal: Rs. ' + total + '/-\nProof: ' + proofUrl +
      '\n\nOpen the Orders tab (or the Admin page on the website) to verify the payment.');
  } catch (e) { console.error(e); }
}
function notifyCustomer_(o) {
  if (!CONFIG.EMAIL_CUSTOMERS || !isEmail_(o.Email)) return;
  try {
    MailApp.sendEmail(String(o.Email), 'T-Safe order ' + o.OrderID + ' — ' + o.Status,
      'Hi ' + unsafe_(o.Name) + ',\n\nYour order ' + o.OrderID + ' is now: ' + o.Status + '.' +
      (o.TrackingNo ? '\nCourier: ' + unsafe_(o.Courier) + ' · Tracking no. ' + unsafe_(o.TrackingNo) : '') +
      '\n\nTrack it any time with your Order ID and phone number on our website.\n\nT-Safe — Exceptional Care Starts Here.');
  } catch (e) { console.error(e); }
}
