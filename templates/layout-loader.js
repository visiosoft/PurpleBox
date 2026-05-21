(function () {
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

  window.toggleMobileMenu = function toggleMobileMenu() {
    var menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('open');
  };

  document.addEventListener('DOMContentLoaded', async function () {
    await loadTemplate('[data-site-header]', 'templates/header.html');
    await loadTemplate('[data-site-footer]', 'templates/footer.html');
  });
})();
