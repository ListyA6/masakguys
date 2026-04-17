# Pedesan Brand Site — Design Spec

**Date:** 2026-04-17
**Brand:** Pedesan (spicy offal: usus, paru, babat, empal)
**Phase:** Frontend only. Backend deferred. Mock data in JS.
**Stack:** Vanilla HTML/CSS/JS + GSAP + Locomotive Scroll + Swiper.js + Chart.js (manager finance)
**Repo:** https://github.com/ListyA6/masakguys

---

## 1. Context

MasakGuys ghost kitchen runs multiple brands. **Each brand has its own standalone website**; all brand sites share one backend (orders, queue, customer DB, inventory, staff dashboards). This spec is for the **Pedesan** brand site only.

This spec covers frontend only. Backend (PHP + MySQL on XAMPP) is a later phase — all data in this phase is mocked in `js/mock-data.js` behind a thin API layer so the swap to real endpoints is isolated.

## 2. Brand & Aesthetic

- **Inspiration:** pepsico.com — scroll-driven, parallax, cinematic sections.
- **Mood:** deep charcoal background, fiery red/orange accents, ember/smoke motion, cream text.
- **Type:** bold condensed display (hero) + clean sans body.
- **Voice:** street-food premium. Bold, hungry, direct. No cute copy.

## 3. Site Map

### Customer-facing
- `index.html` — landing (pepsico-style)
- `order.html` — Instagram-feed menu ordering
- `checkout.html` — WA + name + location + payment
- `status.html?id=xxx` — live order status tracker

### Staff-facing (separate pages, role-locked)
- `admin.html` — order cards, confirm/QRIS/mark-paid
- `kitchen.html` — cook queue, "Mulai Masak" / "Siap Diantar"
- `delivery.html` — ready orders, "Ambil & Antar" / "Selesai"
- `manager.html` — monitor everything + inventory + finance + customers + feedback/chat + staff activity

Staff pages are brand-agnostic in final state (show orders from all brands). In this frontend phase they show Pedesan mock data only.

## 4. Landing Page (`index.html`)

Scroll-driven, Locomotive Scroll for smooth + parallax, GSAP for pinning/reveal.

**Sections top-to-bottom:**

1. **Hero** — full viewport. Wordmark "PEDESAN". Tagline: "Pedas yang bikin nagih." Parallax chili/ember particles. CTA "Pesan Sekarang" → `order.html`.
2. **Live Queue Counter** — animated big number, cross-brand total from shared backend (mocked). Copy: "14 pesanan sedang dimasak di dapur kami sekarang." Ease-out tick on updates.
3. **Menu Highlights** — horizontal-snap row of 3–4 signature items (Usus Pedas, Paru Crispy, Babat Gongso, Empal Suwir), parallax card tilt on hover.
4. **"Masak dengan Hati"** (grow-positive-change equivalent) — 3 pinned-scroll panels:
   - Bahan segar dari pasar lokal Kediri
   - Dapur bersih, standar higienis
   - Dari dapur satu, untuk seluruh kota
5. **Video Section** — full-bleed background video (wok fire, plating). Overlay text reveals on scroll: "Lihat dapurnya."
6. **CTA Band** — "Lapar? Pesan sekarang." → order page.
7. **Footer (minimal):**
   - Form **Kritik & Saran** (nama optional, WA optional, pesan required)
   - Button **Chat Admin** → opens floating chat widget
   - Nothing else. No blog, no "what's new", no nav clutter.

**Excluded from pepsico base:** "What's new / stories", blog, full footer.

## 5. Order Page (`order.html`) — Instagram Feed

Familiar IG mechanics — zero learning curve.

