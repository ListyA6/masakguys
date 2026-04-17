# Plan 2 — Customer Order Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the customer order flow — Instagram-feed menu page, checkout (geolocation-based delivery tiers + payment methods), and the 5-phase order status tracker.

**Architecture:** Static HTML/CSS/JS pages that consume `API` + `Store` from Plan 1. Order persistence uses localStorage (mock backend). Swiper.js drives per-post carousels. Status page auto-polls mock data every 3s to simulate live updates.

**Tech Stack:** Same as Plan 1. Swiper.js for per-post carousels. Browser Geolocation API for distance calc. Chart.js is already vendored but not used in this plan.

**Reference spec:** `docs/superpowers/specs/2026-04-17-pedesan-site-design.md` §5 (order), §6 (checkout), §7 (status).

**Depends on Plan 1:** `index.html`, `css/tokens.css`, `css/base.css`, `css/chat-widget.css`, `js/utils.js`, `js/api.js`, `js/mock-data.js`, `js/store.js`, `js/chat-widget.js`, `vendor/swiper-bundle.*`, `tests/tests.html`.

---

## File Structure

```
/
  order.html                    (new)
  checkout.html                 (new)
  status.html                   (new)
  /css
    order.css                   (new)
    checkout.css                (new)
    status.css                  (new)
  /js
    order.js                    (new)
    checkout.js                 (new)
    status.js                   (new)
    api.js                      (extend: submitOrder, getOrder, advanceStatus)
    mock-data.js                (extend: add status-advance helper + orders list already present)
  /tests
    test-api-orders.js          (new)
    tests.html                  (modify: add script tag)
```

---

## Task 1: Extend API facade — orders

**Files:**
- Modify: `js/api.js`
- Modify: `js/mock-data.js`
- Create: `tests/test-api-orders.js`
- Modify: `tests/tests.html`

- [ ] **Step 1: Add failing tests in `tests/test-api-orders.js`**

```js
// tests/test-api-orders.js
QUnit.module('api.orders', {
  beforeEach: () => { MOCK.orders = []; MOCK.customers = []; }
});

QUnit.test('submitOrder creates an order with id and status Diterima', async assert => {
  const order = await API.submitOrder({
    customer: { nama: 'Budi', wa: '08123' },
    items: [{ menu_id: 'm1', qty: 2, catatan: 'pedas' }],
    location: { lat: -7.82, lng: 112.02, distance_km: 2.1 },
    payment: { method: 'tunai', cash_given: 50000 }
  });
  assert.ok(order.id.startsWith('ord-'));
  assert.equal(order.status, 'Diterima');
  assert.equal(order.ongkir, 3000);
  assert.equal(MOCK.orders.length, 1);
});

QUnit.test('submitOrder upserts customer by WA', async assert => {
  await API.submitOrder({
    customer: { nama: 'Budi', wa: '08123' }, items: [{menu_id:'m1',qty:1,catatan:''}],
    location: { lat:0, lng:0, distance_km: 1 }, payment: { method:'tunai', cash_given: 20000 }
  });
  await API.submitOrder({
    customer: { nama: 'Budi', wa: '08123' }, items: [{menu_id:'m2',qty:1,catatan:''}],
    location: { lat:0, lng:0, distance_km: 1 }, payment: { method:'tunai', cash_given: 30000 }
  });
  assert.equal(MOCK.customers.length, 1);
  assert.equal(MOCK.customers[0].order_count, 2);
});

QUnit.test('submitOrder computes subtotal from menu prices', async assert => {
  const o = await API.submitOrder({
    customer: { nama:'x', wa:'1' },
    items: [{ menu_id: 'm1', qty: 2, catatan: '' }, { menu_id: 'm5', qty: 1, catatan: '' }],
    location: { lat:0,lng:0,distance_km:4 }, payment: { method:'qris' }
  });
  // m1 Usus Pedas = 18000, m5 Es Teh Manis = 5000 → subtotal 41000 + ongkir 8000 = 49000
  assert.equal(o.subtotal, 41000);
  assert.equal(o.ongkir, 8000);
  assert.equal(o.total, 49000);
});

QUnit.test('getOrder returns order by id', async assert => {
  const created = await API.submitOrder({
    customer:{nama:'a',wa:'1'}, items:[{menu_id:'m1',qty:1,catatan:''}],
    location:{lat:0,lng:0,distance_km:1}, payment:{method:'tunai',cash_given:20000}
  });
  const fetched = await API.getOrder(created.id);
  assert.equal(fetched.id, created.id);
});

QUnit.test('advanceStatus walks through the 5 phases', async assert => {
  const o = await API.submitOrder({
    customer:{nama:'a',wa:'1'}, items:[{menu_id:'m1',qty:1,catatan:''}],
    location:{lat:0,lng:0,distance_km:1}, payment:{method:'tunai',cash_given:20000}
  });
  const phases = ['Dikonfirmasi','Dimasak','Siap','Diantar','Selesai'];
  for (const expected of phases) {
    await API.advanceStatus(o.id);
    const cur = await API.getOrder(o.id);
    assert.equal(cur.status, expected);
  }
});

QUnit.test('submitOrder deducts ingredient stock per recipe', async assert => {
  const beforeUsus = MOCK.ingredients.find(i => i.id === 'usus').stock;
  const beforeNasi = MOCK.ingredients.find(i => i.id === 'nasi').stock;
  await API.submitOrder({
    customer:{nama:'a',wa:'1'}, items:[{menu_id:'m1',qty:2,catatan:''}], // Usus Pedas x2
    location:{lat:0,lng:0,distance_km:1}, payment:{method:'tunai',cash_given:50000}
  });
  const afterUsus = MOCK.ingredients.find(i => i.id === 'usus').stock;
  const afterNasi = MOCK.ingredients.find(i => i.id === 'nasi').stock;
  assert.equal(beforeUsus - afterUsus, 2);
  assert.equal(beforeNasi - afterNasi, 2);
});
```

- [ ] **Step 2: Add `<script src="test-api-orders.js"></script>` to `tests/tests.html`**

Find in `tests/tests.html`:
```html
  <script src="test-api.js"></script>
</body>
```

Replace with:
```html
  <script src="test-api.js"></script>
  <script src="test-api-orders.js"></script>
</body>
```

- [ ] **Step 3: Verify failure**

Open `http://localhost/masakguys/tests/tests.html`. Expected: new `api.orders` module tests all fail (`API.submitOrder is not a function`, etc.).

- [ ] **Step 4: Extend `js/api.js` — append new methods inside the returned object**

Find in `js/api.js`:
```js
    // chat mock: canned replies after 1.5s
    async sendChatMessage(session_id, text) {
      await delay();
      // In frontend phase, admin replies are produced by chat-widget.js timers, not here.
      return { ok: true };
    }
  };
})();
```

