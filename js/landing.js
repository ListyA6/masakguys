// js/landing.js
document.addEventListener('DOMContentLoaded', async () => {
  // Locomotive smooth scroll
  if (window.LocomotiveScroll) {
    new LocomotiveScroll({
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