- **Sticky header:** back arrow · brand mark · floating cart icon (circle, count badge) right. Cart opens bottom-sheet drawer.
- **Sticky category tabs** below header: **Makanan · Minuman · Tambahan**.
- **Vertical feed of posts**, 1 menu = 1 post:
  - Top strip: menu name as "username" (bold) + live stock pill ("stok: 8"). If stock = 0: entire card desaturated + diagonal "SOLD OUT" ribbon, all interactions disabled.
  - Media: square Swiper.js carousel of food photos + optional video. Dot indicators. Double-tap anywhere on media → big heart pop (spring scale 0→1.3→1, red, fades 600ms). Loved state → localStorage.
  - Action row: heart toggle · love count · price right.
  - Add-to-cart button full-width:
    - Default: "Tambahkan ke Keranjang"
    - After tap: morphs into inline stepper **[ − ] 1 [ + ]**. `+` caps at stock, `−` below 1 reverts to the button.
  - Catatan textarea appears under stepper once qty ≥ 1.
- **Floating cart** (bottom-right, circle + count badge). Opens bottom-sheet: items, qty, catatan, subtotal, "Lanjut ke Checkout".

## 6. Checkout Page (`checkout.html`)

Single scroll, step-style sections, no multi-page wizard.

**1. Data Pengiriman**
- Nama
- Nomor WhatsApp (validates 08xx / +62)
- Lokasi: "Bagikan Lokasi" button → geolocation → auto-calc distance from kitchen coordinate → display tier + ongkir live. Fallback manual dropdown if geo denied.
- Alamat lengkap (textarea, patokan)

**Delivery tiers:**
| Jarak | Ongkir |
|-------|--------|
| ≤ 3 km | Rp 3.000 |
| 3–4 km | Rp 8.000 |
| 5 km | Rp 10.000 |
| > 5 km | Rp 15.000 |

**2. Metode Pembayaran** (radio cards)
- **Tunai** — reveals "Uang yang disiapkan: Rp___". Live "Kembalian: Rp___". Blocks submit if amount < total.
- **QRIS** — info: "Admin akan mengirim QRIS setelah konfirmasi."
- **Transfer** — info: "Admin akan mengirim nomor rekening setelah konfirmasi."

**3. Ringkasan:** Subtotal · Ongkir · **Total** (bold).

**4. CTA:** "Kirim Pesanan" — disabled until valid.

**On submit (frontend mock):**
- Upsert customer (nama + WA) into localStorage `customers`
- Push order into localStorage `orders` (status = `Diterima`)
- Redirect → `status.html?id=<orderId>`

## 7. Status Page (`status.html?id=xxx`)

Auto-polls mock data every ~3s.

**5-step progress tracker:**
`Diterima → Dikonfirmasi → Dimasak → Siap → Diantar`

- Active step: pulsing fiery accent
- Completed: filled
- Pending: muted
- Smooth fill animation on advance

**Current status card** — phase icon (receipt → check → wok → bell → scooter) + friendly copy per phase.

**Payment block (contextual):**
- QRIS + status ≥ Dikonfirmasi → QRIS barcode image + "Scan & bayar."
- Transfer + status ≥ Dikonfirmasi → rekening number + "Salin" + "Konfirmasi sudah bayar."
- Tunai → "Siapkan Rp___. Kembalian Rp___."

**Order detail** (collapsible): items, qty, catatan, total.

**Floating chat admin button** — same widget as landing.

## 8. Admin Dashboard (`admin.html`)

**Focus: order status. Main screen = order cards.**

**Top bar (slim):** brand selector · filter pills (**Perlu Konfirmasi** default · Menunggu Bayar · Semua Aktif) · small icons right (🔔 chat drawer · ⚙).

**Main grid: order cards** (responsive columns, tablet-sized tap targets).

Per card:
- Top: order ID · elapsed timer (turns red >5 min unconfirmed)
- Customer: nama · WA
- Items preview with qty + catatan (truncated, tap to expand)
- Delivery: jarak · ongkir · alamat snippet
- Payment badge: Tunai / QRIS / Transfer (color-coded)
- Total (big, bold)
- **Primary action button** (context-aware, full-width bottom):
  - New → "Konfirmasi" (green)
  - Needs QRIS → "Kirim QRIS" (orange, opens preset QRIS picker)
  - Needs rekening → "Kirim Rekening" (orange)
  - Awaiting payment → "Tandai Dibayar" (blue)
- Secondary: "Tolak" link · "Detail" modal

