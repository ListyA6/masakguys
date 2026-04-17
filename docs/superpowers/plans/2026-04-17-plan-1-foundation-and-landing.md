# Plan 1 — Foundation & Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build project scaffolding, shared design tokens, mock-data API facade, the Pedesan landing page (`index.html`) with pepsico-style scroll animations, and the persistent floating chat widget shell.

**Architecture:** Static HTML/CSS/JS. Locomotive Scroll for smooth scrolling, GSAP + ScrollTrigger for pinning/reveal animations, Swiper.js for carousels (used later by order page — vendor bundled here so all plans share it), Chart.js (vendored here, used later by manager). All data access goes through `js/api.js` which reads from `js/mock-data.js` — this facade lets later plans swap to real fetch without touching UI.

**Tech Stack:** Vanilla HTML/CSS/JS, Locomotive Scroll 4, GSAP 3 (+ ScrollTrigger), Swiper 11, Chart.js 4. Vendored via CDN links (no bundler).

**Reference spec:** `docs/superpowers/specs/2026-04-17-pedesan-site-design.md`

**Testing approach:** This is pure frontend with animations and DOM interactions. Automated unit tests add little value for scroll choreography and visual polish. Instead, each task ends with a **manual verification step** that describes exactly what to open, what to do, and what to see. Where pure logic is testable (delivery tier calc, etc.), we add lightweight QUnit-style inline tests in a `/tests/tests.html` harness that runs in the browser.

---

## File Structure

```
/
  index.html                            (landing page)
  /css
    tokens.css                          (design tokens: colors, spacing, fonts)
    base.css                            (reset, base typography, utilities)
    chat-widget.css                     (floating chat widget styles)
    landing.css                         (landing-specific sections)
  /js
    mock-data.js                        (mock ingredients, menus, orders, queue, feedback)
    api.js                              (facade — all reads/writes go through this)
    store.js                            (localStorage wrappers: cart, love, customer, chat session)
    chat-widget.js                      (creates + manages floating chat widget)
    landing.js                          (Locomotive + GSAP scroll choreography, queue counter)
    utils.js                            (formatRupiah, clamp, debounce, etc.)
  /vendor
    gsap.min.js
    ScrollTrigger.min.js
    locomotive-scroll.min.js
    locomotive-scroll.min.css
    swiper-bundle.min.js
    swiper-bundle.min.css
    chart.umd.min.js
  /assets
    /img                                (brand + section imagery, sample carousel pics copied here)
    /video                              (hero/section background videos — placeholder)
  /tests
    tests.html                          (QUnit-style browser test harness)
    test-api.js
    test-store.js
    test-utils.js
```