Replace with:
```js
    // chat mock: canned replies after 1.5s
    async sendChatMessage(session_id, text) {
      await delay();
      return { ok: true };
    },

    async submitOrder({ customer, items, location, payment }) {
      await delay();

      // upsert customer
      let cust = MOCK.customers.find(c => c.wa === customer.wa);
      if (!cust) {
        cust = { wa: customer.wa, nama: customer.nama, order_count: 0, total_spend: 0, last_order_at: null };
        MOCK.customers.push(cust);
      } else if (customer.nama) {
        cust.nama = customer.nama;
      }

      // compute subtotal from live menu prices
      const subtotal = items.reduce((s, it) => {
        const m = MOCK.menus.find(x => x.id === it.menu_id);
        return s + (m ? m.harga : 0) * it.qty;
      }, 0);
      const ongkir = deliveryFee(location.distance_km);
      const total = subtotal + ongkir;

      // deduct ingredient stock per recipe
      for (const it of items) {
        const m = MOCK.menus.find(x => x.id === it.menu_id);
        if (!m) continue;
        for (const r of m.recipe) {
          const ing = MOCK.ingredients.find(i => i.id === r.ingredient_id);
          if (ing) ing.stock = Math.max(0, ing.stock - r.qty * it.qty);
        }
      }

      const order = {
        id: 'ord-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        brand: 'pedesan',
        customer: { ...customer },
        items: items.map(i => ({ ...i })),
        location: { ...location },
        subtotal, ongkir, total,
        payment: { ...payment, paid: false },
        status: 'Diterima',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        staff_log: []
      };
      MOCK.orders.push(order);

      cust.order_count += 1;
      cust.total_spend += total;
      cust.last_order_at = order.created_at;

      // bump cross-brand queue counter
      MOCK.queue.total += 1;
      MOCK.queue.by_brand.pedesan = (MOCK.queue.by_brand.pedesan || 0) + 1;

      return { ...order };
    },

    async getOrder(id) {
      await delay();
      const o = MOCK.orders.find(x => x.id === id);
      return o ? { ...o } : null;
    },

    async advanceStatus(id) {
      await delay();
      const o = MOCK.orders.find(x => x.id === id);
      if (!o) return null;
      const seq = ['Diterima','Dikonfirmasi','Dimasak','Siap','Diantar','Selesai'];
      const idx = seq.indexOf(o.status);
      if (idx >= 0 && idx < seq.length - 1) {
        o.status = seq[idx + 1];
        o.updated_at = new Date().toISOString();
        if (o.status === 'Selesai') {
          MOCK.queue.total = Math.max(0, MOCK.queue.total - 1);
          MOCK.queue.by_brand.pedesan = Math.max(0, (MOCK.queue.by_brand.pedesan || 1) - 1);
        }
      }
      return { ...o };
    },

    async markPaid(id) {
      await delay();
      const o = MOCK.orders.find(x => x.id === id);
      if (o) { o.payment.paid = true; o.updated_at = new Date().toISOString(); }
      return o ? { ...o } : null;
    }
  };
})();
```

- [ ] **Step 5: Verify tests pass**

Reload `tests/tests.html`. Expected: `api.orders` module all green.

- [ ] **Step 6: Commit**

```bash
git add js/api.js tests/test-api-orders.js tests/tests.html
git commit -m "feat(api): submitOrder, getOrder, advanceStatus, markPaid (mock)"
```

---

## Task 2: `order.html` — skeleton + sticky header & category tabs

**Files:**
- Create: `order.html`
- Create: `css/order.css`
- Create: `js/order.js`

- [ ] **Step 1: Create `order.html`**

```html
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Menu — Pedesan</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="vendor/swiper-bundle.min.css" />
  <link rel="stylesheet" href="css/tokens.css" />
  <link rel="stylesheet" href="css/base.css" />
  <link rel="stylesheet" href="css/chat-widget.css" />
  <link rel="stylesheet" href="css/order.css" />
</head>
<body>
  <header class="order-header">
    <a href="index.html" class="order-header__back" aria-label="Kembali">←</a>
    <div class="order-header__brand">PEDESAN</div>
    <button class="order-header__cart" data-cart-btn aria-label="Keranjang">
      🛒 <span class="order-header__badge" data-cart-badge hidden>0</span>
    </button>
  </header>

  <nav class="cats" data-cats>
    <button class="cats__tab is-active" data-cat="makanan">Makanan</button>
    <button class="cats__tab" data-cat="minuman">Minuman</button>
    <button class="cats__tab" data-cat="tambahan">Tambahan</button>
  </nav>

  <main class="feed" data-feed>
    <!-- posts rendered by order.js -->
  </main>

  <aside class="cart-sheet" data-cart-sheet hidden>
    <div class="cart-sheet__backdrop" data-cart-close></div>
    <div class="cart-sheet__panel">
      <header class="cart-sheet__head">
        <h3>Keranjang</h3>
        <button data-cart-close aria-label="Tutup">×</button>
      </header>
      <div class="cart-sheet__body" data-cart-body></div>
      <footer class="cart-sheet__foot">
        <div class="cart-sheet__sub">Subtotal: <strong data-cart-subtotal>Rp0</strong></div>
        <a class="btn cart-sheet__cta" href="checkout.html">Lanjut ke Checkout →</a>
      </footer>
    </div>
  </aside>

  <script src="vendor/swiper-bundle.min.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/mock-data.js"></script>
  <script src="js/api.js"></script>
  <script src="js/store.js"></script>
  <script src="js/chat-widget.js"></script>
  <script src="js/order.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `css/order.css` with header + categories styles**

```css
/* css/order.css */
.order-header {
  position: sticky; top: 0; z-index: var(--z-nav);
  display: grid; grid-template-columns: 48px 1fr 48px; align-items: center;
  padding: var(--s-3) var(--s-4);
  background: rgba(14,11,10,.9); backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.order-header__back { font-size: 24px; color: var(--fg-0); text-align: center; }
.order-header__brand { font-family: var(--font-display); letter-spacing: .08em; text-align: center; font-size: var(--fs-xl); }
.order-header__cart { position: relative; background: transparent; border: 0; font-size: 22px; color: var(--fg-0); padding: var(--s-2); }
.order-header__badge {
  position: absolute; top: -2px; right: -2px; min-width: 20px; height: 20px; padding: 0 6px;
  background: var(--accent); color: #fff; border-radius: var(--r-full); font-size: 11px; font-weight: 700;
  display: grid; place-items: center;
}

.cats {
  position: sticky; top: 56px; z-index: calc(var(--z-nav) - 1);
  display: flex; gap: var(--s-2); padding: var(--s-3) var(--s-4);
  background: rgba(14,11,10,.9); backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,.06);
  overflow-x: auto; scrollbar-width: none;
}
.cats::-webkit-scrollbar { display: none; }
.cats__tab {
  flex: 0 0 auto;
  padding: var(--s-2) var(--s-4); border-radius: var(--r-full);
  background: transparent; color: var(--fg-1); border: 1px solid rgba(255,255,255,.1);
  white-space: nowrap; font-weight: 600;
}
.cats__tab.is-active { background: var(--accent); color: #fff; border-color: var(--accent); }

.feed { max-width: 560px; margin: 0 auto; padding: var(--s-4) 0 120px; }
```

- [ ] **Step 3: Create initial `js/order.js`**

```js
// js/order.js
let MENUS = [];
let activeCat = 'makanan';

document.addEventListener('DOMContentLoaded', async () => {
  MENUS = await API.getMenus('pedesan');
  renderFeed();

  // category tabs
  document.querySelectorAll('.cats__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cats__tab').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      activeCat = tab.dataset.cat;
      renderFeed();
    });
  });

  // cart button
  document.querySelector('[data-cart-btn]').addEventListener('click', openCart);
  document.querySelectorAll('[data-cart-close]').forEach(el => el.addEventListener('click', closeCart));

  updateCartBadge();
  ChatWidget.mount();
});

function renderFeed() {
  const feed = document.querySelector('[data-feed]');
  const items = MENUS.filter(m => m.kategori === activeCat);
  feed.innerHTML = items.map(postHTML).join('') || `<p style="text-align:center;color:var(--fg-2);padding:var(--s-7)">Belum ada menu di kategori ini.</p>`;
  items.forEach(m => initPost(m));
}

function postHTML(m) {
  return `<article class="post" data-post="${m.id}"></article>`;
}

function initPost(m) {
  // will be implemented in Task 3
}

function openCart() { document.querySelector('[data-cart-sheet]').hidden = false; }
function closeCart() { document.querySelector('[data-cart-sheet]').hidden = true; }

