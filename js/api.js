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