**Sample pics (`1.png`–`7.png`)** stay at repo root (they're referenced by the spec) — we'll reference them directly via relative paths in mock-data.

---

## Task 1: Project scaffolding & vendor libs

**Files:**
- Create: `index.html` (skeleton only)
- Create: `css/tokens.css`, `css/base.css`
- Create: `vendor/` with downloaded libs

- [ ] **Step 1: Create `css/tokens.css` with design tokens**

```css
/* css/tokens.css — Pedesan brand tokens */
:root {
  /* Colors */
  --bg-0: #0e0b0a;             /* deep charcoal page */
  --bg-1: #181210;             /* elevated surface */
  --bg-2: #221916;             /* card */
  --fg-0: #f5efe6;             /* cream text */
  --fg-1: #cbbfae;             /* muted text */
  --fg-2: #8a7e6e;             /* dim text */
  --accent: #ff3b1f;           /* fiery red */
  --accent-2: #ffa41b;         /* ember orange */
  --danger: #ff3b30;
  --success: #2ecc71;
  --warning: #ffb020;
  --info: #3aa1ff;

  /* Spacing */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px;
  --s-5: 24px; --s-6: 32px; --s-7: 48px; --s-8: 64px; --s-9: 96px;

  /* Radius */
  --r-1: 4px; --r-2: 8px; --r-3: 12px; --r-4: 20px; --r-full: 999px;

  /* Type scale */
  --fs-xs: 12px; --fs-sm: 14px; --fs-md: 16px; --fs-lg: 18px;
  --fs-xl: 22px; --fs-2xl: 28px; --fs-3xl: 40px; --fs-4xl: 64px; --fs-5xl: 112px;

  /* Fonts */
  --font-display: 'Anton', 'Bebas Neue', Impact, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;

  /* Layout */
  --container: 1200px;
  --z-nav: 50; --z-cart: 60; --z-chat: 70; --z-modal: 80;

  /* Motion */
  --ease-out: cubic-bezier(.2,.7,.2,1);
  --ease-spring: cubic-bezier(.34,1.56,.64,1);
  --d-fast: 150ms; --d-base: 300ms; --d-slow: 600ms;
}
```

- [ ] **Step 2: Create `css/base.css`**

```css
/* css/base.css — reset, typography, utilities */
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg-0);
  color: var(--fg-0);
  font-family: var(--font-body);
  font-size: var(--fs-md);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
img, video { display: block; max-width: 100%; height: auto; }
button { font: inherit; color: inherit; cursor: pointer; }
a { color: inherit; text-decoration: none; }
h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 400; letter-spacing: .02em; margin: 0; line-height: 1; }
p { margin: 0 0 var(--s-4); }

/* utilities */
.container { max-width: var(--container); margin: 0 auto; padding: 0 var(--s-5); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: var(--s-3) var(--s-5); border-radius: var(--r-full); border: 0;
  background: var(--accent); color: #fff; font-weight: 600;
  transition: transform var(--d-fast) var(--ease-out), background var(--d-fast);
}
.btn:hover { background: var(--accent-2); }
.btn:active { transform: scale(.96); }
.btn--ghost { background: transparent; border: 1px solid var(--fg-2); color: var(--fg-0); }
```

- [ ] **Step 3: Download vendor libraries**

Run from project root:
```bash
mkdir -p vendor
curl -L -o vendor/gsap.min.js https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js
curl -L -o vendor/ScrollTrigger.min.js https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js
curl -L -o vendor/locomotive-scroll.min.js https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.js
curl -L -o vendor/locomotive-scroll.min.css https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.css
curl -L -o vendor/swiper-bundle.min.js https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js
curl -L -o vendor/swiper-bundle.min.css https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css
curl -L -o vendor/chart.umd.min.js https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js
```

Expected: 7 files in `vendor/`, each > 1KB.

- [ ] **Step 4: Create `index.html` skeleton**

```html
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pedesan — Pedas yang bikin nagih</title>
  <meta name="description" content="Pedesan: usus, paru, babat, empal. Pedas legit, dari dapur Kediri." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="vendor/locomotive-scroll.min.css" />
  <link rel="stylesheet" href="css/tokens.css" />
  <link rel="stylesheet" href="css/base.css" />
  <link rel="stylesheet" href="css/chat-widget.css" />
  <link rel="stylesheet" href="css/landing.css" />
</head>
<body>
  <main data-scroll-container>
    <!-- sections inserted by later tasks -->
  </main>

  <script src="vendor/gsap.min.js"></script>
  <script src="vendor/ScrollTrigger.min.js"></script>
  <script src="vendor/locomotive-scroll.min.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/mock-data.js"></script>
  <script src="js/api.js"></script>
  <script src="js/store.js"></script>
  <script src="js/chat-widget.js"></script>
  <script src="js/landing.js"></script>
</body>
</html>
```

- [ ] **Step 5: Manual verification**

Start XAMPP Apache. Open `http://localhost/masakguys/` in a browser.
Expected: page loads without errors, dark background visible, DevTools Network tab shows all vendor files 200 OK, no console errors (ignore the one that `js/` files don't exist yet — those will 404 until later tasks).

- [ ] **Step 6: Commit**

```bash
git add css/ vendor/ index.html
git commit -m "scaffold: base CSS tokens, vendor libs, index.html skeleton"
```

---

## Task 2: Utilities + tests harness

**Files:**
- Create: `js/utils.js`
- Create: `tests/tests.html`, `tests/test-utils.js`

- [ ] **Step 1: Write failing tests in `tests/test-utils.js`**

```js
// tests/test-utils.js
QUnit.module('utils');

QUnit.test('formatRupiah formats integer', assert => {
  assert.equal(formatRupiah(3000), 'Rp3.000');
  assert.equal(formatRupiah(15000), 'Rp15.000');
  assert.equal(formatRupiah(0), 'Rp0');
  assert.equal(formatRupiah(1234567), 'Rp1.234.567');
});

QUnit.test('clamp clamps values', assert => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(11, 0, 10), 10);
});

QUnit.test('deliveryFee returns correct tier', assert => {
  assert.equal(deliveryFee(1), 3000);
  assert.equal(deliveryFee(3), 3000);
  assert.equal(deliveryFee(3.5), 8000);
  assert.equal(deliveryFee(4), 8000);
  assert.equal(deliveryFee(5), 10000);
  assert.equal(deliveryFee(6), 15000);
  assert.equal(deliveryFee(20), 15000);
});

QUnit.test('haversineKm computes distance between two points', assert => {
  // Jakarta-ish → Bandung-ish ~ 120 km
  const d = haversineKm(-6.2, 106.8, -6.9, 107.6);
  assert.ok(d > 110 && d < 130, `expected ~120km, got ${d}`);
});
```

- [ ] **Step 2: Create `tests/tests.html`**

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>MasakGuys frontend tests</title>
  <link rel="stylesheet" href="https://code.jquery.com/qunit/qunit-2.20.0.css" />
</head>
<body>
  <div id="qunit"></div>
  <div id="qunit-fixture"></div>
  <script src="https://code.jquery.com/qunit/qunit-2.20.0.js"></script>

  <!-- code under test -->
  <script src="../js/utils.js"></script>
  <script src="../js/store.js"></script>
  <script src="../js/mock-data.js"></script>
  <script src="../js/api.js"></script>

  <!-- tests -->
  <script src="test-utils.js"></script>
  <script src="test-store.js"></script>
  <script src="test-api.js"></script>
</body>
</html>
```

- [ ] **Step 3: Run tests to verify failure**

Open `http://localhost/masakguys/tests/tests.html`.
Expected: tests fail — `formatRupiah is not defined`, etc. (Ignore missing `test-store.js`/`test-api.js` — later tasks add them.)

- [ ] **Step 4: Implement `js/utils.js`**

```js
// js/utils.js
/** Format an integer as rupiah like "Rp3.000". */
function formatRupiah(n) {
  const abs = Math.abs(Math.trunc(n));
  const s = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (n < 0 ? '-Rp' : 'Rp') + s;
}

/** Clamp v into [min, max]. */
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/** Delivery fee from distance in km, per spec. */
function deliveryFee(km) {
  if (km <= 3) return 3000;
  if (km <= 4) return 8000;
  if (km <= 5) return 10000;
  return 15000;
}

/** Great-circle distance in kilometers between two lat/lng points. */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Debounce f by delay ms. */
function debounce(f, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => f(...args), delay);
  };
}

/** Random id (for mock orders/sessions). */
function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 10);
}

/** Shallow-random pick N items from array, with replacement. */
function sampleN(arr, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(Math.random() * arr.length)]);
  return out;
}
```

- [ ] **Step 5: Run tests — verify pass**

Reload `tests/tests.html`. Expected: utils module tests all pass (green).

- [ ] **Step 6: Commit**

```bash
git add js/utils.js tests/tests.html tests/test-utils.js
git commit -m "feat: utility helpers (rupiah, clamp, deliveryFee, haversine) with tests"
```

---

## Task 3: localStorage wrappers (`store.js`)

**Files:**
- Create: `js/store.js`
- Create: `tests/test-store.js`

- [ ] **Step 1: Write failing tests in `tests/test-store.js`**

```js
// tests/test-store.js
QUnit.module('store', {
  beforeEach: () => localStorage.clear()
});

QUnit.test('cart: add, increment, decrement, remove', assert => {
  Store.cart.add('menu-1', 'pedas level 5');
  assert.deepEqual(Store.cart.get(), [{ menu_id: 'menu-1', qty: 1, catatan: 'pedas level 5' }]);

  Store.cart.setQty('menu-1', 3);
  assert.equal(Store.cart.get()[0].qty, 3);

  Store.cart.setQty('menu-1', 0);
  assert.deepEqual(Store.cart.get(), []);
});

QUnit.test('cart: count sums quantities', assert => {
  Store.cart.add('a'); Store.cart.setQty('a', 2);
  Store.cart.add('b'); Store.cart.setQty('b', 3);
  assert.equal(Store.cart.count(), 5);
});

QUnit.test('love: toggle persists', assert => {
  assert.equal(Store.love.has('menu-1'), false);
  Store.love.toggle('menu-1');
  assert.equal(Store.love.has('menu-1'), true);
  Store.love.toggle('menu-1');
  assert.equal(Store.love.has('menu-1'), false);
});

QUnit.test('customer: set and get', assert => {
  Store.customer.set({ nama: 'Budi', wa: '081234' });
  assert.deepEqual(Store.customer.get(), { nama: 'Budi', wa: '081234' });
});

QUnit.test('chat: session id is stable', assert => {
  const id1 = Store.chat.sessionId();
  const id2 = Store.chat.sessionId();
  assert.equal(id1, id2);
  assert.ok(id1.length > 4);
});
```

- [ ] **Step 2: Run tests — verify fail**

Reload `tests/tests.html`. Expected: store tests fail — `Store is not defined`.

- [ ] **Step 3: Implement `js/store.js`**

```js
// js/store.js — localStorage wrappers
const _k = {
  cart: 'mg:cart',
  love: 'mg:love',
  customer: 'mg:customer',
  chatSession: 'mg:chatSession'
};

function _read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function _write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

const Store = {
  cart: {
    get() { return _read(_k.cart, []); },
    add(menu_id, catatan = '') {
      const items = Store.cart.get();
      const existing = items.find(i => i.menu_id === menu_id);
      if (existing) existing.qty += 1;
      else items.push({ menu_id, qty: 1, catatan });
      _write(_k.cart, items);
    },
    setQty(menu_id, qty) {
      let items = Store.cart.get();
      if (qty <= 0) items = items.filter(i => i.menu_id !== menu_id);
      else {
        const ex = items.find(i => i.menu_id === menu_id);
        if (ex) ex.qty = qty;
        else items.push({ menu_id, qty, catatan: '' });
      }
      _write(_k.cart, items);
    },
    setCatatan(menu_id, catatan) {
      const items = Store.cart.get();
      const ex = items.find(i => i.menu_id === menu_id);
      if (ex) { ex.catatan = catatan; _write(_k.cart, items); }
    },
    count() { return Store.cart.get().reduce((s, i) => s + i.qty, 0); },
    clear() { _write(_k.cart, []); }
  },
  love: {
    get() { return new Set(_read(_k.love, [])); },
    has(menu_id) { return Store.love.get().has(menu_id); },
    toggle(menu_id) {
      const set = Store.love.get();
      if (set.has(menu_id)) set.delete(menu_id); else set.add(menu_id);
      _write(_k.love, [...set]);
    }
  },
  customer: {
    get() { return _read(_k.customer, null); },
    set(c) { _write(_k.customer, c); }
  },
  chat: {
    sessionId() {
      let id = _read(_k.chatSession, null);
      if (!id) { id = 'chat-' + Math.random().toString(36).slice(2, 10); _write(_k.chatSession, id); }
      return id;
    },
    reset() { localStorage.removeItem(_k.chatSession); }
  }
};
```

- [ ] **Step 4: Run tests — verify pass**

Reload `tests/tests.html`. Expected: store module tests pass.

- [ ] **Step 5: Commit**

```bash
git add js/store.js tests/test-store.js
git commit -m "feat: localStorage wrappers for cart, love, customer, chat session"
```

---

## Task 4: Mock data

**Files:**
- Create: `js/mock-data.js`

- [ ] **Step 1: Implement mock data**

```js
// js/mock-data.js — mock fixtures used by api.js. Will be replaced by real fetch later.
const SAMPLE_PICS = ['1.png','2.png','3.png','4.png','5.png','6.png','7.png'];

function _rotateMedia(startIdx, n = 4) {
  const out = [];
  for (let i = 0; i < n; i++) out.push({ type: 'image', src: SAMPLE_PICS[(startIdx + i) % SAMPLE_PICS.length] });
  return out;
}

const MOCK = {
  brand: { id: 'pedesan', nama: 'Pedesan', tagline: 'Pedas yang bikin nagih.' },

  ingredients: [
    { id: 'usus',  nama: 'Usus ayam', unit: 'porsi', stock: 30, min_stock: 5,  cost_per_unit: 3000 },
    { id: 'paru',  nama: 'Paru sapi', unit: 'porsi', stock: 20, min_stock: 5,  cost_per_unit: 6000 },
    { id: 'babat', nama: 'Babat',     unit: 'porsi', stock: 15, min_stock: 3,  cost_per_unit: 7000 },
    { id: 'empal', nama: 'Empal',     unit: 'porsi', stock: 25, min_stock: 5,  cost_per_unit: 8000 },
    { id: 'nasi',  nama: 'Nasi',      unit: 'porsi', stock: 200,min_stock: 30, cost_per_unit: 2000 },
    { id: 'bumbu', nama: 'Bumbu pedas',unit: 'porsi',stock: 100,min_stock: 20, cost_per_unit: 1000 },
    { id: 'es',    nama: 'Es teh',    unit: 'gelas', stock: 80, min_stock: 10, cost_per_unit: 2000 },
    { id: 'krupuk',nama: 'Krupuk',    unit: 'pcs',   stock: 100,min_stock: 15, cost_per_unit: 1000 }
  ],

  menus: [
    { id: 'm1', brand: 'pedesan', kategori: 'makanan', nama: 'Usus Pedas',    deskripsi: 'Usus ayam digoreng kering dengan bumbu pedas khas.',       harga: 18000, order: 1, love_count: 42, recipe: [{ingredient_id:'usus',qty:1},{ingredient_id:'nasi',qty:1},{ingredient_id:'bumbu',qty:1}], media: _rotateMedia(0) },
    { id: 'm2', brand: 'pedesan', kategori: 'makanan', nama: 'Paru Crispy',   deskripsi: 'Paru sapi goreng super renyah, bumbu level 1–5.',           harga: 22000, order: 2, love_count: 63, recipe: [{ingredient_id:'paru',qty:1},{ingredient_id:'nasi',qty:1},{ingredient_id:'bumbu',qty:1}], media: _rotateMedia(1) },
    { id: 'm3', brand: 'pedesan', kategori: 'makanan', nama: 'Babat Gongso',  deskripsi: 'Babat bumbu gongso, pedas manis khas Jawa.',                harga: 24000, order: 3, love_count: 28, recipe: [{ingredient_id:'babat',qty:1},{ingredient_id:'nasi',qty:1},{ingredient_id:'bumbu',qty:1}], media: _rotateMedia(2) },
    { id: 'm4', brand: 'pedesan', kategori: 'makanan', nama: 'Empal Suwir',   deskripsi: 'Empal disuwir, dipadu sambal bawang.',                      harga: 25000, order: 4, love_count: 51, recipe: [{ingredient_id:'empal',qty:1},{ingredient_id:'nasi',qty:1},{ingredient_id:'bumbu',qty:1}], media: _rotateMedia(3) },
    { id: 'm5', brand: 'pedesan', kategori: 'minuman', nama: 'Es Teh Manis',  deskripsi: 'Segar, pas buat menyeimbangkan pedas.',                     harga: 5000,  order: 1, love_count: 12, recipe: [{ingredient_id:'es',qty:1}], media: _rotateMedia(4) },
    { id: 'm6', brand: 'pedesan', kategori: 'minuman', nama: 'Es Teh Tawar',  deskripsi: 'Teh tawar dingin.',                                          harga: 4000,  order: 2, love_count: 6,  recipe: [{ingredient_id:'es',qty:1}], media: _rotateMedia(5) },
    { id: 'm7', brand: 'pedesan', kategori: 'tambahan',nama: 'Krupuk',        deskripsi: 'Krupuk renyah pendamping.',                                  harga: 2000,  order: 1, love_count: 3,  recipe: [{ingredient_id:'krupuk',qty:1}], media: _rotateMedia(6) }
  ],

  // aggregate queue across all brands (mocked)
  queue: { total: 14, by_brand: { pedesan: 8, nasi_goreng: 6 } },

  // kitchen origin (for distance calc)
  kitchen_coord: { lat: -7.8167, lng: 112.0167 }, // Kediri approx

  orders: [], // populated at runtime
  customers: [],
  feedback: [],
  expenses: []
};
```

- [ ] **Step 2: Manual verification**

Open DevTools console on any page that loads `mock-data.js`. Run `MOCK.menus.length` — expected: `7`. Run `MOCK.menus[0].media` — expected: 4-item array of `{type:'image', src:'N.png'}`.

- [ ] **Step 3: Commit**

```bash
git add js/mock-data.js
git commit -m "feat: mock fixtures (menus, ingredients, queue, kitchen coord)"
```

---

## Task 5: API facade (`api.js`)

**Files:**
- Create: `js/api.js`
- Create: `tests/test-api.js`

The facade wraps `MOCK` so the UI never touches mock data directly. All later real-backend work replaces this file only.

- [ ] **Step 1: Write failing tests in `tests/test-api.js`**

```js
// tests/test-api.js
QUnit.module('api');

QUnit.test('getMenus returns array grouped by category order', async assert => {
  const menus = await API.getMenus('pedesan');
  assert.ok(Array.isArray(menus));
  assert.ok(menus.length >= 7);
  assert.ok(menus.every(m => m.brand === 'pedesan'));
});

QUnit.test('menu availability computed from recipe', async assert => {
  // with default mock stock all should be > 0
  const menus = await API.getMenus('pedesan');
  const ususPedas = menus.find(m => m.id === 'm1');
  assert.ok(ususPedas.available > 0, `expected >0, got ${ususPedas.available}`);
});

QUnit.test('getQueue returns total + by_brand', async assert => {
  const q = await API.getQueue();
  assert.ok('total' in q);
  assert.ok('by_brand' in q);
  assert.equal(typeof q.total, 'number');
});

QUnit.test('submitFeedback appends to feedback list', async assert => {
  const before = MOCK.feedback.length;
  await API.submitFeedback({ nama: 'Ani', pesan: 'Enak!' });
  assert.equal(MOCK.feedback.length, before + 1);
  assert.equal(MOCK.feedback[MOCK.feedback.length - 1].pesan, 'Enak!');
});
```

- [ ] **Step 2: Run tests — verify fail**

Reload `tests/tests.html`. Expected: api tests fail.

- [ ] **Step 3: Implement `js/api.js`**

```js
// js/api.js — thin facade over MOCK. Swap to fetch() later.
const API = (() => {
  const delay = (ms = 50) => new Promise(r => setTimeout(r, ms));

  function _availability(menu) {
    if (!menu.recipe?.length) return 0;
    const avail = menu.recipe.map(r => {
      const ing = MOCK.ingredients.find(i => i.id === r.ingredient_id);
      if (!ing) return 0;
      return Math.floor(ing.stock / r.qty);
    });
    return Math.min(...avail);
  }

  return {
    async getBrand() { await delay(); return MOCK.brand; },

    async getMenus(brand) {
      await delay();
      return MOCK.menus
        .filter(m => m.brand === brand)
        .map(m => ({ ...m, available: _availability(m) }))
        .sort((a, b) => a.order - b.order);
    },

    async getMenu(id) {
      await delay();
      const m = MOCK.menus.find(x => x.id === id);
      return m ? { ...m, available: _availability(m) } : null;
    },

    async getQueue() { await delay(); return { ...MOCK.queue }; },

    async getKitchenCoord() { await delay(); return { ...MOCK.kitchen_coord }; },

    async toggleLove(menu_id, loved) {
      await delay();
      const m = MOCK.menus.find(x => x.id === menu_id);
      if (!m) return;
      m.love_count += loved ? 1 : -1;
      m.love_count = Math.max(0, m.love_count);
      return m.love_count;
    },

    async submitFeedback({ nama, wa, pesan }) {
      await delay();
      const f = { id: 'f-' + Date.now(), nama: nama||null, wa: wa||null, pesan, created_at: new Date().toISOString(), read: false };
      MOCK.feedback.push(f);
      return f;
    },

    // chat mock: canned replies after 1.5s
    async sendChatMessage(session_id, text) {
      await delay();
      // In frontend phase, admin replies are produced by chat-widget.js timers, not here.
      return { ok: true };
    }
  };
})();
```

- [ ] **Step 4: Run tests — verify pass**

Reload `tests/tests.html`. Expected: api tests pass.

- [ ] **Step 5: Commit**

```bash
git add js/api.js tests/test-api.js
git commit -m "feat: API facade over mock data (menus w/ computed availability, queue, feedback, love)"
```

---

## Task 6: Chat widget (shell + mock replies)

**Files:**
- Create: `css/chat-widget.css`
- Create: `js/chat-widget.js`

- [ ] **Step 1: Create `css/chat-widget.css`**

```css
/* css/chat-widget.css */
.chat-fab {
  position: fixed; right: var(--s-5); bottom: var(--s-5);
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--accent); color: #fff;
  display: grid; place-items: center;
  box-shadow: 0 8px 24px rgba(255,59,31,.35);
  z-index: var(--z-chat); border: 0;
  transition: transform var(--d-fast) var(--ease-out);
}
.chat-fab:hover { transform: scale(1.06); }
.chat-fab__badge {
  position: absolute; top: -4px; right: -4px;
  min-width: 22px; height: 22px; padding: 0 6px;
  background: #fff; color: var(--accent);
  border-radius: var(--r-full); font-size: var(--fs-xs); font-weight: 700;
  display: grid; place-items: center;
}
.chat-fab.pulsing::after {
  content: ''; position: absolute; inset: -6px; border-radius: 50%;
  border: 2px solid var(--accent); animation: chat-pulse 1.2s ease-out infinite;
}
@keyframes chat-pulse { to { transform: scale(1.5); opacity: 0; } }

.chat-panel {
  position: fixed; right: var(--s-5); bottom: calc(var(--s-5) + 72px);
  width: min(360px, calc(100vw - 32px)); height: min(520px, 70vh);
  background: var(--bg-1); color: var(--fg-0);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: var(--r-4); overflow: hidden;
  display: none; flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,.5);
  z-index: var(--z-chat);
}
.chat-panel.open { display: flex; }
.chat-header {
  padding: var(--s-4); background: var(--bg-2); border-bottom: 1px solid rgba(255,255,255,.06);
  display: flex; align-items: center; justify-content: space-between;
}
.chat-header strong { font-family: var(--font-display); font-size: var(--fs-lg); letter-spacing: .04em; }
.chat-header button { background: transparent; border: 0; color: var(--fg-1); font-size: 20px; }

.chat-body { flex: 1; overflow-y: auto; padding: var(--s-4); display: flex; flex-direction: column; gap: var(--s-2); }
.chat-msg { max-width: 80%; padding: var(--s-3) var(--s-4); border-radius: var(--r-3); font-size: var(--fs-sm); line-height: 1.4; }
.chat-msg.me  { align-self: flex-end; background: var(--accent); color: #fff; border-bottom-right-radius: var(--s-1); }
.chat-msg.admin { align-self: flex-start; background: var(--bg-2); color: var(--fg-0); border-bottom-left-radius: var(--s-1); }
.chat-msg__ts { display: block; font-size: 10px; opacity: .6; margin-top: 2px; }

.chat-form { display: flex; gap: var(--s-2); padding: var(--s-3); border-top: 1px solid rgba(255,255,255,.06); }
.chat-form input { flex: 1; padding: var(--s-3); border-radius: var(--r-full); border: 1px solid rgba(255,255,255,.1); background: var(--bg-2); color: var(--fg-0); }
.chat-form button { border-radius: var(--r-full); padding: 0 var(--s-4); background: var(--accent); color: #fff; border: 0; }

.chat-identity { padding: var(--s-4); }
.chat-identity label { display: block; font-size: var(--fs-sm); margin-bottom: var(--s-1); color: var(--fg-1); }
.chat-identity input { width: 100%; margin-bottom: var(--s-3); padding: var(--s-3); border-radius: var(--r-2); border: 1px solid rgba(255,255,255,.1); background: var(--bg-2); color: var(--fg-0); }
.chat-identity button { width: 100%; padding: var(--s-3); border-radius: var(--r-full); background: var(--accent); color: #fff; border: 0; font-weight: 600; }
```

- [ ] **Step 2: Create `js/chat-widget.js`**

```js
// js/chat-widget.js — persistent floating chat widget.
// Exposes window.ChatWidget.mount(). Safe to call once on every customer page.
(function () {
  const CANNED = [
    'Halo! Terima kasih sudah order di Pedesan. Ada yang bisa dibantu?',
    'Oke, kami cek dulu ya.',
    'Pesananmu sudah kami teruskan ke dapur.',
    'Siap, admin akan segera balas lebih lanjut.'
  ];

  let root, fab, panel, body, form, input, badge;
  let messages = []; // in-memory (per-page); session id persists
  let adminReplyTimer = null;

  function render() {
    root = document.createElement('div');
    root.innerHTML = `
      <button class="chat-fab" aria-label="Chat admin">
        💬
        <span class="chat-fab__badge" style="display:none">0</span>
      </button>
      <aside class="chat-panel" role="dialog" aria-label="Chat admin">
        <header class="chat-header">
          <strong>Chat Admin</strong>
          <button class="chat-close" aria-label="Tutup">×</button>
        </header>
        <div class="chat-body"></div>
        <form class="chat-form">
          <input type="text" placeholder="Tulis pesan..." required />
          <button type="submit">Kirim</button>
        </form>
      </aside>
    `;
    document.body.append(...root.children);
    fab = document.querySelector('.chat-fab');
    badge = fab.querySelector('.chat-fab__badge');
    panel = document.querySelector('.chat-panel');
    body = panel.querySelector('.chat-body');
    form = panel.querySelector('.chat-form');
    input = form.querySelector('input');
  }

  function open() { panel.classList.add('open'); fab.classList.remove('pulsing'); hideBadge(); }
  function close() { panel.classList.remove('open'); }
  function toggle() { panel.classList.contains('open') ? close() : open(); }

  function appendMsg(from, text) {
    messages.push({ from, text, ts: Date.now() });
    const el = document.createElement('div');
    el.className = 'chat-msg ' + (from === 'me' ? 'me' : 'admin');
    const d = new Date();
    const hhmm = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    el.innerHTML = `${escapeHtml(text)}<span class="chat-msg__ts">${hhmm}</span>`;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function showBadge(n) { badge.textContent = n; badge.style.display = 'grid'; fab.classList.add('pulsing'); }
  function hideBadge() { badge.style.display = 'none'; }

  function scheduleAdminReply() {
    clearTimeout(adminReplyTimer);
    adminReplyTimer = setTimeout(() => {
      const reply = CANNED[Math.floor(Math.random() * CANNED.length)];
      appendMsg('admin', reply);
      if (!panel.classList.contains('open')) showBadge('1');
    }, 1500 + Math.random() * 1500);
  }

  function welcome() {
    Store.chat.sessionId(); // ensure exists
    appendMsg('admin', 'Halo! Ini chat langsung ke admin Pedesan. Ada pertanyaan?');
  }

  function mount() {
    if (document.querySelector('.chat-fab')) return; // already mounted
    render();
    fab.addEventListener('click', toggle);
    panel.querySelector('.chat-close').addEventListener('click', close);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const t = input.value.trim(); if (!t) return;
      appendMsg('me', t); input.value = ''; scheduleAdminReply();
    });
    welcome();
  }

  window.ChatWidget = { mount };
})();
```

- [ ] **Step 3: Wire into `index.html`**

Add just before closing `</body>` (after `landing.js`):

Find in `index.html`:
```html
  <script src="js/landing.js"></script>
</body>
```

Keep as-is, and ensure `chat-widget.js` is loaded (already in skeleton). Then in `js/landing.js` (to be created in Task 8), we'll call `ChatWidget.mount()` on DOMContentLoaded. For now, add a temporary init at the end of `chat-widget.js` so we can test it:

Append to `js/chat-widget.js`:
```js
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.ChatWidget.mount());
} else {
  window.ChatWidget.mount();
}
```

- [ ] **Step 4: Manual verification**

Reload `http://localhost/masakguys/`. Expected:
- Red circular chat button bottom-right.
- Click → panel opens, admin welcome message visible.
- Type "halo" + submit → your message (red, right-aligned), then ~1.5s later a canned admin reply (grey, left-aligned).
- Close panel, send another message → unread badge appears on fab after admin reply, fab pulses.

- [ ] **Step 5: Commit**

```bash
git add css/chat-widget.css js/chat-widget.js
git commit -m "feat: floating chat widget with mock admin replies"
```

---

## Task 7: Landing — hero + live queue counter

**Files:**
- Create: `css/landing.css`
- Create: `js/landing.js`
- Modify: `index.html`

- [ ] **Step 1: Add hero + queue sections to `index.html`**

Find in `index.html`:
```html
  <main data-scroll-container>
    <!-- sections inserted by later tasks -->
  </main>
```

Replace with:
```html
  <main data-scroll-container>

    <!-- HERO -->
    <section class="hero" data-scroll-section>
      <div class="hero__bg" data-scroll data-scroll-speed="-3"></div>
      <div class="hero__embers" aria-hidden="true"></div>
      <div class="hero__inner container" data-scroll data-scroll-speed="1">
        <p class="hero__eyebrow">MasakGuys · Kediri</p>
        <h1 class="hero__title">PEDESAN</h1>
        <p class="hero__tagline">Pedas yang bikin nagih.</p>
        <a class="btn hero__cta" href="order.html">Pesan Sekarang →</a>
      </div>
      <div class="hero__scrollhint" aria-hidden="true">scroll</div>
    </section>

    <!-- LIVE QUEUE -->
    <section class="queue" data-scroll-section>
      <div class="container queue__inner">
        <p class="queue__label">Antrian dapur sekarang</p>
        <div class="queue__count" data-queue-count aria-live="polite">0</div>
        <p class="queue__tag">pesanan sedang dimasak di dapur kami saat ini.</p>
      </div>
    </section>

  </main>
```

- [ ] **Step 2: Add styles to `css/landing.css`**

```css
/* css/landing.css */
.hero {
  position: relative; min-height: 100vh;
  display: grid; place-items: center;
  overflow: hidden; isolation: isolate;
}
.hero__bg {
  position: absolute; inset: -10% -10% -10% -10%;
  background:
    radial-gradient(1200px 600px at 30% 30%, rgba(255,59,31,.35), transparent 60%),
    radial-gradient(900px 500px at 75% 70%, rgba(255,164,27,.22), transparent 65%),
    linear-gradient(180deg, #120807 0%, #0e0b0a 60%);
  z-index: -2;
}
.hero__embers {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-image: radial-gradient(2px 2px at 20% 30%, #ff6a3d, transparent 60%),
                    radial-gradient(1px 1px at 70% 80%, #ffa41b, transparent 60%),
                    radial-gradient(1.5px 1.5px at 40% 70%, #ff3b1f, transparent 60%),
                    radial-gradient(1px 1px at 85% 15%, #ff8f6d, transparent 60%);
  opacity: .55; mix-blend-mode: screen; animation: embers 6s linear infinite;
}
@keyframes embers { from { background-position: 0 0, 0 0, 0 0, 0 0; } to { background-position: 0 -400px, 0 -600px, 0 -500px, 0 -700px; } }

.hero__inner { text-align: center; max-width: 900px; padding-top: 10vh; }
.hero__eyebrow { color: var(--fg-1); letter-spacing: .3em; text-transform: uppercase; font-size: var(--fs-xs); }
.hero__title {
  font-size: clamp(72px, 16vw, var(--fs-5xl));
  letter-spacing: .04em; color: var(--fg-0);
  text-shadow: 0 2px 60px rgba(255,59,31,.4);
  margin: var(--s-4) 0 var(--s-3);
}
.hero__tagline { font-size: clamp(var(--fs-lg), 2.2vw, var(--fs-2xl)); color: var(--fg-1); margin-bottom: var(--s-7); }
.hero__cta { padding: var(--s-4) var(--s-6); font-size: var(--fs-lg); }
.hero__scrollhint {
  position: absolute; bottom: var(--s-5); left: 50%; transform: translateX(-50%);
  font-size: var(--fs-xs); letter-spacing: .3em; text-transform: uppercase; color: var(--fg-2);
  animation: nudge 2s ease-in-out infinite;
}
@keyframes nudge { 50% { transform: translate(-50%, 6px); } }

.queue { padding: var(--s-9) 0; background: linear-gradient(180deg, var(--bg-0), var(--bg-1)); text-align: center; }
.queue__label { text-transform: uppercase; letter-spacing: .3em; color: var(--fg-2); font-size: var(--fs-xs); margin-bottom: var(--s-4); }
.queue__count { font-family: var(--font-display); font-size: clamp(96px, 18vw, 220px); line-height: 1; color: var(--accent); text-shadow: 0 0 80px rgba(255,59,31,.4); }
.queue__tag { color: var(--fg-1); margin-top: var(--s-3); font-size: var(--fs-lg); }
```

- [ ] **Step 3: Create `js/landing.js` — init Locomotive + queue counter**

```js
// js/landing.js
document.addEventListener('DOMContentLoaded', async () => {
  // Locomotive smooth scroll
  if (window.LocomotiveScroll) {
    new LocomotiveScroll({
      el: document.querySelector('[data-scroll-container]'),
      smooth: true, lerp: 0.08, multiplier: 1
    });
  }

  // Queue counter — animated number with simulated updates
  const el = document.querySelector('[data-queue-count]');
  if (el) {
    const q = await API.getQueue();
    animateCount(el, 0, q.total, 1200);
    // simulate live fluctuation every 6s
    setInterval(async () => {
      // mutate mock directly so later page-loads see it too
      MOCK.queue.total = Math.max(0, MOCK.queue.total + (Math.random() < .5 ? -1 : 1));
      const fresh = await API.getQueue();
      const current = parseInt(el.textContent, 10) || 0;
      animateCount(el, current, fresh.total, 700);
    }, 6000);
  }
});

function animateCount(el, from, to, duration) {
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
    const v = Math.round(from + (to - from) * eased);
    el.textContent = v;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
```

- [ ] **Step 4: Manual verification**

Reload `http://localhost/masakguys/`. Expected:
- Full-viewport hero, "PEDESAN" big display type, fiery glow behind, ember dots floating.
- Smooth scroll enabled (feels inertial).
- Below hero: "Antrian dapur sekarang", the count animates from 0 up to 14 over ~1.2s, then fluctuates ±1 every 6s.
- CTA "Pesan Sekarang →" is visible (clicking it will 404 until Plan 2; that's expected).
- Chat widget still works.

- [ ] **Step 5: Commit**

```bash
git add index.html css/landing.css js/landing.js
git commit -m "feat: landing hero + live queue counter with animated tick"
```

---

## Task 8: Landing — menu highlights

**Files:**
- Modify: `index.html`, `css/landing.css`, `js/landing.js`

- [ ] **Step 1: Add highlights section to `index.html`**

Find in `index.html` (after the `</section>` that closes the queue section):
```html
    </section>

  </main>
```

Insert before `</main>`:
```html
    <!-- MENU HIGHLIGHTS -->
    <section class="highlights" data-scroll-section>
      <div class="container">
        <header class="highlights__head">
          <p class="eyebrow">Menu</p>
          <h2 class="highlights__title">Yang paling dicari.</h2>
        </header>
        <div class="highlights__rail" data-highlights-rail></div>
      </div>
    </section>
```

- [ ] **Step 2: Add styles**

Append to `css/landing.css`:
```css
.eyebrow { text-transform: uppercase; letter-spacing: .3em; color: var(--fg-2); font-size: var(--fs-xs); }
.highlights { padding: var(--s-9) 0; background: var(--bg-1); }
.highlights__head { display: flex; justify-content: space-between; align-items: end; margin-bottom: var(--s-6); gap: var(--s-4); flex-wrap: wrap; }
.highlights__title { font-size: clamp(var(--fs-3xl), 6vw, 96px); color: var(--fg-0); }
.highlights__rail { display: flex; gap: var(--s-5); overflow-x: auto; scroll-snap-type: x mandatory; padding: var(--s-3) 0 var(--s-6); scrollbar-width: thin; }
.highlights__rail::-webkit-scrollbar { height: 8px; }
.highlights__rail::-webkit-scrollbar-thumb { background: var(--accent); border-radius: var(--r-full); }
.highlight-card {
  flex: 0 0 320px; aspect-ratio: 3 / 4; scroll-snap-align: start;
  background: var(--bg-2); border-radius: var(--r-4); overflow: hidden;
  position: relative; isolation: isolate;
  transition: transform var(--d-base) var(--ease-out);
}
.highlight-card:hover { transform: translateY(-6px) rotateZ(-.5deg); }
.highlight-card img { width: 100%; height: 60%; object-fit: cover; }
.highlight-card__body { padding: var(--s-4) var(--s-5); }
.highlight-card__nama { font-family: var(--font-display); font-size: var(--fs-2xl); letter-spacing: .02em; }
.highlight-card__desc { color: var(--fg-1); font-size: var(--fs-sm); margin-top: var(--s-2); min-height: 3em; }
.highlight-card__price { margin-top: var(--s-4); color: var(--accent-2); font-weight: 700; font-size: var(--fs-lg); }
```

- [ ] **Step 3: Render highlights in `js/landing.js`**

In `js/landing.js`, inside the `DOMContentLoaded` handler after the queue code, add:

```js
  // Highlights — signature menu carousel rail
  const rail = document.querySelector('[data-highlights-rail]');
  if (rail) {
    const menus = await API.getMenus('pedesan');
    const top4 = menus.filter(m => m.kategori === 'makanan').slice(0, 4);
    rail.innerHTML = top4.map(m => `
      <article class="highlight-card">
        <img src="${m.media[0].src}" alt="${m.nama}" loading="lazy" />
        <div class="highlight-card__body">
          <div class="highlight-card__nama">${m.nama}</div>
          <p class="highlight-card__desc">${m.deskripsi}</p>
          <div class="highlight-card__price">${formatRupiah(m.harga)}</div>
        </div>
      </article>
    `).join('');
  }
```

- [ ] **Step 4: Manual verification**

Reload page. Scroll past queue. Expected:
- "Menu — Yang paling dicari." heading.
- Horizontal-scroll rail of 4 cards: Usus Pedas, Paru Crispy, Babat Gongso, Empal Suwir.
- Each card has an image (rotated across `1.png`–`7.png`), name, short description, price (e.g. "Rp18.000").
- Hover tilts card slightly up.

- [ ] **Step 5: Commit**

```bash
git add index.html css/landing.css js/landing.js
git commit -m "feat: landing menu highlights rail"
```

---

## Task 9: Landing — "Masak dengan Hati" pinned story

**Files:**
- Modify: `index.html`, `css/landing.css`, `js/landing.js`

- [ ] **Step 1: Add section to `index.html`**

Insert before `</main>`:
```html
    <!-- MASAK DENGAN HATI -->
    <section class="story" data-scroll-section>
      <div class="story__pin" data-story-pin>
        <article class="story__panel is-active" data-panel="0">
          <p class="eyebrow">Sourcing lokal</p>
          <h2>Bahan segar dari pasar Kediri.</h2>
          <p>Tiap pagi kami pilih bahan terbaik dari pasar lokal.</p>
        </article>
        <article class="story__panel" data-panel="1">
          <p class="eyebrow">Dapur bersih</p>
          <h2>Standar higienis, tiap hari.</h2>
          <p>Ceklis kebersihan harian, dari wajan sampai lantai.</p>
        </article>
        <article class="story__panel" data-panel="2">
          <p class="eyebrow">Komunitas</p>
          <h2>Dari dapur satu, untuk seluruh kota.</h2>
          <p>Satu dapur, banyak brand, diantar ke penjuru Kediri.</p>
        </article>
      </div>
    </section>
```

- [ ] **Step 2: Styles**

Append to `css/landing.css`:
```css
.story { background: var(--bg-0); }
.story__pin { position: relative; height: 300vh; }
.story__panel {
  position: sticky; top: 0; height: 100vh; display: grid; place-items: center;
  padding: 0 var(--s-6); text-align: center;
  opacity: 0; transition: opacity var(--d-slow) var(--ease-out);
  pointer-events: none;
}
.story__panel.is-active { opacity: 1; pointer-events: auto; }
.story__panel h2 { font-size: clamp(var(--fs-3xl), 8vw, 140px); max-width: 15ch; margin: var(--s-4) auto var(--s-5); }
.story__panel p { max-width: 40ch; margin: 0 auto; color: var(--fg-1); font-size: var(--fs-lg); }
```

- [ ] **Step 3: Add GSAP ScrollTrigger pinning in `js/landing.js`**

After the highlights render block, append:
```js
  // Masak dengan Hati — panel progression (no GSAP pinning needed; uses sticky + scroll progress)
  const pin = document.querySelector('[data-story-pin]');
  if (pin) {
    const panels = pin.querySelectorAll('.story__panel');
    const onScroll = () => {
      const r = pin.getBoundingClientRect();
      const total = pin.offsetHeight - window.innerHeight;
      const progress = clamp(-r.top / total, 0, 1);
      const active = Math.min(panels.length - 1, Math.floor(progress * panels.length));
      panels.forEach((p, i) => p.classList.toggle('is-active', i === active));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // With Locomotive Scroll, also listen to its scroll events if available:
    onScroll();
  }
```

> Note: Locomotive Scroll transforms the main container, which can interfere with native `scroll` events on the page body. If the panels don't advance, add this instead: after creating Locomotive in the earlier block, save it as `const loco = new LocomotiveScroll(...)` and call `loco.on('scroll', onScroll)`.

Implement the safer variant — replace the earlier Locomotive init with:

```js
  let loco = null;
  if (window.LocomotiveScroll) {
    loco = new LocomotiveScroll({
      el: document.querySelector('[data-scroll-container]'),
      smooth: true, lerp: 0.08, multiplier: 1
    });
  }
```

And change the story scroll listener to:
```js
    if (loco) loco.on('scroll', onScroll);
    else window.addEventListener('scroll', onScroll, { passive: true });
```

- [ ] **Step 4: Manual verification**

Reload. Scroll past highlights. Expected:
- Section becomes fullscreen, sticky.
- Panel 1 visible first, then as you continue scrolling, panel 2 fades in (panel 1 fades out), then panel 3.
- Scroll duration across the three panels ≈ 3 viewport heights.
- After panel 3, next section begins.

- [ ] **Step 5: Commit**

```bash
git add index.html css/landing.css js/landing.js
git commit -m "feat: Masak dengan Hati pinned-scroll 3-panel story"
```

---

## Task 10: Landing — video section + CTA band

**Files:**
- Modify: `index.html`, `css/landing.css`

- [ ] **Step 1: Add to `index.html`**

Insert before `</main>`:
```html
    <!-- VIDEO -->
    <section class="videoband" data-scroll-section>
      <video class="videoband__v" autoplay muted loop playsinline
             poster="1.png">
        <!-- Real video file can be dropped here later; poster is the fallback -->
      </video>
      <div class="videoband__overlay container">
        <p class="eyebrow">Dapur kami</p>
        <h2>Lihat dapurnya.</h2>
        <p class="videoband__lead">Wok menyala, bumbu menari, pesananmu lahir di sini.</p>
      </div>
    </section>

    <!-- CTA BAND -->
    <section class="ctaband" data-scroll-section>
      <div class="container ctaband__inner">
        <h2>Lapar? Pesan sekarang.</h2>
        <a class="btn btn--lg" href="order.html">Buka Menu →</a>
      </div>
    </section>
```

- [ ] **Step 2: Styles**

Append to `css/landing.css`:
```css
.videoband { position: relative; min-height: 90vh; display: grid; place-items: center; overflow: hidden; }
.videoband__v { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1; filter: brightness(.45) saturate(1.1); }
.videoband__overlay { text-align: center; max-width: 900px; padding: var(--s-9) 0; }
.videoband__overlay h2 { font-size: clamp(var(--fs-3xl), 9vw, 160px); }
.videoband__lead { color: var(--fg-1); font-size: var(--fs-lg); margin-top: var(--s-4); }

.ctaband { padding: var(--s-9) 0; background: linear-gradient(180deg, var(--bg-1), var(--bg-0)); }
.ctaband__inner { display: flex; flex-direction: column; gap: var(--s-5); align-items: center; text-align: center; }
.ctaband h2 { font-size: clamp(var(--fs-3xl), 7vw, 120px); }
.btn--lg { padding: var(--s-4) var(--s-7); font-size: var(--fs-lg); }
```

- [ ] **Step 3: Manual verification**

Reload. Scroll past story. Expected:
- Dark video band with poster image (since no real video yet), "Lihat dapurnya." overlay text.
- Below: "Lapar? Pesan sekarang." + big "Buka Menu →" button.

- [ ] **Step 4: Commit**

```bash
git add index.html css/landing.css
git commit -m "feat: landing video band + CTA band"
```

---

## Task 11: Landing — minimal footer with kritik & saran + chat trigger

**Files:**
- Modify: `index.html`, `css/landing.css`, `js/landing.js`

- [ ] **Step 1: Add to `index.html`**

Insert before `</main>`:
```html
    <!-- FOOTER: kritik & saran + chat trigger only -->
    <footer class="footer" data-scroll-section>
      <div class="container footer__grid">
        <section class="footer__feedback">
          <h3>Kritik & Saran</h3>
          <form data-feedback-form class="feedback-form">
            <label>Nama <span class="opt">(opsional)</span>
              <input type="text" name="nama" />
            </label>
            <label>WhatsApp <span class="opt">(opsional)</span>
              <input type="tel" name="wa" />
            </label>
            <label>Pesan <span class="req">*</span>
              <textarea name="pesan" required rows="4"></textarea>
            </label>
            <button class="btn" type="submit">Kirim</button>
            <p class="feedback-form__ok" hidden>Terima kasih! Masukanmu sudah masuk ke admin.</p>
          </form>
        </section>
        <section class="footer__chat">
          <h3>Butuh bantuan langsung?</h3>
          <p>Tim admin kami siap menjawab kapan saja.</p>
          <button class="btn btn--ghost" data-open-chat>Chat Admin</button>
        </section>
      </div>
      <p class="footer__fine">© MasakGuys · Pedesan · Kediri</p>
    </footer>
```

- [ ] **Step 2: Styles**

Append to `css/landing.css`:
```css
.footer { padding: var(--s-9) 0 var(--s-6); background: var(--bg-1); border-top: 1px solid rgba(255,255,255,.06); }
.footer__grid { display: grid; gap: var(--s-7); grid-template-columns: 1.4fr 1fr; }
@media (max-width: 720px) { .footer__grid { grid-template-columns: 1fr; } }
.footer h3 { font-family: var(--font-display); font-size: var(--fs-2xl); letter-spacing: .02em; margin-bottom: var(--s-4); }
.feedback-form { display: flex; flex-direction: column; gap: var(--s-3); max-width: 520px; }
.feedback-form label { display: flex; flex-direction: column; gap: var(--s-1); color: var(--fg-1); font-size: var(--fs-sm); }
.feedback-form .opt { color: var(--fg-2); font-size: var(--fs-xs); }
.feedback-form .req { color: var(--accent); }
.feedback-form input, .feedback-form textarea {
  padding: var(--s-3); border-radius: var(--r-2);
  background: var(--bg-2); color: var(--fg-0);
  border: 1px solid rgba(255,255,255,.08); font: inherit;
}
.feedback-form__ok { color: var(--success); }
.footer__chat p { color: var(--fg-1); }
.footer__fine { text-align: center; color: var(--fg-2); font-size: var(--fs-xs); margin-top: var(--s-7); }
```

- [ ] **Step 3: Wire form + chat trigger in `js/landing.js`**

Append inside the `DOMContentLoaded` handler:
```js
  // Kritik & saran
  const form = document.querySelector('[data-feedback-form]');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      await API.submitFeedback({
        nama: fd.get('nama') || null,
        wa: fd.get('wa') || null,
        pesan: fd.get('pesan')
      });
      form.reset();
      form.querySelector('.feedback-form__ok').hidden = false;
      setTimeout(() => { form.querySelector('.feedback-form__ok').hidden = true; }, 4000);
    });
  }

  // Footer "Chat Admin" button opens the floating widget
  const openBtn = document.querySelector('[data-open-chat]');
  if (openBtn) openBtn.addEventListener('click', () => document.querySelector('.chat-fab')?.click());
```

- [ ] **Step 4: Manual verification**

Reload. Scroll to bottom. Expected:
- Two-column footer (stacks on mobile).
- Form submit without pesan → browser shows "please fill out this field" on textarea.
- With pesan → success message appears, form clears.
- Check `MOCK.feedback` in console → last entry is what you typed.
- "Chat Admin" button in footer → opens the floating chat panel.
- No other footer content (no blog, no "what's new", no nav).

- [ ] **Step 5: Commit**

```bash
git add index.html css/landing.css js/landing.js
git commit -m "feat: landing minimal footer (kritik-saran + chat trigger)"
```

---

## Task 12: Polish pass + final verification

**Files:**
- Modify: as needed

- [ ] **Step 1: Cross-browser/device sanity check**

Open `http://localhost/masakguys/` on:
- Desktop Chrome/Edge: verify smooth scroll, all sections render, animations look right.
- Responsive mode (375px width, Chrome DevTools iPhone): hero fits, queue counter wraps nicely, highlights rail is horizontally scrollable, story panels readable, footer stacks, chat widget doesn't overlap other content awkwardly.

If any section overflows horizontally on mobile, inspect and adjust padding/font-size in `css/landing.css`. No broad rewrites — only fix what's actually broken.

- [ ] **Step 2: Console error sweep**

DevTools Console on page load → expected: zero errors, zero red warnings. (Locomotive may emit benign `passive event listener` warnings — fine.)

Tests page `http://localhost/masakguys/tests/tests.html` → all green.

- [ ] **Step 3: Accessibility quick pass**

- Hero CTA focusable with Tab, visible focus ring (add `.btn:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 3px; }` to `css/base.css` if missing).
- Chat widget opens/closes via Tab + Enter/Space.
- Form labels are real `<label>`s wrapping inputs (they are).

Add focus-visible style if missing:

Append to `css/base.css`:
```css
:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 3px; border-radius: 3px; }
```

- [ ] **Step 4: Update README**

Find in `README.md`:
```markdown
### Customer Order System
- WhatsApp catalog → order intake
```

Leave the original section alone — it's the overall MasakGuys vision. Instead, append a new section at the end:

Append to `README.md`:
```markdown

---

## Pedesan brand site (this repo)

First concrete implementation: the Pedesan brand customer-order site. Static frontend, XAMPP-served.

**Run locally:**
1. Install XAMPP.
2. Place this repo at `C:/xampp/htdocs/masakguys/`.
3. Start Apache, open `http://localhost/masakguys/`.

**Pages (current):**
- `/` — landing (hero, queue, highlights, story, video, CTA, kritik-saran)

**Docs:**
- Spec: `docs/superpowers/specs/2026-04-17-pedesan-site-design.md`
- Plan 1: `docs/superpowers/plans/2026-04-17-plan-1-foundation-and-landing.md`

**Tests:** `http://localhost/masakguys/tests/tests.html`
```

- [ ] **Step 5: Final commit + push**

```bash
git add README.md css/base.css
git commit -m "chore: accessibility focus ring + README update for Plan 1"
git push
```

---

## Plan 1 — Definition of Done

- Landing page loads at `http://localhost/masakguys/` with zero console errors.
- All 5 sections render: hero, queue (animating), highlights (rail with 4 cards using `1.png`–`7.png`), story (3 pinned panels), video band, CTA band.
- Minimal footer with kritik-saran form (submits to mock) + Chat Admin button.
- Floating chat widget persists across the page, opens/closes, mock admin replies after 1.5s.
- All `tests/tests.html` QUnit tests green.
- Responsive down to 375px width — nothing horizontally overflows.
- Spec section §4 (landing) is fully covered.

**Not in this plan (deferred to Plan 2+):**
- `order.html`, `checkout.html`, `status.html` (Plan 2)
- Staff dashboards (Plan 3)
- Manager dashboard incl. Menu Editor (Plan 4)
- Real backend / real chat / real QRIS (post-frontend)