function updateCartBadge() {
  const badge = document.querySelector('[data-cart-badge]');
  const c = Store.cart.count();
  if (c > 0) { badge.textContent = c; badge.hidden = false; }
  else { badge.hidden = true; }
}
```

- [ ] **Step 4: Manual verification**

Open `http://localhost/masakguys/order.html`. Expected:
- Sticky header with ← · PEDESAN · 🛒.
- Sticky category pills below: Makanan (active/red), Minuman, Tambahan.
- Main area shows "Belum ada menu di kategori ini." (post rendering empty — Task 3 fills it in).
- Clicking 🛒 opens empty cart bottom-sheet; × closes.
- Chat widget appears bottom-right.
- No console errors.

- [ ] **Step 5: Commit**

```bash
git add order.html css/order.css js/order.js
git commit -m "feat(order): skeleton with sticky header and category tabs"
```

---

## Task 3: Order feed — IG-style posts (media carousel, stock pill, love)

**Files:**
- Modify: `css/order.css`, `js/order.js`

- [ ] **Step 1: Append styles to `css/order.css`**

```css
.post {
  background: var(--bg-1); border: 1px solid rgba(255,255,255,.06);
  border-radius: var(--r-3); overflow: hidden; margin-bottom: var(--s-5);
}
.post.is-soldout { filter: saturate(.3) brightness(.6); position: relative; }
.post.is-soldout::after {
  content: 'SOLD OUT'; position: absolute; top: 40%; left: -10%; right: -10%;
  background: var(--danger); color: #fff; font-family: var(--font-display);
  font-size: var(--fs-2xl); letter-spacing: .15em; text-align: center;
  padding: var(--s-3) 0; transform: rotate(-6deg);
  box-shadow: 0 12px 40px rgba(0,0,0,.5); pointer-events: none;
}
.post.is-soldout * { pointer-events: none !important; }

.post__head {
  display: flex; justify-content: space-between; align-items: center;
  padding: var(--s-3) var(--s-4);
}
.post__nama { font-weight: 700; }
.post__stock {
  font-size: var(--fs-xs); color: var(--fg-1);
  background: rgba(255,255,255,.05); border-radius: var(--r-full);
  padding: 2px var(--s-3);
}
.post__stock.is-low { color: var(--accent); background: rgba(255,59,31,.1); }

.post__media { position: relative; aspect-ratio: 1/1; background: #000; }
.post__media .swiper, .post__media .swiper-slide, .post__media img, .post__media video {
  width: 100%; height: 100%; object-fit: cover;
}
.post__heart-burst {
  position: absolute; inset: 0; display: grid; place-items: center;
  pointer-events: none; opacity: 0;
}
.post__heart-burst.fire { animation: heart-burst 700ms var(--ease-spring) forwards; }
.post__heart-burst svg { width: 120px; height: 120px; color: var(--accent); filter: drop-shadow(0 0 24px rgba(255,59,31,.6)); }
@keyframes heart-burst {
  0% { opacity: 0; transform: scale(.3); }
  30% { opacity: 1; transform: scale(1.3); }
  70% { opacity: 1; transform: scale(1.0); }
  100% { opacity: 0; transform: scale(1.0); }
}

.post__actions {
  display: flex; align-items: center; gap: var(--s-4);
  padding: var(--s-3) var(--s-4);
}
.post__heart { background: transparent; border: 0; font-size: 24px; color: var(--fg-0); padding: 0; }
.post__heart.is-loved { color: var(--accent); }
.post__love-count { font-size: var(--fs-sm); color: var(--fg-1); }
.post__price { margin-left: auto; font-weight: 700; color: var(--accent-2); }
.post__desc { padding: 0 var(--s-4) var(--s-3); color: var(--fg-1); font-size: var(--fs-sm); }

.post__add {
  margin: 0 var(--s-4) var(--s-3); width: calc(100% - var(--s-4)*2);
  padding: var(--s-3); border-radius: var(--r-full); border: 0;
  background: var(--accent); color: #fff; font-weight: 700;
  transition: transform var(--d-fast) var(--ease-out);
}
.post__add:active { transform: scale(.97); }

.post__stepper {
  display: none; margin: 0 var(--s-4) var(--s-3);
  align-items: center; justify-content: space-between;
  background: var(--bg-2); border-radius: var(--r-full); padding: var(--s-2);
}
.post__stepper.is-on { display: flex; }
.post__stepper button {
  width: 40px; height: 40px; border-radius: 50%; border: 0;
  background: var(--accent); color: #fff; font-size: 20px; font-weight: 700;
}
.post__stepper button:disabled { opacity: .4; }
.post__qty { font-weight: 700; font-size: var(--fs-lg); padding: 0 var(--s-5); }

.post__catatan {
  display: none; margin: 0 var(--s-4) var(--s-4); width: calc(100% - var(--s-4)*2);
  padding: var(--s-3); border-radius: var(--r-2);
  background: var(--bg-2); color: var(--fg-0); border: 1px solid rgba(255,255,255,.08);
  font: inherit; resize: vertical; min-height: 60px;
}
.post__catatan.is-on { display: block; }
```

- [ ] **Step 2: Replace `initPost` body in `js/order.js`**

Find in `js/order.js`:
```js
function initPost(m) {
  // will be implemented in Task 3
}
```

Replace with:
```js
function initPost(m) {
  const el = document.querySelector(`[data-post="${m.id}"]`);
  if (!el) return;
  const loved = Store.love.has(m.id);
  const existing = Store.cart.get().find(i => i.menu_id === m.id);
  const qty = existing ? existing.qty : 0;
  const catatan = existing ? existing.catatan : '';
  const soldOut = m.available <= 0;

  el.classList.toggle('is-soldout', soldOut);
  el.innerHTML = `
    <div class="post__head">
      <span class="post__nama">${m.nama}</span>
      <span class="post__stock ${m.available <= 5 ? 'is-low' : ''}">stok: ${m.available}</span>
    </div>
    <div class="post__media" data-media>
      <div class="swiper" data-swiper>
        <div class="swiper-wrapper">
          ${m.media.map(x => `<div class="swiper-slide"><img src="${x.src}" alt="${m.nama}" loading="lazy" /></div>`).join('')}
        </div>
        <div class="swiper-pagination"></div>
      </div>
      <div class="post__heart-burst" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.5-9.5-9C.8 8.6 2.8 5 6.2 5c2 0 3.4 1.1 4.2 2.3C11.2 6.1 12.6 5 14.6 5c3.4 0 5.4 3.6 3.7 7-2.5 4.5-9.5 9-9.5 9z"/></svg>
      </div>
    </div>
    <div class="post__actions">
      <button class="post__heart ${loved ? 'is-loved' : ''}" data-heart aria-label="Suka">${loved ? '❤' : '🤍'}</button>
      <span class="post__love-count" data-love-count>${m.love_count}</span>
      <span class="post__price">${formatRupiah(m.harga)}</span>
    </div>
    <p class="post__desc">${m.deskripsi}</p>
    <button class="post__add" data-add style="${qty>0 ? 'display:none' : ''}">Tambahkan ke Keranjang</button>
    <div class="post__stepper ${qty>0 ? 'is-on' : ''}" data-stepper>
      <button data-dec aria-label="Kurangi">−</button>
      <span class="post__qty" data-qty>${qty}</span>
      <button data-inc aria-label="Tambah" ${qty >= m.available ? 'disabled' : ''}>+</button>
    </div>
    <textarea class="post__catatan ${qty>0 ? 'is-on' : ''}" data-catatan placeholder="Catatan untuk menu ini...">${catatan}</textarea>
  `;

  // Swiper
  // eslint-disable-next-line no-new
  new Swiper(el.querySelector('[data-swiper]'), {
    loop: m.media.length > 1,
    pagination: { el: el.querySelector('.swiper-pagination'), clickable: true }
  });

  // Double-tap heart burst on media
  const media = el.querySelector('[data-media]');
  let lastTap = 0;
  media.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastTap < 320) {
      burstHeart(el);
      setLove(m, true);
    }
    lastTap = now;
  });

  // Heart button
  el.querySelector('[data-heart]').addEventListener('click', () => {
    const nowLoved = !Store.love.has(m.id);
    setLove(m, nowLoved);
  });

  // Add to cart
  el.querySelector('[data-add]').addEventListener('click', () => {
    Store.cart.add(m.id);
    renderFeed(); updateCartBadge();
  });

  // Stepper
  el.querySelector('[data-dec]').addEventListener('click', () => {
    const cur = Store.cart.get().find(i => i.menu_id === m.id);
    if (!cur) return;
    Store.cart.setQty(m.id, cur.qty - 1);
    renderFeed(); updateCartBadge();
  });
  el.querySelector('[data-inc]').addEventListener('click', () => {
    const cur = Store.cart.get().find(i => i.menu_id === m.id);
    const next = (cur?.qty || 0) + 1;
    if (next > m.available) return;
    Store.cart.setQty(m.id, next);
    renderFeed(); updateCartBadge();
  });

  // Catatan
  el.querySelector('[data-catatan]').addEventListener('input', (e) => {
    Store.cart.setCatatan(m.id, e.target.value);
  });
}

function burstHeart(el) {
  const b = el.querySelector('.post__heart-burst');
  b.classList.remove('fire');
  void b.offsetWidth; // restart animation
  b.classList.add('fire');
}

async function setLove(m, loved) {
  const hadIt = Store.love.has(m.id);
  if (hadIt === loved) return;
  Store.love.toggle(m.id);
  const count = await API.toggleLove(m.id, loved);
  m.love_count = count;
  const el = document.querySelector(`[data-post="${m.id}"]`);
  if (!el) return;
  el.querySelector('[data-heart]').classList.toggle('is-loved', loved);
  el.querySelector('[data-heart]').textContent = loved ? '❤' : '🤍';
  el.querySelector('[data-love-count]').textContent = count;
}
```

