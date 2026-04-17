// js/landing.js
document.addEventListener('DOMContentLoaded', async () => {
  let loco = null;
  if (window.LocomotiveScroll) {
    loco = new LocomotiveScroll({
      el: document.querySelector('[data-scroll-container]'),
      smooth: true, lerp: 0.08, multiplier: 1
    });
  }

  // Queue counter — animated number with simulated updates
  const el = document.querySelector('[data-queue-count]');
  if (el) {
    const q = await API.getQueue();
    animateCount(el, 0, q.total, 1200);
    // simulate live fluctuation every 6s
    setInterval(async () => {
      // mutate mock directly so later page-loads see it too
      MOCK.queue.total = Math.max(0, MOCK.queue.total + (Math.random() < .5 ? -1 : 1));
      const fresh = await API.getQueue();
      const current = parseInt(el.textContent, 10) || 0;
      animateCount(el, current, fresh.total, 700);
    }, 6000);
  }

  // Highlights — signature menu carousel rail
  const rail = document.querySelector('[data-highlights-rail]');
  if (rail) {
    const menus = await API.getMenus('pedesan');
    const top4 = menus.filter(m => m.kategori === 'makanan').slice(0, 4);
    rail.innerHTML = top4.map(m => `
      <article class="highlight-card">
        <img src="${m.media[0].src}" alt="${m.nama}" loading="lazy" />
        <div class="highlight-card__body">
          <div class="highlight-card__nama">${m.nama}</div>
          <p class="highlight-card__desc">${m.deskripsi}</p>
          <div class="highlight-card__price">${formatRupiah(m.harga)}</div>
        </div>
      </article>
    `).join('');
  }

  // Masak dengan Hati — panel progression (no GSAP pinning needed; uses sticky + scroll progress)
  const pin = document.querySelector('[data-story-pin]');
  if (pin) {
    const panels = pin.querySelectorAll('.story__panel');
    const onScroll = () => {
      const r = pin.getBoundingClientRect();
      const total = pin.offsetHeight - window.innerHeight;
      const progress = clamp(-r.top / total, 0, 1);
      const active = Math.min(panels.length - 1, Math.floor(progress * panels.length));
      panels.forEach((p, i) => p.classList.toggle('is-active', i === active));
    };
    if (loco) loco.on('scroll', onScroll);
    else window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Kritik & saran
  const form = document.querySelector('[data-feedback-form]');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      await API.submitFeedback({
        nama: fd.get('nama') || null,
        wa: fd.get('wa') || null,
        pesan: fd.get('pesan')
      });
      form.reset();
      form.querySelector('.feedback-form__ok').hidden = false;
      setTimeout(() => { form.querySelector('.feedback-form__ok').hidden = true; }, 4000);
    });
  }

  // Footer "Chat Admin" button opens the floating widget
  const openBtn = document.querySelector('[data-open-chat]');
  if (openBtn) openBtn.addEventListener('click', () => document.querySelector('.chat-fab')?.click());
});

function animateCount(el, from, to, duration) {
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
    const v = Math.round(from + (to - from) * eased);
    el.textContent = v;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