Sort: newest unconfirmed top. Aged cards pulse. **Ding sound** on new order card.

Chat lives in a small drawer via 🔔 icon — admin only uses quick replies during service. Full chat management in `manager.html`.

## 9. Kitchen Dashboard (`kitchen.html`)

Grid of order cards, big tap targets (wet/greasy fingers).

**Two columns:**
- **Antrian Masak** (Dikonfirmasi)
- **Sedang Dimasak**

Per card: order ID · items + qty + catatan (large readable type) · elapsed timer.

**Actions:**
- "Mulai Masak" → Dimasak
- "Siap Diantar" → Siap, leaves kitchen view

**Ingredient quick-adjust:** each menu has small stock pill with ± buttons for on-the-fly correction. "Tandai Habis" → ingredient stock → 0, all dependent menus auto-grey on customer feed.

## 10. Delivery Dashboard (`delivery.html`)

List of Siap orders.

Per row: order ID · nama · alamat · jarak · ongkir · total. Tap row → Google Maps link.

**Actions:** "Ambil & Antar" → Diantar · "Selesai" → archive.

## 11. Manager Dashboard (`manager.html`)

Read-only aggregator + overrides + operational control center.

**Tabs:**

1. **Overview** — live KPIs (cross-brand queue, orders today, revenue today, avg cook time, alerts).
2. **Orders** — kanban funnel across all fases and brands, read-only, click = detail. Override: force-advance / force-cancel.
3. **Inventory** — ingredient-level CRUD. Opening stock daily. Min-stock alerts. Recipe mapping (menu → ingredient qty per portion). Menu-level availability is **computed** from ingredients.
4. **Menu Editor** — per-brand menu CRUD (brand selector at top).
   - Product list grouped by kategori (Makanan / Minuman / Tambahan), drag-to-reorder within category (product order).
   - Add new product · edit · archive.
   - Edit form: nama · deskripsi · harga · kategori · recipe (link to ingredients) · media gallery.
   - **Media manager per product:** add/remove images + video, drag-to-reorder (picture order = carousel order shown to customer), preview carousel matches `order.html` look exactly.
   - Live preview panel: shows the IG-style card as the customer will see it.
5. **Finance:**
   - **Income** (auto from completed orders, per-brand + total, daily/weekly/monthly)
   - **Expense entry** — manual form: tanggal, kategori (bahan baku / gaji / listrik / marketing / lain), nominal, catatan, optional struk photo
   - **Profit dashboard** — revenue vs expense line, profit per brand bar, expense breakdown donut, margin % over time (Chart.js)
   - **Per-order COGS** — recipe × ingredient cost → gross margin per menu
5. **Customers** — list from customer DB (nama, WA, order count, total spend, last order).
6. **Feedback & Chat** — kritik-saran inbox + full chat admin inbox with quick-reply templates.
7. **Staff activity** — log of who confirmed/cooked/delivered what, with timestamps.

Renumbered: Overview(1), Orders(2), Inventory(3), Menu Editor(4), Finance(5), Customers(6), Feedback & Chat(7), Staff activity(8).

## 12. Inventory Model (shared)

**Two levels:**

1. **Ingredient stock** (shared across brands) — beras, ayam, usus, paru, babat, cabai, minyak, bumbu, etc. Single pool.
2. **Menu item availability** (per-brand, computed) — each menu has a recipe (ingredient → qty per portion). Max portions = `floor(min(ingredient_stock / recipe_qty))`. Customer feed shows this computed number. One order deducts ingredients → every brand's menu availability recomputes live.

Kitchen quick-adjust operates at ingredient level. Manager inventory tab manages ingredients directly.

## 13. Chat Admin Widget

Floating, persistent on customer pages (landing, order, checkout, status).

- Bottom-right circle button, fiery accent, pulse when admin replies.
- Tap → bottom-sheet (mobile) / side panel (desktop).
- First time: asks nama + WA (auto-fills from checkout data if present).
- Bubbles: admin left, customer right, timestamps.
- Input: text + optional image attach.
- Session ID in localStorage, persists across pages/reloads.
- Frontend phase: mock admin replies on timers (canned) for demo.