- [ ] **Step 2a: Verify `formatRupiah` is in scope**

`js/utils.js` is loaded before `js/order.js` in `order.html` (see Task 2 Step 1) — confirm no change needed.

- [ ] **Step 3: Manual verification**

Reload `order.html`. Expected:
- Makanan tab shows 4 posts: Usus Pedas, Paru Crispy, Babat Gongso, Empal Suwir.
- Each post: name + "stok: N" on top, square image carousel with dot pagination, heart button + love count + price, description, "Tambahkan ke Keranjang" button.
- Swiping/tapping dots on carousel changes image.
- Double-tap image → big red heart pops + fades, item is loved (heart button fills red, love count +1).
- Tap heart button → toggles loved state.
- Tap "Tambahkan ke Keranjang" → button disappears, stepper appears with 1, catatan textarea appears.
- Tap + → 2 (disabled when reaches stock). Tap − → decrements; at 0, stepper/catatan disappear, add button returns.
- Cart badge updates with total qty.
- Switch to Minuman tab → Es Teh Manis, Es Teh Tawar. Tambahan → Krupuk.
- Reload page: loved state and cart persist (localStorage).

- [ ] **Step 4: Commit**

```bash
git add css/order.css js/order.js
git commit -m "feat(order): IG-style post (carousel, double-tap love, add-to-cart stepper, catatan)"
```

---

## Task 4: Cart bottom-sheet

**Files:**
- Modify: `css/order.css`, `js/order.js`

- [ ] **Step 1: Append cart styles**

```css
.cart-sheet[hidden] { display: none; }
.cart-sheet { position: fixed; inset: 0; z-index: var(--z-cart); }
.cart-sheet__backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.6); }
.cart-sheet__panel {
  position: absolute; left: 0; right: 0; bottom: 0;
  max-height: 85vh; background: var(--bg-1);
  border-top-left-radius: var(--r-4); border-top-right-radius: var(--r-4);
  display: flex; flex-direction: column; overflow: hidden;
  animation: sheet-in var(--d-base) var(--ease-out);
}
@keyframes sheet-in { from { transform: translateY(100%); } to { transform: translateY(0); } }
.cart-sheet__head {
  display: flex; justify-content: space-between; align-items: center;
  padding: var(--s-4); border-bottom: 1px solid rgba(255,255,255,.06);
}
.cart-sheet__head h3 { font-family: var(--font-display); font-size: var(--fs-xl); letter-spacing: .04em; }
.cart-sheet__head button { background: transparent; border: 0; color: var(--fg-0); font-size: 22px; }
.cart-sheet__body { overflow-y: auto; padding: var(--s-4); flex: 1; min-height: 120px; }
.cart-row {
  display: grid; grid-template-columns: 1fr auto; gap: var(--s-2);
  padding: var(--s-3) 0; border-bottom: 1px solid rgba(255,255,255,.05);
}
.cart-row__nama { font-weight: 600; }
.cart-row__meta { color: var(--fg-2); font-size: var(--fs-xs); margin-top: 2px; }
.cart-row__catatan { color: var(--fg-1); font-size: var(--fs-sm); font-style: italic; margin-top: 2px; }
.cart-row__price { font-weight: 700; color: var(--accent-2); text-align: right; }
.cart-row__remove {
  background: transparent; border: 0; color: var(--danger); font-size: var(--fs-xs);
  margin-top: var(--s-1); cursor: pointer;
}
.cart-empty { text-align: center; color: var(--fg-2); padding: var(--s-7) 0; }

.cart-sheet__foot {
  padding: var(--s-4); border-top: 1px solid rgba(255,255,255,.06);
  display: flex; flex-direction: column; gap: var(--s-3);
}
.cart-sheet__sub { display: flex; justify-content: space-between; color: var(--fg-1); }
.cart-sheet__sub strong { color: var(--fg-0); font-size: var(--fs-lg); }
.cart-sheet__cta { width: 100%; padding: var(--s-4); font-size: var(--fs-lg); }
.cart-sheet__cta[aria-disabled="true"] { opacity: .5; pointer-events: none; }
```

- [ ] **Step 2: Replace `openCart` in `js/order.js` + add cart renderer**

Find in `js/order.js`:
```js
function openCart() { document.querySelector('[data-cart-sheet]').hidden = false; }
function closeCart() { document.querySelector('[data-cart-sheet]').hidden = true; }
```

Replace with:
```js
function openCart() {
  renderCart();
  document.querySelector('[data-cart-sheet]').hidden = false;
}
function closeCart() { document.querySelector('[data-cart-sheet]').hidden = true; }

function renderCart() {
  const items = Store.cart.get();
  const body = document.querySelector('[data-cart-body]');
  const cta = document.querySelector('.cart-sheet__cta');

  if (items.length === 0) {
    body.innerHTML = `<p class="cart-empty">Keranjang masih kosong.</p>`;
    document.querySelector('[data-cart-subtotal]').textContent = formatRupiah(0);
    cta.setAttribute('aria-disabled', 'true');
    return;
  }

  let subtotal = 0;
  body.innerHTML = items.map(it => {
    const m = MENUS.find(x => x.id === it.menu_id);
    if (!m) return '';
    const line = m.harga * it.qty;
    subtotal += line;
    return `
      <div class="cart-row">
        <div>
          <div class="cart-row__nama">${m.nama}</div>
          <div class="cart-row__meta">${formatRupiah(m.harga)} × ${it.qty}</div>
          ${it.catatan ? `<div class="cart-row__catatan">"${escapeHtml(it.catatan)}"</div>` : ''}
          <button class="cart-row__remove" data-remove="${m.id}">Hapus</button>
        </div>
        <div class="cart-row__price">${formatRupiah(line)}</div>
      </div>
    `;
  }).join('');

  document.querySelector('[data-cart-subtotal]').textContent = formatRupiah(subtotal);
  cta.removeAttribute('aria-disabled');

  body.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      Store.cart.setQty(btn.dataset.remove, 0);
      renderCart(); renderFeed(); updateCartBadge();
    });
  });
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
```

