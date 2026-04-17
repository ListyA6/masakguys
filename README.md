# MasakGuys — Ghost Kitchen Operation

Multi-brand ghost kitchen leveraging LalaFun's existing infrastructure (rice, chicken, bulk capacity, staff, space, delivery).

**Core concept:** Multiple food brands, one kitchen. Customer orders via WhatsApp catalog → appears in system → delivery city-wide. No CS, no physical storefront. Education lives on Instagram.

---

## Brand Roadmap

| Phase | Brand | Status |
|-------|-------|--------|
| 1 | Penyetan or Fried Rice | Planned — easy ops, hard marketing |
| 2 | Korean-Javanese-Japanese Fusion | Planned — hard ops (Listy experiments), easy marketing |
| TBD | Pedesan (usus, paru, babat, empal) | Idea |

> Korean brand = Korean aesthetic, Javanese palate, Japanese premium layer. Kediri has no quality competition here.

---

## Systems to Build

### Kitchen System
- Station layout per brand
- Prep workflow and batch scheduling
- Shared ingredient management across brands

### Hygiene System
- Sink, tray, cleaning station standards
- Daily/weekly cleaning checklist
- Food safety protocols per menu type

### Customer Order System
- WhatsApp catalog → order intake
- Inventory hook (auto sold-out when stock depleted)
- Order appears in kitchen dashboard
- No manual CS needed

### Finance System
- Per-brand revenue tracking
- Shared cost allocation (ingredients, staff, delivery)
- Monthly profit audit (auto)
- Marketing budget tracker

### List System
- Ingredient procurement list
- Equipment needs list
- Brand launch checklist

---

## Marketing Hub

- Instagram growth tracker per brand
- Endorsement campaign log
- Marketing budget calculator (spend vs. orders acquired)
- CAC (cost per customer) tracking
- Content calendar per brand

---

## Infrastructure (from LalaFun)

- Rice & chicken supply + bulk buying capacity
- Kitchen space
- Staff system
- Delivery network (scale on demand)

---

## Trigger to Activate

> Mikro Pertanian order system live and running 30 days → begin Phase 1 brand launch prep.

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
