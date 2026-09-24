/* PurpleBox site nav: dots-menu toggle + cart badge. Pairs with css/site-nav.css. */
(function () {
  function init() {
    var nav = document.querySelector('.pbnav');
    if (!nav || nav.dataset.pbnavReady) return;
    nav.dataset.pbnavReady = '1';
    var btn = nav.querySelector('.pbnav-toggle');
    var menu = nav.querySelector('.pbnav-menu');

    function setOpen(open) {
      if (!btn || !menu) return;
      menu.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    if (btn && menu) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        setOpen(!menu.classList.contains('is-open'));
      });
      menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(false);
      });
      document.addEventListener('click', function (e) {
        if (menu.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) {
          setOpen(false);
          btn.focus();
        }
      });
    }

    /* Cart count lives in localStorage; pages like store.html also update it live. */
    var badge = document.getElementById('shopCartBadge');
    if (badge) {
      try {
        var items = JSON.parse(localStorage.getItem('pbCartItems') || '[]');
        var count = Array.isArray(items)
          ? items.reduce(function (t, x) { return t + (Number(x.qty) || 0); }, 0)
          : 0;
        badge.textContent = String(count);
        badge.classList.toggle('has-items', count > 0);
      } catch (e) { /* storage blocked: leave the badge hidden */ }
    }
  }

  /* templates/layout-loader.js calls this again after injecting templates/header.html */
  window.pbnavInit = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