- [ ] **Step 3: Manual verification**

Reload `order.html`. Add 2 items, write catatan on one. Click 🛒. Expected:
- Bottom-sheet slides up from bottom, with backdrop.
- Each line shows name, "Rp × qty", catatan in italic if present, Hapus button, line total.
- Subtotal sums correctly.
- "Lanjut ke Checkout →" CTA (click will 404 until Task 5).
- Hapus removes item, feed updates.
- Empty cart → "Keranjang masih kosong.", CTA disabled.

- [ ] **Step 4: Commit**

```bash
git add css/order.css js/order.js
git commit -m "feat(order): cart bottom-sheet with line items + subtotal"
```

---

## Task 5: `checkout.html` — form with delivery tiers & payment

**Files:**
- Create: `checkout.html`, `css/checkout.css`, `js/checkout.js`

- [ ] **Step 1: Create `checkout.html`**

```html
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Checkout — Pedesan</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/tokens.css" />
  <link rel="stylesheet" href="css/base.css" />
  <link rel="stylesheet" href="css/chat-widget.css" />
  <link rel="stylesheet" href="css/checkout.css" />
</head>
<body>
  <header class="co-header">
    <a href="order.html" class="co-header__back" aria-label="Kembali">←</a>
    <h1>Checkout</h1>
    <span></span>
  </header>

  <main class="co container">
    <section class="co__summary" data-summary>
      <h2>Ringkasan Pesanan</h2>
      <div data-summary-items></div>
    </section>

    <form class="co__form" data-form>
      <section class="co__section">
        <h2>Data Pengiriman</h2>
        <label>Nama <span class="req">*</span>
          <input type="text" name="nama" required />
        </label>
        <label>Nomor WhatsApp <span class="req">*</span>
          <input type="tel" name="wa" required pattern="^(\+62|62|0)\d{8,14}$" placeholder="08123456789" />
        </label>
        <div class="co__loc">
          <button type="button" class="btn btn--ghost" data-geo>📍 Bagikan Lokasi</button>
          <div class="co__loc-status" data-geo-status>Belum ada lokasi</div>
          <label class="co__manual">Atau pilih jarak manual:
            <select name="manual_tier" data-manual-tier>
              <option value="">—</option>
              <option value="3">≤ 3 km</option>
              <option value="4">3–4 km</option>
              <option value="5">5 km</option>
              <option value="10">&gt; 5 km</option>
            </select>
          </label>
        </div>
        <label>Alamat Lengkap <span class="req">*</span>
          <textarea name="alamat" required rows="3" placeholder="Jalan, nomor rumah, patokan..."></textarea>
        </label>
      </section>

      <section class="co__section">
        <h2>Metode Pembayaran</h2>
        <div class="co__payments">
          <label class="co__pay"><input type="radio" name="payment" value="tunai" required /><span>💵 Tunai</span></label>
          <label class="co__pay"><input type="radio" name="payment" value="qris" /><span>📱 QRIS</span></label>
          <label class="co__pay"><input type="radio" name="payment" value="transfer" /><span>🏦 Transfer</span></label>
        </div>
        <div class="co__tunai" data-tunai hidden>
          <label>Uang yang disiapkan
            <input type="number" name="cash_given" min="0" step="1000" placeholder="50000" />
          </label>
          <div class="co__change" data-change>Kembalian: Rp0</div>
        </div>
        <p class="co__pay-note" data-paynote hidden></p>
      </section>

      <section class="co__totals">
        <div><span>Subtotal makanan</span><strong data-subtotal>Rp0</strong></div>
        <div><span>Ongkir</span><strong data-ongkir>Rp0</strong></div>
        <div class="co__grand"><span>Total</span><strong data-total>Rp0</strong></div>
      </section>

      <button class="btn btn--lg co__submit" type="submit" disabled>Kirim Pesanan →</button>
    </form>
  </main>

  <script src="js/utils.js"></script>
  <script src="js/mock-data.js"></script>
  <script src="js/api.js"></script>
  <script src="js/store.js"></script>
  <script src="js/chat-widget.js"></script>
  <script src="js/checkout.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `css/checkout.css`**

```css
/* css/checkout.css */
.co-header {
  position: sticky; top: 0; z-index: var(--z-nav);
  display: grid; grid-template-columns: 48px 1fr 48px; align-items: center;
  padding: var(--s-3) var(--s-4);
  background: rgba(14,11,10,.9); backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.co-header__back { font-size: 24px; color: var(--fg-0); text-align: center; }
.co-header h1 { font-family: var(--font-display); font-size: var(--fs-xl); letter-spacing: .06em; text-align: center; }

.co { padding: var(--s-5) var(--s-5) 120px; display: grid; gap: var(--s-6); max-width: 720px; }

.co__summary { background: var(--bg-1); border-radius: var(--r-3); padding: var(--s-4); border: 1px solid rgba(255,255,255,.05); }
.co__summary h2 { font-family: var(--font-display); font-size: var(--fs-xl); letter-spacing: .04em; margin-bottom: var(--s-3); }
.co__row { display: flex; justify-content: space-between; gap: var(--s-3); padding: var(--s-2) 0; border-bottom: 1px solid rgba(255,255,255,.04); }
.co__row:last-child { border-bottom: 0; }
.co__row-name { flex: 1; }
.co__row-cat { color: var(--fg-1); font-size: var(--fs-sm); font-style: italic; display: block; }

.co__form { display: grid; gap: var(--s-5); }
.co__section { background: var(--bg-1); border-radius: var(--r-3); padding: var(--s-4); border: 1px solid rgba(255,255,255,.05); display: grid; gap: var(--s-3); }
.co__section h2 { font-family: var(--font-display); font-size: var(--fs-xl); letter-spacing: .04em; }
.co__section label { display: flex; flex-direction: column; gap: var(--s-1); color: var(--fg-1); font-size: var(--fs-sm); }
.co__section input, .co__section textarea, .co__section select {
  padding: var(--s-3); border-radius: var(--r-2);
  background: var(--bg-2); color: var(--fg-0);
  border: 1px solid rgba(255,255,255,.08); font: inherit;
}
.req { color: var(--accent); }

.co__loc { display: grid; gap: var(--s-2); }
.co__loc-status { font-size: var(--fs-sm); color: var(--fg-1); }
.co__loc-status.ok { color: var(--success); }
.co__loc-status.err { color: var(--danger); }
.co__manual { margin-top: var(--s-2); }

.co__payments { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s-2); }
.co__pay { display: flex; flex-direction: column; align-items: center; gap: var(--s-1);
  padding: var(--s-3); border-radius: var(--r-2); border: 1px solid rgba(255,255,255,.08);
  background: var(--bg-2); color: var(--fg-1); cursor: pointer; transition: all var(--d-fast);
}
.co__pay:has(input:checked) { border-color: var(--accent); color: var(--fg-0); background: rgba(255,59,31,.1); }
.co__pay input { accent-color: var(--accent); }
.co__pay span { font-size: var(--fs-sm); }

.co__tunai { display: grid; gap: var(--s-2); }
.co__change { font-weight: 700; color: var(--accent-2); }
.co__change.err { color: var(--danger); }
.co__pay-note { color: var(--fg-1); font-size: var(--fs-sm); background: rgba(255,255,255,.03); padding: var(--s-3); border-radius: var(--r-2); }

.co__totals { background: var(--bg-1); border-radius: var(--r-3); padding: var(--s-4); border: 1px solid rgba(255,255,255,.05); display: grid; gap: var(--s-2); }
.co__totals > div { display: flex; justify-content: space-between; color: var(--fg-1); }
.co__totals strong { color: var(--fg-0); }
.co__grand { border-top: 1px solid rgba(255,255,255,.08); padding-top: var(--s-3); margin-top: var(--s-2); font-size: var(--fs-lg); }
.co__grand strong { color: var(--accent-2); font-size: var(--fs-xl); }

