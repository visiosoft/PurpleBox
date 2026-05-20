(function () {
  function getParams() {
    return new URLSearchParams(window.location.search);
  }

  function fmtAED(n) {
    return 'AED ' + Number(n || 0).toLocaleString('en-AE');
  }

  function fmtInputDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }

  function addDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }

  function toYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function setupSegmented() {
    document.querySelectorAll('[data-segmented]').forEach(function (group) {
      const target = document.getElementById(group.getAttribute('data-target'));
      const buttons = group.querySelectorAll('button[data-value]');
      function activate(btn) {
        buttons.forEach(function (b) {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-checked', active ? 'true' : 'false');
          b.setAttribute('tabindex', active ? '0' : '-1');
        });
        if (target) target.value = btn.getAttribute('data-value');
      }
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () { activate(btn); });
      });
      const initial = Array.from(buttons).find(function (b) {
        return target && b.getAttribute('data-value') === target.value;
      }) || buttons[0];
      if (initial) activate(initial);
    });
  }

  function setupDateChips() {
    const dateInput = document.getElementById('moveInDate');
    const chips = document.querySelectorAll('[data-date-chip]');
    if (!dateInput || !chips.length) return;
    const map = {
      today: addDays(0),
      tomorrow: addDays(1),
      week: addDays(7)
    };
    chips.forEach(function (chip) {
      const key = chip.getAttribute('data-date-chip');
      const d = map[key];
      if (!d) return;
      chip.setAttribute('data-date-value', toYMD(d));
      const mini = chip.querySelector('small');
      if (mini) {
        mini.textContent = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      }
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        dateInput.value = chip.getAttribute('data-date-value');
      });
    });
  }

  function fillFromQuery() {
    const p = getParams();
    ['fullName', 'mobile', 'emirate', 'email', 'storingFor', 'moveInDate', 'unitLabel', 'unitSize', 'monthlyRent', 'promoCode'].forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      const q = p.get(id);
      if (q) el.value = q;
    });
  }

  function setupStep1() {
    fillFromQuery();
    setupSegmented();
    setupDateChips();
    const form = document.getElementById('step1Form');
    const next = document.getElementById('step1Next');
    if (!form || !next) return;

    function validate() {
      const name = (document.getElementById('fullName').value || '').trim().length > 2;
      const mobile = /^\+?[0-9\s-]{8,}$/.test((document.getElementById('mobile').value || '').trim());
      const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((document.getElementById('email').value || '').trim());
      next.disabled = !(name && mobile && email);
    }

    ['input', 'change'].forEach(function (ev) {
      form.addEventListener(ev, validate);
    });
    validate();

    form.addEventListener('submit', function () {
      localStorage.setItem('pbx_step1', JSON.stringify({
        fullName: document.getElementById('fullName').value,
        mobile: document.getElementById('mobile').value,
        emirate: document.getElementById('emirate').value,
        email: document.getElementById('email').value,
        storingFor: document.getElementById('storingFor').value,
        moveInDate: document.getElementById('moveInDate').value,
        unitLabel: document.getElementById('unitLabel').value,
        unitSize: document.getElementById('unitSize').value,
        monthlyRent: document.getElementById('monthlyRent').value,
        promoCode: document.getElementById('promoCode').value
      }));
    });
  }

  const PRODUCTS = [
    { id: 'medium_box', name: 'Medium Box', spec: '50×40×40 cm', price: 12 },
    { id: 'tape_roll', name: 'Tape Roll', spec: '50 m × 48 mm', price: 9 },
    { id: 'padlock', name: 'Padlock', spec: '50 mm steel', price: 35 },
    { id: 'bubble_wrap', name: 'Bubble Wrap', spec: '10 m roll', price: 25 },
    { id: 'wardrobe_box', name: 'Wardrobe Box', spec: 'With rail', price: 38 },
    { id: 'large_box', name: 'Large Box', spec: '60×45×45 cm', price: 16 }
  ];

  function setupStep2() {
    const form = document.getElementById('step2Form');
    if (!form) return;
    const p = getParams();

    const fromStorage = localStorage.getItem('pbx_step1');
    if (!p.get('fullName') && fromStorage) {
      const data = JSON.parse(fromStorage);
      Object.keys(data).forEach(function (k) {
        const hidden = form.querySelector('input[name="' + k + '"]');
        if (hidden) hidden.value = data[k] || '';
      });
    } else {
      ['fullName', 'mobile', 'emirate', 'email', 'storingFor', 'moveInDate', 'unitLabel', 'unitSize', 'monthlyRent', 'promoCode'].forEach(function (k) {
        const hidden = form.querySelector('input[name="' + k + '"]');
        if (hidden) hidden.value = p.get(k) || '';
      });
    }

    const rent = Number((p.get('monthlyRent') || form.querySelector('input[name="monthlyRent"]').value || 499));
    const discount = Math.round(rent * 0.2);

    function calc() {
      let qty = 0;
      let supplies = 0;
      PRODUCTS.forEach(function (item) {
        const input = form.querySelector('input[name="qty_' + item.id + '"]');
        const q = Number(input ? input.value : 0);
        qty += q;
        supplies += q * item.price;

        const card = form.querySelector('[data-item="' + item.id + '"]');
        if (card) {
          card.classList.toggle('selected', q > 0);
          const badge = card.querySelector('.qty-badge');
          if (badge) badge.textContent = q > 0 ? 'x' + q : '';
          const stepper = card.querySelector('.stepper');
          const add = card.querySelector('.add-btn');
          if (stepper && add) {
            stepper.style.display = q > 0 ? 'inline-flex' : 'none';
            add.style.display = q > 0 ? 'none' : 'inline-flex';
          }
          const num = card.querySelector('[data-qty]');
          if (num) num.textContent = String(q);
        }
      });
      const due = rent - discount + supplies;

      const fields = {
        sumRent: fmtAED(rent),
        sumDisc: '-'+fmtAED(discount),
        sumSupplies: fmtAED(supplies),
        sumDue: fmtAED(due),
        runningTotal: fmtAED(due),
        selChip: fmtAED(due) + ' Due today',
        suppliesCount: qty + ' items'
      };
      Object.keys(fields).forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.textContent = fields[id];
      });
      const dueField = form.querySelector('input[name="dueToday"]');
      const supplyField = form.querySelector('input[name="suppliesTotal"]');
      if (dueField) dueField.value = String(due);
      if (supplyField) supplyField.value = String(supplies);
    }

    form.querySelectorAll('[data-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-add');
        const input = form.querySelector('input[name="qty_' + id + '"]');
        if (!input) return;
        input.value = String(Number(input.value || 0) + 1);
        calc();
      });
    });

    form.querySelectorAll('[data-minus],[data-plus]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-minus') || btn.getAttribute('data-plus');
        const input = form.querySelector('input[name="qty_' + id + '"]');
        if (!input) return;
        const curr = Number(input.value || 0);
        if (btn.hasAttribute('data-minus')) {
          input.value = String(Math.max(0, curr - 1));
        } else {
          input.value = String(curr + 1);
        }
        calc();
      });
    });

    calc();
  }

  function setupStep3() {
    const p = getParams();
    const st1 = localStorage.getItem('pbx_step1');
    const fallback = st1 ? JSON.parse(st1) : {};

    function pick(key, def) {
      return p.get(key) || fallback[key] || def;
    }

    const data = {
      fullName: pick('fullName', 'Sara Al Marri'),
      mobile: pick('mobile', '+971 50 234 5678'),
      email: pick('email', 'sara.almarri@example.ae'),
      emirate: pick('emirate', 'Dubai'),
      storingFor: pick('storingFor', 'Personal'),
      moveInDate: pick('moveInDate', toYMD(addDays(7))),
      unitSize: pick('unitSize', '75 sq ft (M)'),
      unitLabel: pick('unitLabel', 'SARA · M'),
      monthlyRent: Number(pick('monthlyRent', 499)),
      promoCode: pick('promoCode', 'FIRST20')
    };

    const qty = {
      medium_box: Number(p.get('qty_medium_box') || 0),
      tape_roll: Number(p.get('qty_tape_roll') || 0),
      padlock: Number(p.get('qty_padlock') || 0),
      bubble_wrap: Number(p.get('qty_bubble_wrap') || 0),
      wardrobe_box: Number(p.get('qty_wardrobe_box') || 0),
      large_box: Number(p.get('qty_large_box') || 0)
    };

    let suppliesTotal = Number(p.get('suppliesTotal') || 0);
    if (!suppliesTotal) {
      PRODUCTS.forEach(function (it) {
        suppliesTotal += (qty[it.id] || 0) * it.price;
      });
    }

    const discount = Math.round(data.monthlyRent * 0.2);
    const due = Number(p.get('dueToday') || (data.monthlyRent - discount + suppliesTotal));

    const supplyLines = PRODUCTS.filter(function (it) { return qty[it.id] > 0; }).map(function (it) {
      return '• ' + it.name + ' × ' + qty[it.id] + ' — ' + fmtAED(it.price * qty[it.id]);
    });

    const supplyCount = PRODUCTS.reduce(function (sum, it) { return sum + (qty[it.id] || 0); }, 0);

    const text = [
      'Hi purplebox 👋',
      '',
      "I'd like to reserve a storage unit:",
      '',
      '📦 UNIT',
      '• Size: ' + data.unitSize,
      '• Move-in: ' + fmtInputDate(data.moveInDate),
      '• Facility: purplebox Al Quoz',
      '',
      '➕ SUPPLIES',
      supplyLines.length ? supplyLines.join('\n') : '• No supplies selected',
      '',
      '💰 PRICING',
      '• Monthly rent: ' + fmtAED(data.monthlyRent),
      '• 20% off first month: -' + fmtAED(discount),
      '• Supplies: ' + fmtAED(suppliesTotal),
      '• Due today: ' + fmtAED(due),
      '• Promo: ' + data.promoCode,
      '',
      '👤 MY DETAILS',
      '• Name: ' + data.fullName,
      '• Mobile: ' + data.mobile,
      '• Email: ' + data.email,
      '• Emirate: ' + data.emirate,
      '• Storing for: ' + data.storingFor,
      '',
      'Please confirm availability and the next steps. Thanks!'
    ].join('\n');

    const fieldMap = {
      rName: data.fullName,
      rMobile: data.mobile,
      rEmail: data.email,
      rStore: data.storingFor,
      rUnit: data.unitSize,
      rMove: fmtInputDate(data.moveInDate),
      rSupplies: supplyCount + ' items · ' + fmtAED(suppliesTotal),
      rPromo: data.promoCode,
      dueBig: fmtAED(due),
      runningTotal: fmtAED(due),
      selChip: fmtAED(due) + ' Due today',
      summaryText: text
    };

    Object.keys(fieldMap).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        if (id === 'summaryText') el.value = fieldMap[id];
        else el.textContent = fieldMap[id];
      }
    });

    const wa = document.getElementById('waLink');
    const mail = document.getElementById('mailLink');
    const encoded = encodeURIComponent(text);
    if (wa) wa.href = 'https://wa.me/97140000000?text=' + encoded;
    if (mail) mail.href = 'mailto:bookings@purplebox.ae?subject=' + encodeURIComponent('Storage reservation — ' + data.unitSize) + '&body=' + encoded;
  }

  function init() {
    const step = document.body.getAttribute('data-step');
    if (step === '1') setupStep1();
    if (step === '2') setupStep2();
    if (step === '3') setupStep3();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
