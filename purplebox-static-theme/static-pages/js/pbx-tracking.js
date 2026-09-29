/**
 * PurpleBox Full Behavioral Tracking
 * Fires events to both GA4 (gtag) and GTM (dataLayer).
 *
 * Usage: include this script at the bottom of any page, then call:
 *   window.PBXTracking.init({ pageName: 'Homepage', sections: [...] });
 *
 * sections is an array of { sel: '.css-selector', name: 'event_name' }
 */
(function () {
  'use strict';

  var DL = window.dataLayer = window.dataLayer || [];
  var GA = typeof window.gtag === 'function' ? window.gtag : function () {};
  var sessionStart = Date.now();
  var maxScroll = 0;
  var scrollMilestones = {};
  var sectionsSeen = {};
  var formState = { started: false, fields: {}, startTime: 0 };
  var clickLog = [];
  var idleTimer = null;
  var idleStart = 0;
  var totalIdleMs = 0;
  var IDLE_THRESHOLD = 30000;
  var PAGE = '';
  var formSubmitted = false;

  // ── Local Session Storage (for analytics dashboard) ──
  var STORE_KEY = 'pbx_analytics_sessions';
  var MAX_SESSIONS = 50;
  var sessionEvents = [];

  function saveSession() {
    try {
      var sessions = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      // Find or create current session
      var sid = window._pbxSessionId;
      var existing = -1;
      for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].id === sid) { existing = i; break; }
      }
      var sessionObj = {
        id: sid,
        pageName: PAGE,
        startedAt: sessionStart,
        events: sessionEvents
      };
      if (existing > -1) {
        sessions[existing] = sessionObj;
      } else {
        sessions.push(sessionObj);
      }
      // Keep only last N sessions
      if (sessions.length > MAX_SESSIONS) sessions = sessions.slice(-MAX_SESSIONS);
      localStorage.setItem(STORE_KEY, JSON.stringify(sessions));
    } catch (e) { /* localStorage full or unavailable */ }
  }

  function ts() { return Math.round((Date.now() - sessionStart) / 1000); }

  function push(event, params) {
    var data = Object.assign({ event: event, page_name: PAGE, timestamp_sec: ts() }, params || {});
    DL.push(data);
    GA('event', event, params || {});
    // Record for local dashboard
    sessionEvents.push(data);
  }

  // ── Scroll Depth ──
  function initScroll() {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        if (docH <= 0) { ticking = false; return; }
        var pct = Math.round((window.scrollY / docH) * 100);
        if (pct > maxScroll) maxScroll = pct;
        [25, 50, 75, 100].forEach(function (m) {
          if (pct >= m && !scrollMilestones[m]) {
            scrollMilestones[m] = true;
            push('lp_scroll_depth', { depth: m, time_sec: ts() });
          }
        });
        ticking = false;
      });
    }, { passive: true });
  }

  // ── Section Visibility ──
  function initSections(sections) {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var name = entry.target.getAttribute('data-track-section');
        if (name && !sectionsSeen[name]) {
          sectionsSeen[name] = ts();
          push('lp_section_view', { section: name, time_sec: ts() });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(function (s) {
      var el = document.querySelector(s.sel);
      if (el) {
        el.setAttribute('data-track-section', s.name);
        obs.observe(el);
      }
    });
  }

  // ── Click Tracking ──
  function initClicks() {
    document.addEventListener('click', function (e) {
      var target = e.target.closest('a, button, [data-cta], .unit-card, .mobile-sticky a, .mobile-cta a, .ms-wa, .ms-quote');
      if (!target) return;

      var info = {
        tag: target.tagName,
        text: (target.textContent || '').trim().substring(0, 60),
        href: target.getAttribute('href') || '',
        classes: (target.className || '').toString().substring(0, 80),
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
        time_sec: ts()
      };

      var category = 'other';
      if (target.closest('.hero, .hero-section')) category = 'hero_cta';
      else if (target.closest('.unit-card, .choose-unit-section, .units-section')) category = 'unit_card';
      else if (target.closest('.lead-section, #get-quote, #leadForm')) category = 'form_area';
      else if (target.closest('.faq-section, .faq-list')) category = 'faq_toggle';
      else if (target.closest('.mobile-sticky, .mobile-cta')) category = 'mobile_sticky';
      else if (target.closest('.final-cta, .loc-card')) category = 'final_cta';
      else if (target.closest('.gallery-section, .gallery-scroll')) category = 'gallery';
      else if (target.closest('.pack-pro-section')) category = 'pack_pro';
      else if (target.closest('nav, .lp-nav, .site-nav')) category = 'navigation';

      if (info.href.indexOf('wa.me') > -1) category = 'whatsapp_click';
      if (info.href.indexOf('tel:') === 0) category = 'phone_click';

      info.category = category;
      clickLog.push(info);
      push('lp_click', info);
    }, true);
  }

  // ── Form Tracking ──
  function initForm() {
    var formEl = document.getElementById('reserveForm');
    if (!formEl) return;

    formEl.addEventListener('focusin', function () {
      if (!formState.started) {
        formState.started = true;
        formState.startTime = ts();
        push('lp_form_start', { time_sec: ts() });
      }
    });

    var trackField = function (e) {
      var field = e.target.name || e.target.id || 'unknown';
      if (!formState.fields[field]) {
        formState.fields[field] = ts();
        push('lp_form_field', { field: field, time_sec: ts() });
      }
    };
    formEl.addEventListener('change', trackField);
    formEl.addEventListener('input', trackField);

    formEl.addEventListener('submit', function () {
      formSubmitted = true;
      var duration = formState.startTime ? ts() - formState.startTime : 0;
      push('lp_form_submit', {
        time_sec: ts(),
        form_duration_sec: duration,
        fields_completed: Object.keys(formState.fields).length
      });
    });
  }

  // ── Idle Detection ──
  function initIdle() {
    function resetIdle() {
      if (idleStart > 0) {
        totalIdleMs += Date.now() - idleStart;
        idleStart = 0;
      }
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        idleStart = Date.now();
        push('lp_idle_start', { time_sec: ts(), after_sec: IDLE_THRESHOLD / 1000 });
      }, IDLE_THRESHOLD);
    }
    ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(function (evt) {
      window.addEventListener(evt, resetIdle, { passive: true });
    });
    resetIdle();
  }

  // ── Tab Visibility ──
  function initVisibility() {
    var hiddenAt = 0;
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        hiddenAt = Date.now();
        push('lp_tab_hidden', { time_sec: ts() });
      } else {
        var awayMs = hiddenAt ? Date.now() - hiddenAt : 0;
        push('lp_tab_visible', { time_sec: ts(), away_sec: Math.round(awayMs / 1000) });
        hiddenAt = 0;
      }
    });
  }

  // ── Exit Intent ──
  function initExitIntent() {
    var fired = false;
    document.addEventListener('mouseout', function (e) {
      if (fired) return;
      if (e.clientY <= 0 && e.relatedTarget === null) {
        fired = true;
        push('lp_exit_intent', { time_sec: ts(), max_scroll: maxScroll });
      }
    });
  }

  // ── Session End (beacon) ──
  function initSessionEnd() {
    function sendSummary() {
      if (idleStart > 0) totalIdleMs += Date.now() - idleStart;
      var totalSec = ts();
      var engagedSec = Math.max(0, totalSec - Math.round(totalIdleMs / 1000));

      var summary = {
        event: 'lp_session_end',
        page_name: PAGE,
        total_time_sec: totalSec,
        engaged_time_sec: engagedSec,
        idle_time_sec: totalSec - engagedSec,
        max_scroll_pct: maxScroll,
        sections_viewed: Object.keys(sectionsSeen).join(','),
        sections_count: Object.keys(sectionsSeen).length,
        total_clicks: clickLog.length,
        form_started: formState.started,
        form_submitted: formSubmitted,
        form_abandoned: formState.started && !formSubmitted,
        form_fields_touched: Object.keys(formState.fields).join(',')
      };

      DL.push(summary);

      if (navigator.sendBeacon && window.PBX_GA4_ID) {
        var p = new URLSearchParams();
        p.set('v', '2');
        p.set('tid', window.PBX_GA4_ID);
        p.set('en', 'lp_session_end');
        Object.keys(summary).forEach(function (k) {
          if (k !== 'event') p.set('ep.' + k, String(summary[k]));
        });
        navigator.sendBeacon('https://www.google-analytics.com/g/collect?' + p.toString());
      }
    }
    window.addEventListener('beforeunload', function () { sendSummary(); saveSession(); });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') { sendSummary(); saveSession(); }
    });
    // Also save periodically (every 10s) in case of crash
    setInterval(saveSession, 10000);
  }

  // ── Unit Card Hover ──
  function initUnitHover() {
    document.querySelectorAll('.unit-card, .book-card').forEach(function (card) {
      var hoverStart = 0;
      card.addEventListener('mouseenter', function () { hoverStart = Date.now(); });
      card.addEventListener('mouseleave', function () {
        if (hoverStart) {
          var dur = Math.round((Date.now() - hoverStart) / 1000);
          if (dur >= 1) {
            var size = (card.querySelector('h3, h4, .unit-card-size, .book-size') || {}).textContent || '';
            push('lp_unit_hover', { unit: size.trim(), hover_sec: dur, time_sec: ts() });
          }
          hoverStart = 0;
        }
      });
    });
  }

  // ── FAQ Toggle ──
  function initFaq() {
    document.querySelectorAll('.faq-q, .faq-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        push('lp_faq_toggle', { question: (btn.textContent || '').trim().substring(0, 80), time_sec: ts() });
      });
    });
  }

  // ── Gallery Scroll ──
  function initGallery() {
    var el = document.querySelector('.gallery-grid, .gallery-scroll, .pack-pro-scroller');
    if (!el) return;
    var tracked = false;
    el.addEventListener('scroll', function () {
      if (!tracked) { tracked = true; push('lp_gallery_scroll', { time_sec: ts() }); }
    }, { passive: true });
  }

  // ── Dev Console Logging ──
  function initDevLog() {
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
    var origPush = DL.push.bind(DL);
    DL.push = function (obj) {
      if (obj && obj.event && String(obj.event).indexOf('lp_') === 0) {
        console.log('%c[Track] ' + obj.event, 'color:#3b82f6;font-weight:700', obj);
      }
      return origPush(obj);
    };
  }

  // ── Public Init ──
  window.PBXTracking = {
    init: function (config) {
      PAGE = config.pageName || document.title;
      window._pbxSessionId = PAGE + '_' + sessionStart + '_' + Math.random().toString(36).substring(2, 8);
      push('lp_page_view', { referrer: document.referrer || 'direct', url: location.href });
      initScroll();
      initSections(config.sections || []);
      initClicks();
      initForm();
      initIdle();
      initVisibility();
      initExitIntent();
      initSessionEnd();
      initUnitHover();
      initFaq();
      initGallery();
      initDevLog();
    }
  };
})();