.co__submit { width: 100%; padding: var(--s-4); font-size: var(--fs-lg); }
.co__submit:disabled { opacity: .5; cursor: not-allowed; }
```

- [ ] **Step 3: Create `js/checkout.js`**

```js
// js/checkout.js
let MENUS = [];
let KITCHEN = null;
let distanceKm = null;

document.addEventListener('DOMContentLoaded', async () => {
  MENUS = await API.getMenus('pedesan');
  KITCHEN = await API.getKitchenCoord();

  const items = Store.cart.get();
  if (items.length === 0) { window.location.href = 'order.html'; return; }

  // prefill customer
  const cust = Store.customer.get();
  if (cust) {
    document.querySelector('[name=nama]').value = cust.nama || '';
    document.querySelector('[name=wa]').value = cust.wa || '';
  }

  renderSummary(items);
  recalcTotals();

  // listeners
  document.querySelector('[data-geo]').addEventListener('click', requestGeo);
  document.querySelector('[data-manual-tier]').addEventListener('change', (e) => {
    const v = parseFloat(e.target.value);
    if (v) { distanceKm = v; document.querySelector('[data-geo-status]').textContent = `Jarak manual: ${v} km`; document.querySelector('[data-geo-status]').className = 'co__loc-status ok'; }
    recalcTotals();
  });

  document.querySelectorAll('[name=payment]').forEach(r => r.addEventListener('change', onPaymentChange));
  document.querySelector('[name=cash_given]').addEventListener('input', () => { recalcTotals(); });

  document.querySelector('[data-form]').addEventListener('submit', onSubmit);
  document.querySelector('[data-form]').addEventListener('input', () => validateForm());

  ChatWidget.mount();
});

function renderSummary(items) {
  const wrap = document.querySelector('[data-summary-items]');
  wrap.innerHTML = items.map(it => {
    const m = MENUS.find(x => x.id === it.menu_id);
    if (!m) return '';
    const line = m.harga * it.qty;
    return `<div class="co__row">
      <div class="co__row-name">${m.nama} × ${it.qty}${it.catatan ? `<span class="co__row-cat">"${escapeHtml(it.catatan)}"</span>` : ''}</div>
      <strong>${formatRupiah(line)}</strong>
    </div>`;
  }).join('');
}

function recalcTotals() {
  const items = Store.cart.get();
  const subtotal = items.reduce((s, it) => {
    const m = MENUS.find(x => x.id === it.menu_id);
    return s + (m ? m.harga * it.qty : 0);
  }, 0);
  const ongkir = distanceKm != null ? deliveryFee(distanceKm) : 0;
  const total = subtotal + ongkir;

  document.querySelector('[data-subtotal]').textContent = formatRupiah(subtotal);
  document.querySelector('[data-ongkir]').textContent = distanceKm != null ? formatRupiah(ongkir) : '—';
  document.querySelector('[data-total]').textContent = formatRupiah(total);

  // tunai change
  const paySel = document.querySelector('[name=payment]:checked')?.value;
  if (paySel === 'tunai') {
    const cash = parseInt(document.querySelector('[name=cash_given]').value, 10) || 0;
    const change = cash - total;
    const el = document.querySelector('[data-change]');
    if (cash === 0) { el.textContent = 'Kembalian: Rp0'; el.className = 'co__change'; }
    else if (change < 0) { el.textContent = `Kurang ${formatRupiah(-change)}`; el.className = 'co__change err'; }
    else { el.textContent = `Kembalian: ${formatRupiah(change)}`; el.className = 'co__change'; }
  }

  validateForm();
}

function onPaymentChange(e) {
  const v = e.target.value;
  const tunai = document.querySelector('[data-tunai]');
  const note = document.querySelector('[data-paynote]');
  tunai.hidden = v !== 'tunai';
  if (v === 'qris') { note.hidden = false; note.textContent = 'Admin akan mengirim QRIS setelah konfirmasi.'; }
  else if (v === 'transfer') { note.hidden = false; note.textContent = 'Admin akan mengirim nomor rekening setelah konfirmasi.'; }
  else { note.hidden = true; }
  recalcTotals();
}

function requestGeo() {
  const status = document.querySelector('[data-geo-status]');
  if (!navigator.geolocation) { status.textContent = 'Geolocation tidak tersedia.'; status.className = 'co__loc-status err'; return; }
  status.textContent = 'Mengambil lokasi...'; status.className = 'co__loc-status';
  navigator.geolocation.getCurrentPosition((pos) => {
    distanceKm = haversineKm(KITCHEN.lat, KITCHEN.lng, pos.coords.latitude, pos.coords.longitude);
    status.textContent = `Jarak: ${distanceKm.toFixed(1)} km · Ongkir: ${formatRupiah(deliveryFee(distanceKm))}`;
    status.className = 'co__loc-status ok';
    recalcTotals();
  }, (err) => {
    status.textContent = `Gagal ambil lokasi (${err.message}). Gunakan pilihan manual di bawah.`;
    status.className = 'co__loc-status err';
  }, { enableHighAccuracy: true, timeout: 10000 });
}

function validateForm() {
  const form = document.querySelector('[data-form]');
  const fd = new FormData(form);
  const ok =
    fd.get('nama') && fd.get('wa') && fd.get('alamat') && fd.get('payment') &&
    distanceKm != null &&
    (fd.get('payment') !== 'tunai' ||
      (parseInt(fd.get('cash_given'), 10) || 0) >= currentTotal());
  document.querySelector('.co__submit').disabled = !ok;
}

function currentTotal() {
  const items = Store.cart.get();
  const subtotal = items.reduce((s, it) => {
    const m = MENUS.find(x => x.id === it.menu_id);
    return s + (m ? m.harga * it.qty : 0);
  }, 0);
  const ongkir = distanceKm != null ? deliveryFee(distanceKm) : 0;
  return subtotal + ongkir;
}

async function onSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const items = Store.cart.get();
  const payment = { method: fd.get('payment') };
  if (payment.method === 'tunai') payment.cash_given = parseInt(fd.get('cash_given'), 10) || 0;

  const order = await API.submitOrder({
    customer: { nama: fd.get('nama'), wa: fd.get('wa') },
    items,
    location: { distance_km: distanceKm, alamat: fd.get('alamat') },
    payment
  });

  Store.customer.set({ nama: fd.get('nama'), wa: fd.get('wa') });
  Store.cart.clear();
  window.location.href = `status.html?id=${encodeURIComponent(order.id)}`;
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
```

- [ ] **Step 4: Manual verification**

Add 2 items to cart via `order.html`, click "Lanjut ke Checkout". Expected:
- Summary shows the items with catatan.
- Nama/WA prefilled if a customer was saved previously.
- Click "Bagikan Lokasi" → browser prompts for geo (accept) → shows "Jarak: X.X km · Ongkir: RpX". If denied, status shows error and manual dropdown enables.
- Select manual tier instead → same ongkir set, status updates.
- Select Tunai → reveals cash input; type amount < total → "Kurang RpX" in red, submit disabled; type ≥ total → "Kembalian: RpX".
- Select QRIS/Transfer → note appears below.
- All fields filled + geo set + enough cash (if tunai) → submit button enables.
- Submit → redirects to `status.html?id=ord-xxx` (will 404 until Task 6 — that's fine for now, the order is created in mock).
- Check console: `MOCK.orders[MOCK.orders.length-1]` shows the submitted order.
- Cart is cleared.

- [ ] **Step 5: Commit**

```bash
git add checkout.html css/checkout.css js/checkout.js
git commit -m "feat(checkout): form with geolocation ongkir, payment methods, tunai change calc"
```

---

## Task 6: `status.html` — 5-phase tracker + contextual payment block

**Files:**
- Create: `status.html`, `css/status.css`, `js/status.js`

- [ ] **Step 1: Create `status.html`**

```html
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Status Pesanan — Pedesan</title>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/tokens.css" />
  <link rel="stylesheet" href="css/base.css" />
  <link rel="stylesheet" href="css/chat-widget.css" />
  <link rel="stylesheet" href="css/status.css" />
