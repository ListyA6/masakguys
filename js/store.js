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
