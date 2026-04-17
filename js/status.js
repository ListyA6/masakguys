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