</head>
<body>
  <header class="st-header">
    <a href="index.html" class="st-header__home" aria-label="Home">🏠</a>
    <h1>Status Pesanan</h1>
    <span></span>
  </header>

  <main class="st container" data-root>
    <!-- rendered by status.js -->
  </main>

  <script src="js/utils.js"></script>
  <script src="js/mock-data.js"></script>
  <script src="js/api.js"></script>
  <script src="js/store.js"></script>
  <script src="js/chat-widget.js"></script>
  <script src="js/status.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `css/status.css`**

```css
/* css/status.css */
.st-header {
  position: sticky; top: 0; z-index: var(--z-nav);
  display: grid; grid-template-columns: 48px 1fr 48px; align-items: center;
  padding: var(--s-3) var(--s-4);
  background: rgba(14,11,10,.9); backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.st-header__home { font-size: 20px; text-align: center; }
.st-header h1 { font-family: var(--font-display); font-size: var(--fs-xl); letter-spacing: .06em; text-align: center; }

.st { max-width: 640px; padding: var(--s-5) var(--s-5) 120px; display: grid; gap: var(--s-5); }
.st__head { display: flex; justify-content: space-between; color: var(--fg-1); font-size: var(--fs-sm); }
.st__head strong { color: var(--fg-0); }

.tracker { display: flex; justify-content: space-between; position: relative; padding: var(--s-4) 0 var(--s-6); }
.tracker::before {
  content: ''; position: absolute; left: 7%; right: 7%; top: calc(var(--s-4) + 16px);
  height: 3px; background: rgba(255,255,255,.08); border-radius: var(--r-full);
}
.tracker__fill {
  position: absolute; left: 7%; top: calc(var(--s-4) + 16px); height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  border-radius: var(--r-full); width: 0; transition: width var(--d-slow) var(--ease-out);
}
.tr-step { flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--s-2); position: relative; z-index: 1; }
.tr-step__dot {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--bg-2); border: 2px solid rgba(255,255,255,.1);
  display: grid; place-items: center; color: var(--fg-2); font-weight: 700;
  transition: all var(--d-base) var(--ease-out);
}
.tr-step.is-done .tr-step__dot { background: var(--accent); border-color: var(--accent); color: #fff; }
.tr-step.is-active .tr-step__dot { background: var(--accent); border-color: var(--accent); color: #fff; animation: step-pulse 1.4s ease-out infinite; }
@keyframes step-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,59,31,.5); } 50% { box-shadow: 0 0 0 10px rgba(255,59,31,0); } }
.tr-step__label { font-size: var(--fs-xs); color: var(--fg-2); text-align: center; }
.tr-step.is-done .tr-step__label, .tr-step.is-active .tr-step__label { color: var(--fg-0); }

.st-card { background: var(--bg-1); border-radius: var(--r-3); padding: var(--s-5); border: 1px solid rgba(255,255,255,.05); }
.st-card--phase { display: grid; grid-template-columns: 72px 1fr; gap: var(--s-4); align-items: center; }
.st-card__icon { font-size: 48px; }
.st-card__phase { font-family: var(--font-display); font-size: var(--fs-xl); letter-spacing: .04em; }
.st-card__copy { color: var(--fg-1); margin-top: var(--s-1); }

.st-pay { background: rgba(255,164,27,.1); border: 1px solid rgba(255,164,27,.3); border-radius: var(--r-3); padding: var(--s-4); }
.st-pay h3 { font-family: var(--font-display); font-size: var(--fs-lg); letter-spacing: .04em; margin-bottom: var(--s-2); }
.st-pay__qris img { width: 200px; height: 200px; object-fit: contain; background: #fff; padding: var(--s-3); border-radius: var(--r-2); margin: var(--s-2) 0; }
.st-pay__rek { display: flex; gap: var(--s-2); align-items: center; }
.st-pay__rek code { background: var(--bg-2); padding: var(--s-2) var(--s-3); border-radius: var(--r-2); font-size: var(--fs-md); }

.st-detail { background: var(--bg-1); border-radius: var(--r-3); padding: var(--s-5); border: 1px solid rgba(255,255,255,.05); }
.st-detail summary { cursor: pointer; font-family: var(--font-display); font-size: var(--fs-lg); letter-spacing: .04em; list-style: none; }
.st-detail summary::marker, .st-detail summary::-webkit-details-marker { display: none; }
.st-detail[open] summary::after { content: ' ▲'; }
.st-detail summary::after { content: ' ▼'; font-size: var(--fs-sm); }
.st-detail__row { display: flex; justify-content: space-between; padding: var(--s-2) 0; border-bottom: 1px solid rgba(255,255,255,.04); }
.st-detail__grand { display: flex; justify-content: space-between; padding-top: var(--s-3); margin-top: var(--s-2); border-top: 1px solid rgba(255,255,255,.08); font-weight: 700; }
.st-detail__cat { display: block; color: var(--fg-1); font-size: var(--fs-sm); font-style: italic; }
```

- [ ] **Step 3: Create `js/status.js`**

