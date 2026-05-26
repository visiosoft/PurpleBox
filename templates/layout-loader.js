(function () {
  /* ─── Template loader (for pages still using data-site-header / data-site-footer) ─── */
  function fetchTemplateViaIframe(path) {
    return new Promise(function (resolve) {
      try {
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.setAttribute('aria-hidden', 'true');

        var cleanedPath = String(path || '').replace(/^\/+/, '');
        iframe.src = cleanedPath;

        var done = false;
        function finish(value) {
          if (done) return;
          done = true;
          try { iframe.remove(); } catch (e) { }
          resolve(value || '');
        }

        iframe.onload = function () {
          try {
            var doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
            finish(doc && doc.body ? doc.body.innerHTML : '');
          } catch (e) {
            finish('');
          }
        };

        iframe.onerror = function () {
          finish('');
        };

        document.body.appendChild(iframe);

        setTimeout(function () {
          finish('');
        }, 2500);
      } catch (e) {
        resolve('');
      }
    });
  }

  async function fetchTemplate(pathOrPaths) {
    var paths = Array.isArray(pathOrPaths) ? pathOrPaths : [pathOrPaths];

    for (var i = 0; i < paths.length; i += 1) {
      var path = paths[i];
      if (!path) continue;

      try {
        var resp = await fetch(path, { cache: 'no-store' });
        if (!resp.ok) continue;
        return await resp.text();
      } catch (e) {
        // Try the next candidate path.
      }

      if (window.location && window.location.protocol === 'file:') {
        var iframeHtml = await fetchTemplateViaIframe(path);
        if (iframeHtml) {
          return iframeHtml;
        }
      }
    }

    return '';
  }

  async function loadTemplate(selector, path) {
    var node = document.querySelector(selector);
    if (!node) return;
    try {
      var html = await fetchTemplate([path, '/' + String(path || '').replace(/^\/+/, '')]);
      if (!html) return;
      node.innerHTML = html;
    } catch (e) {
      console.warn('Template load failed:', path, e);
    }
  }

  async function loadFooterTemplate(path) {
    var placeholder = document.querySelector('[data-site-footer]');
    var existingFooter = document.querySelector('footer.pbx-footer-shell');
    if (!placeholder && !existingFooter) return;

    try {
      var html = await fetchTemplate([path, '/' + String(path || '').replace(/^\/+/, '')]);
      if (!html) return;

      if (placeholder) {
        placeholder.outerHTML = html;
        return;
      }

      existingFooter.outerHTML = html;
    } catch (e) {
      console.warn('Footer template load failed:', path, e);
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
    await loadFooterTemplate('templates/footer.html');
    /* Sync badge after templates loaded (or immediately if inlined) */
    syncGlobalCartBadge();
  });

  /* Also sync immediately in case DOM is already ready */
  if (document.readyState !== 'loading') {
    setTimeout(syncGlobalCartBadge, 50);
  }
})();
