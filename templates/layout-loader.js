(function () {
  /* ─── Template loader (for pages still using data-site-header / data-site-footer) ─── */
  async function loadTemplate(selector, path) {
    var node = document.querySelector(selector);
    if (!node) return;
    try {
      var resp = await fetch(path, { cache: 'no-store' });
      if (!resp.ok) return;
      node.innerHTML = await resp.text();
    } catch (e) {
      console.warn('Template load failed:', path, e);
    }
  }

  /* ─── Mobile menu toggle ─── */
  window.toggleMobileMenu = function toggleMobileMenu() {
    var menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('open');
  };

  /* ─── Global cart badge sync ───
     Reads cart count from localStorage and updates the header badge
     on every page, not just store.html */
  function syncGlobalCartBadge() {
    var badge = document.getElementById('shopCartBadge');
    if (!badge) return;
    try {
      var count = 0;
      var items = JSON.parse(localStorage.getItem('pbCartItems') || '[]');
      if (Array.isArray(items)) {
        count = items.reduce(function (t, x) { return t + (Number(x.qty) || 0); }, 0);
      }
      badge.textContent = String(count);
      if (count > 0) {
        badge.classList.add('has-items');
      } else {
        badge.classList.remove('has-items');
      }
    } catch (e) {
      badge.textContent = '0';
      badge.classList.remove('has-items');
    }
  }

  /* ─── Init ─── */
  document.addEventListener('DOMContentLoaded', async function () {
    await loadTemplate('[data-site-header]', 'templates/header.html');
    await loadTemplate('[data-site-footer]', 'templates/footer.html');
    /* Sync badge after templates loaded (or immediately if inlined) */
    syncGlobalCartBadge();
  });

  /* Also sync immediately in case DOM is already ready */
  if (document.readyState !== 'loading') {
    setTimeout(syncGlobalCartBadge, 50);
  }
})();