```js
// js/status.js
const PHASES = ['Diterima','Dikonfirmasi','Dimasak','Siap','Diantar','Selesai'];
const PHASE_COPY = {
  Diterima: { icon: '📩', copy: 'Pesananmu sudah sampai ke admin.' },
  Dikonfirmasi: { icon: '✅', copy: 'Admin sudah konfirmasi. Dapur siap masak.' },
  Dimasak: { icon: '🍳', copy: 'Sedang dimasak, wangi banget.' },
  Siap: { icon: '🔔', copy: 'Pesananmu siap, menunggu kurir.' },
  Diantar: { icon: '🛵', copy: 'Kurir sedang menuju lokasimu.' },
  Selesai: { icon: '🎉', copy: 'Selesai! Selamat makan.' }
};

document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { document.querySelector('[data-root]').innerHTML = `<p style="text-align:center;color:var(--fg-2)">ID pesanan tidak ditemukan.</p>`; return; }
  await render(id);
  setInterval(() => render(id), 3000);
  ChatWidget.mount();
});

async function render(id) {
  const order = await API.getOrder(id);
  if (!order) { document.querySelector('[data-root]').innerHTML = `<p style="text-align:center;color:var(--fg-2)">Pesanan tidak ditemukan.</p>`; return; }

  document.querySelector('[data-root]').innerHTML = `
    <div class="st__head">
      <span>Order <strong>${order.id}</strong></span>
      <span>${escapeHtml(order.customer.nama)}</span>
    </div>

    ${trackerHTML(order.status)}

    <section class="st-card st-card--phase">
      <div class="st-card__icon">${PHASE_COPY[order.status].icon}</div>
      <div>
        <div class="st-card__phase">${order.status}</div>
        <div class="st-card__copy">${PHASE_COPY[order.status].copy}</div>
      </div>
    </section>

    ${paymentBlock(order)}

    <details class="st-detail">
      <summary>Detail Pesanan</summary>
      ${order.items.map(it => itemRow(it)).join('')}
      <div class="st-detail__row"><span>Subtotal</span><strong>${formatRupiah(order.subtotal)}</strong></div>
      <div class="st-detail__row"><span>Ongkir (${order.location.distance_km?.toFixed?.(1) ?? order.location.distance_km} km)</span><strong>${formatRupiah(order.ongkir)}</strong></div>
      <div class="st-detail__grand"><span>Total</span><strong>${formatRupiah(order.total)}</strong></div>
    </details>
  `;
}

function trackerHTML(status) {
  const idx = PHASES.indexOf(status);
  const visible = PHASES.slice(0, 5); // show 5 phases in tracker; "Selesai" just keeps all done
  const doneCount = idx >= PHASES.length - 1 ? visible.length : idx;
  const fillPct = (doneCount / (visible.length - 1)) * 86; // 86 = range between 7% and 93%
  return `
    <div class="tracker">
      <div class="tracker__fill" style="width:${fillPct}%"></div>
      ${visible.map((p, i) => `
        <div class="tr-step ${i < idx || status === 'Selesai' ? 'is-done' : i === idx ? 'is-active' : ''}">
          <div class="tr-step__dot">${i + 1}</div>
          <div class="tr-step__label">${p}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function paymentBlock(order) {
  const confirmed = PHASES.indexOf(order.status) >= 1;
  if (order.payment.method === 'tunai') {
    const cash = order.payment.cash_given || 0;
    const change = Math.max(0, cash - order.total);
    return `<section class="st-pay">
      <h3>Tunai</h3>
      <p>Siapkan <strong>${formatRupiah(cash)}</strong>. Kembalian: <strong>${formatRupiah(change)}</strong>.</p>
    </section>`;
  }
  if (order.payment.method === 'qris') {
    if (!confirmed) return `<section class="st-pay"><h3>QRIS</h3><p>Menunggu admin mengirim QRIS...</p></section>`;
    return `<section class="st-pay">
      <h3>QRIS</h3>
      <div class="st-pay__qris"><img src="assets/img/qris-sample.png" alt="QRIS" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div style=color:var(--fg-1)>[Placeholder QRIS — admin akan mengirim barcode asli]</div>')"/></div>
      <p>Scan & bayar total <strong>${formatRupiah(order.total)}</strong>.</p>
    </section>`;
  }
  if (order.payment.method === 'transfer') {
    if (!confirmed) return `<section class="st-pay"><h3>Transfer</h3><p>Menunggu admin mengirim nomor rekening...</p></section>`;
    return `<section class="st-pay">
      <h3>Transfer</h3>
      <div class="st-pay__rek">
        <code id="rek">BCA · 1234567890 · MasakGuys</code>
        <button class="btn" onclick="navigator.clipboard.writeText(document.getElementById('rek').textContent)">Salin</button>
      </div>
      <p style="margin-top:var(--s-3)">Transfer total <strong>${formatRupiah(order.total)}</strong>, lalu:</p>
      <button class="btn btn--ghost" onclick="alert('Konfirmasi dikirim ke admin.')">Konfirmasi sudah bayar</button>
    </section>`;
  }
  return '';
}

function itemRow(it) {
  const m = MOCK.menus.find(x => x.id === it.menu_id);
  if (!m) return '';
  return `<div class="st-detail__row">
    <span>${m.nama} × ${it.qty}${it.catatan ? `<span class="st-detail__cat">"${escapeHtml(it.catatan)}"</span>` : ''}</span>
    <strong>${formatRupiah(m.harga * it.qty)}</strong>
  </div>`;
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
```

- [ ] **Step 4: Manual verification (end-to-end)**

Full flow:
1. Open `order.html`. Add Usus Pedas (qty 2, catatan "pedas level 5") + Es Teh Manis (qty 1).
2. Open cart → "Lanjut ke Checkout".
3. Fill nama "Budi", WA "081234567890", click Bagikan Lokasi (or pick manual ≤3 km), alamat "Jl. Test 1".
4. Pick Tunai, input 50000.
5. Submit → redirects to `status.html?id=...`.

Expected on `status.html`:
- Header with order ID, customer name.
- 5-step tracker; step 1 "Diterima" is active (pulsing red), others muted.
- Card: 📩 "Diterima — Pesananmu sudah sampai ke admin."
- Tunai block: "Siapkan Rp50.000. Kembalian: Rp9.000." (50000 − 2×18000 − 5000 − 3000 ongkir = 6000; adjust if numbers differ — the point is the arithmetic is visible).
- Detail accordion shows each item + subtotal + ongkir + total.

Now in DevTools console run `API.advanceStatus('ord-...')` a few times (replace with the id from URL). After each call wait ~3s; the page should re-render:
- Phase 2 Dikonfirmasi: ✅ copy changes, step 2 active.
- Phase 3 Dimasak: 🍳 wok emoji, step 3 active.
- etc through Selesai.

For QRIS path: repeat flow but pick QRIS. Before advancing: "Menunggu admin mengirim QRIS..." After advancing once (Dikonfirmasi): QRIS placeholder image or fallback text + total.

- [ ] **Step 5: Commit**

```bash
git add status.html css/status.css js/status.js
git commit -m "feat(status): 5-phase tracker, contextual payment block, 3s polling"
```

---

## Task 7: Polish — queue reflects real orders & bump "Pesan Sekarang" flow

**Files:**
- Modify: `js/landing.js`

- [ ] **Step 1: Make landing queue counter reflect live MOCK.queue changes**

In `js/landing.js`, the interval already reads `MOCK.queue.total`. But the interval only re-reads via `API.getQueue()` which returns a copy, and mutates it by ±1 via random fluctuation. We want the landing queue to also rise when the user submits an order (which increments `MOCK.queue.total` in Task 1's `submitOrder`).

The current interval block already re-reads on every tick, so it will naturally reflect submit-time increments. No code change needed if the queue page stays open in another tab during ordering — but the whole session reloads fresh each page, and MOCK state lives per tab.

Confirm by visual test only — no code change required.

- [ ] **Step 2: Manual verification (skip if unchanged)**

No behavior regression. Landing page still shows queue animating.

- [ ] **Step 3: Update README with Plan 2 additions**

Find in `README.md`:
```markdown
**Pages (current):**
- `/` — landing (hero, queue, highlights, story, video, CTA, kritik-saran)
```

Replace with:
```markdown
**Pages (current):**
- `/` — landing (hero, queue, highlights, story, video, CTA, kritik-saran)
- `/order.html` — Instagram-feed menu (category tabs, carousel posts, double-tap love, add-to-cart stepper, catatan, floating cart)
- `/checkout.html` — checkout (geolocation delivery fee, payment: tunai/QRIS/transfer)
- `/status.html?id=xxx` — live 5-phase order tracker
```

Find in `README.md`:
```markdown
- Plan 1: `docs/superpowers/plans/2026-04-17-plan-1-foundation-and-landing.md`
```

Replace with:
```markdown
- Plan 1: `docs/superpowers/plans/2026-04-17-plan-1-foundation-and-landing.md`
- Plan 2: `docs/superpowers/plans/2026-04-17-plan-2-customer-order-flow.md`
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "chore: README update for Plan 2"
```

---

## Plan 2 — Definition of Done

- `order.html`, `checkout.html`, `status.html` all load with zero console errors.
- Full customer flow works end-to-end on XAMPP:
  1. Browse IG feed, double-tap to love, add to cart with stepper + catatan.
  2. Open cart sheet, see subtotal, go to checkout.
  3. Fill form; geolocation computes ongkir via tier; manual fallback works.
  4. Tunai calculates change live and blocks submit on insufficient cash.
  5. Submit → order saved in `MOCK.orders`, customer upserted in `MOCK.customers`, ingredient stock deducted per recipe, queue counter incremented.
  6. Redirect to status page; tracker at phase 1.
  7. `API.advanceStatus(id)` from console advances through the 5 phases with visible UI updates every ~3s.
- All existing tests still green + new `api.orders` module green.
- Spec §5, §6, §7 fully covered.

**Not in this plan (deferred to Plan 3+):**
- Staff dashboards (admin, kitchen, delivery) — Plan 3
- Manager dashboard incl. Menu Editor — Plan 4
- Real backend / real chat / real QRIS — post-frontend
