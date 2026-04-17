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
