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

function updateCartBadge() {
  const badge = document.querySelector('[data-cart-badge]');
  const c = Store.cart.count();
  if (c > 0) { badge.textContent = c; badge.hidden = false; }
  else { badge.hidden = true; }
}
