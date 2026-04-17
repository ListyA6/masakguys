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
