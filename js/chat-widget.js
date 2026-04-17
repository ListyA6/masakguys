// js/chat-widget.js — persistent floating chat widget.
// Exposes window.ChatWidget.mount(). Safe to call once on every customer page.
(function () {
  const CANNED = [
    'Halo! Terima kasih sudah order di Pedesan. Ada yang bisa dibantu?',
    'Oke, kami cek dulu ya.',
    'Pesananmu sudah kami teruskan ke dapur.',
    'Siap, admin akan segera balas lebih lanjut.'
  ];

  let root, fab, panel, body, form, input, badge;
  let messages = []; // in-memory (per-page); session id persists
  let adminReplyTimer = null;

  function render() {
    root = document.createElement('div');
    root.innerHTML = `
      <button class="chat-fab" aria-label="Chat admin">
        💬
        <span class="chat-fab__badge" style="display:none">0</span>
      </button>
      <aside class="chat-panel" role="dialog" aria-label="Chat admin">
        <header class="chat-header">
          <strong>Chat Admin</strong>
          <button class="chat-close" aria-label="Tutup">×</button>
        </header>
        <div class="chat-body"></div>
        <form class="chat-form">
          <input type="text" placeholder="Tulis pesan..." required />
          <button type="submit">Kirim</button>
        </form>
      </aside>
    `;
    document.body.append(...root.children);
    fab = document.querySelector('.chat-fab');
    badge = fab.querySelector('.chat-fab__badge');
    panel = document.querySelector('.chat-panel');
    body = panel.querySelector('.chat-body');
    form = panel.querySelector('.chat-form');
    input = form.querySelector('input');
  }

  function open() { panel.classList.add('open'); fab.classList.remove('pulsing'); hideBadge(); }
  function close() { panel.classList.remove('open'); }
  function toggle() { panel.classList.contains('open') ? close() : open(); }

  function appendMsg(from, text) {
    messages.push({ from, text, ts: Date.now() });
    const el = document.createElement('div');
    el.className = 'chat-msg ' + (from === 'me' ? 'me' : 'admin');
    const d = new Date();
    const hhmm = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    el.innerHTML = `${escapeHtml(text)}<span class="chat-msg__ts">${hhmm}</span>`;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function showBadge(n) { badge.textContent = n; badge.style.display = 'grid'; fab.classList.add('pulsing'); }
  function hideBadge() { badge.style.display = 'none'; }

  function scheduleAdminReply() {
    clearTimeout(adminReplyTimer);
    adminReplyTimer = setTimeout(() => {
      const reply = CANNED[Math.floor(Math.random() * CANNED.length)];
      appendMsg('admin', reply);
      if (!panel.classList.contains('open')) showBadge('1');
    }, 1500 + Math.random() * 1500);
  }

  function welcome() {
    Store.chat.sessionId(); // ensure exists
    appendMsg('admin', 'Halo! Ini chat langsung ke admin Pedesan. Ada pertanyaan?');
  }

  function mount() {
    if (document.querySelector('.chat-fab')) return; // already mounted
    render();
    fab.addEventListener('click', toggle);
    panel.querySelector('.chat-close').addEventListener('click', close);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const t = input.value.trim(); if (!t) return;
      appendMsg('me', t); input.value = ''; scheduleAdminReply();
    });
    welcome();
  }

  window.ChatWidget = { mount };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.ChatWidget.mount());
} else {
  window.ChatWidget.mount();
}
