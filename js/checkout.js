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
  const cashInput = document.querySelector('[name=cash_given]');
  cashInput.addEventListener('input', (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    e.target.value = raw ? parseInt(raw, 10).toLocaleString('id-ID') : '';
    recalcTotals();
  });

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
    const cash = parseInt((document.querySelector('[name=cash_given]').value || '').replace(/\D/g, ''), 10) || 0;
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
      (parseInt((fd.get('cash_given') || '').replace(/\D/g, ''), 10) || 0) >= currentTotal());
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
  if (payment.method === 'tunai') payment.cash_given = parseInt((fd.get('cash_given') || '').replace(/\D/g, ''), 10) || 0;

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
