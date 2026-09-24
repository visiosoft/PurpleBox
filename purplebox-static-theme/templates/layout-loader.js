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
        }, 450);
      } catch (e) {
        resolve('');
      }
    });
  }

  function getTemplateCandidates(fileName) {
    var list = [];
    var script = document.currentScript || document.querySelector('script[src*="layout-loader.js"]');
    var src = script && script.getAttribute('src') ? script.getAttribute('src') : '';

    if (src) {
      var scriptDir = src.replace(/[^\/]+$/, '');
      list.push(scriptDir + fileName);
      list.push(scriptDir + '../../templates/' + fileName);
      list.push(scriptDir + '../templates/' + fileName);
    }

    list.push('templates/' + fileName);
    list.push('../templates/' + fileName);
    list.push('../../templates/' + fileName);

    // De-duplicate while preserving order.
    var seen = {};
    return list.filter(function (item) {
      if (!item || seen[item]) return false;
      seen[item] = true;
      return true;
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

  async function loadTemplate(selector, pathOrPaths) {
    var node = document.querySelector(selector);
    if (!node) return;
    try {
      var paths = Array.isArray(pathOrPaths) ? pathOrPaths : [pathOrPaths];
      var html = await fetchTemplate(paths);
      if (!html) return;
      node.innerHTML = html;
    } catch (e) {
      console.warn('Template load failed:', pathOrPaths, e);
    }
  }

  async function loadFooterTemplate(pathOrPaths) {
    var placeholder = document.querySelector('[data-site-footer]');
    var existingFooter = document.querySelector('footer.pbx-footer-shell');
    if (!placeholder && !existingFooter) return;

    try {
      var paths = Array.isArray(pathOrPaths) ? pathOrPaths : [pathOrPaths];
      var html = await fetchTemplate(paths);
      if (!html) return;

      if (placeholder) {
        placeholder.outerHTML = html;
        return;
      }

      existingFooter.outerHTML = html;
    } catch (e) {
      console.warn('Footer template load failed:', pathOrPaths, e);
    }
  }

  function applyHeaderFallback() {
    var placeholder = document.querySelector('[data-site-header]');
    if (!placeholder) return;
    if (String(placeholder.innerHTML || '').trim() !== '') return;

    /* Minimal copy of templates/header.html, used only if that file can't be fetched */
    placeholder.innerHTML = [
      '<nav class="pbnav" aria-label="Main">',
      '  <div class="pbnav-card">',
      '    <a href="index.html" class="pbnav-logo" aria-label="PurpleBox Storage home"><img src="images/logo-1.svg" alt="PurpleBox Storage" width="402" height="130" /></a>',
      '    <div class="pbnav-links">',
      '      <a href="index.html">Home</a><a href="book-unit.html">Reserve Unit</a><a href="store.html">Shop Now</a>',
      '      <a href="packing-moving.html">Packing &amp; Moving</a><a href="community/">Blog</a><a href="contact.html">Contact</a>',
      '    </div>',
      '    <div class="pbnav-actions">',
      '      <a href="tel:+971542249946" class="pbnav-icon pbnav-phone" aria-label="Call +971 54 224 9946">&#9990;</a>',
      '      <a href="index.html#leadForm" class="pbnav-quote">Get a Quote</a>',
      '      <button type="button" class="pbnav-toggle" aria-label="Open menu" aria-controls="mobileMenu" aria-expanded="false">&#8942;</button>',
      '    </div>',
      '  </div>',
      '  <div class="pbnav-menu" id="mobileMenu">',
      '    <a href="index.html">Home</a><a href="book-unit.html">Reserve Unit</a><a href="store.html">Shop Now</a>',
      '    <a href="packing-moving.html">Packing &amp; Moving</a><a href="community/">Blog</a><a href="contact.html">Contact</a>',
      '  </div>',
      '</nav>'
    ].join('');
  }

  /* Pages that pull the nav in via [data-site-header] still need its stylesheet and script. */
  function ensureSiteNavAssets() {
    if (!document.querySelector('[data-site-header] .pbnav')) return;
    if (!document.querySelector('link[href$="site-nav.css"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'css/site-nav.css';
      document.head.appendChild(link);
    }
    if (window.pbnavInit) {
      window.pbnavInit();
    } else if (!document.querySelector('script[src$="site-nav.js"]')) {
      var script = document.createElement('script');
      script.src = 'js/site-nav.js';
      document.head.appendChild(script);
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
  async function initTemplates() {
    await Promise.all([
      loadTemplate('[data-site-header]', getTemplateCandidates('header.html')),
      loadFooterTemplate(getTemplateCandidates('footer.html'))
    ]);
    applyHeaderFallback();
    ensureSiteNavAssets();
    /* Sync badge after templates loaded (or immediately if inlined) */
    syncGlobalCartBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTemplates);
  } else {
    initTemplates();
  }

  /* Also sync immediately in case DOM is already ready */
  if (document.readyState !== 'loading') {
    setTimeout(syncGlobalCartBadge, 50);
  }
})();