## 14. Kritik & Saran

Form in landing footer only. Fields: Nama (opsional) · WA (opsional) · Pesan (required). Saves to localStorage `feedback`. Appears in admin 🔔 drawer and manager Feedback tab. Read/mark-as-read, reply button opens `wa.me/<number>` when WA provided.

## 15. Data Model (mock / future-backend-ready)

All mock data in `js/mock-data.js`, accessed via `js/api.js` (thin facade). Swap `api.js` to real fetch calls later without touching UI.

**Entities:**
- `Ingredient` — id, nama, unit, stock, min_stock, cost_per_unit
- `Menu` — id, brand, kategori (makanan/minuman/tambahan), nama, harga, media[], love_count, recipe[{ingredient_id, qty}]
- `Order` — id, brand, customer{nama, wa}, items[{menu_id, qty, catatan}], location{lat, lng, distance_km}, ongkir, subtotal, total, payment{method, cash_given?}, status (Diterima/Dikonfirmasi/Dimasak/Siap/Diantar/Selesai/Ditolak), created_at, updated_at, staff_log[]
- `Customer` — wa (pk), nama, order_count, total_spend, last_order_at
- `Expense` — id, tanggal, kategori, nominal, catatan, struk_url?
- `Feedback` — id, nama?, wa?, pesan, created_at, read
- `ChatSession` — id, customer{nama, wa}, messages[{from, text, image?, ts}]

## 16. File Structure

```
/
  index.html
  order.html
  checkout.html
  status.html
  admin.html
  kitchen.html
  delivery.html
  manager.html
  /css
    base.css           (reset, tokens, typography)
    landing.css
    order.css
    checkout.css
    status.css
    dashboards.css     (shared staff UI)
    manager.css
  /js
    api.js             (thin facade over mock data — swap to fetch later)
    mock-data.js
    store.js           (localStorage wrappers: cart, love, customer, session)
    landing.js         (GSAP, Locomotive, scroll choreography)
    order.js           (IG feed, carousel, love, stepper)
    checkout.js        (geolocation, delivery tier, payment)
    status.js          (polling, tracker animation)
    admin.js
    kitchen.js
    delivery.js
    manager.js         (charts, tabs)
    chat-widget.js     (shared across customer pages)
  /assets
    /img
    /video
  /vendor
    gsap/ locomotive/ swiper/ chart/
```

## 17. Animations & Effects Inventory

- Parallax backgrounds (landing hero, menu highlights, video section)
- Locomotive smooth scroll site-wide on customer pages
- GSAP pinning for "Masak dengan Hati" 3-panel story
- Ember/smoke particle layer (canvas or CSS) on hero
- Queue counter ease-out tick on value change
- IG double-tap heart spring-pop
- Add-to-cart button → stepper morph
- Status tracker fill animation on phase change
- Dashboard ding sound on new item arrival
- New-order card pulse after 5 min unconfirmed

## 18. Out of Scope (this phase)

- Real backend (PHP/MySQL) — deferred
- Real chat (mock replies only)
- Real QRIS generation — admin uploads/picks preset image
- Real-time push — polling every ~3s is good enough
- Auth/login — admin/kitchen/delivery/manager pages open, role isolation via separate URLs only
- Other brand sites (Nasi Goreng, etc.) — separate spec per brand
- SEO, PWA, offline

## 19. Open Questions / Assumptions

- Kitchen coordinate for distance calc: placeholder hardcoded lat/lng — to be provided.
- Signature menu list for highlights section: placeholder items — to be finalized with real photos.
- Sample carousel media: `1.png`–`7.png` in repo root (user-provided, 1:1 Instagram post style). **Rotated across all mock menu items** during frontend phase (each mock product gets a random rotation of these images for its carousel). Real product-specific media assigned later via the Menu Editor.
- QRIS preset images: placeholders in `/assets/img/qris-*.png` — admin selects from a small set.
- Bank accounts for transfer payment: hardcoded list in mock data — to be provided.
