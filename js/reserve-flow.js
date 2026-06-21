(function () {
    window.toggleMobileMenu = function () {
        var menu = document.getElementById('mobileMenu');
        if (menu) menu.classList.toggle('open');
    };

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

    function getRentalMonths(moveInDate, moveOutDate) {
        if (!moveInDate || !moveOutDate) return 1;
        const start = new Date(moveInDate + 'T00:00:00');
        const end = new Date(moveOutDate + 'T00:00:00');
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return 1;
        const dayDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return Math.max(1, Math.ceil(dayDiff / 30));
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
                dateInput.dispatchEvent(new Event('input', { bubbles: true }));
            });
        });
    }

    function fillFromQuery() {
        const p = getParams();
        ['fullName', 'mobile', 'emirate', 'email', 'storingFor', 'moveInDate', 'moveOutDate', 'unitLabel', 'unitSize', 'monthlyRent'].forEach(function (id) {
            const q = p.get(id);
            if (!q) return;

            const byId = document.getElementById(id);
            if (byId) byId.value = q;

            document.querySelectorAll('[name="' + id + '"]').forEach(function (el) {
                if (el && typeof el.value !== 'undefined') {
                    el.value = q;
                }
            });
        });
    }

    function getSelectedSizeLabel(unitLabel, unitSize) {
        const labelText = String(unitLabel || '').toLowerCase();
        const sizeTextRaw = String(unitSize || '').toLowerCase();
        if (labelText.includes('multi') || sizeTextRaw.includes('+') || sizeTextRaw.includes('|') || sizeTextRaw.includes(',')) {
            return 'MULTI';
        }

        const fromLabel = String(unitLabel || '').match(/\b(XXL|XL|XS|SS|S|M|L)\b/i);
        if (fromLabel) return fromLabel[1].toUpperCase();

        const sizeText = sizeTextRaw;
        if (sizeText.includes('200')) return 'XXL';
        if (sizeText.includes('150')) return 'XL';
        if (sizeText.includes('100')) return 'L';
        if (sizeText.includes('50')) return 'S';
        if (sizeText.includes('35')) return 'M';
        if (sizeText.includes('25')) return 'SS';
        if (sizeText.includes('10')) return 'XS';
        return 'M';
    }

    function syncStep1Summary() {
        const monthlyRent = Number(
            (document.getElementById('monthlyRent') && document.getElementById('monthlyRent').value) ||
            (document.querySelector('input[name="monthlyRent"]') && document.querySelector('input[name="monthlyRent"]').value) ||
            700
        );
        const unitLabel =
            (document.getElementById('unitLabel') && document.getElementById('unitLabel').value) ||
            (document.querySelector('input[name="unitLabel"]') && document.querySelector('input[name="unitLabel"]').value) ||
            'SARA - M';
        const unitSize =
            (document.getElementById('unitSize') && document.getElementById('unitSize').value) ||
            (document.querySelector('input[name="unitSize"]') && document.querySelector('input[name="unitSize"]').value) ||
            '35 sq ft (M)';
        const moveInDate =
            (document.getElementById('moveInDate') && document.getElementById('moveInDate').value) ||
            (Array.from(document.querySelectorAll('input[name="moveInDate"]')).map(function (el) { return el.value; }).find(Boolean)) ||
            '';
        const moveOutDate =
            (document.getElementById('moveOutDate') && document.getElementById('moveOutDate').value) ||
            (Array.from(document.querySelectorAll('input[name="moveOutDate"]')).map(function (el) { return el.value; }).find(Boolean)) ||
            '';

        const selectedLabel = getSelectedSizeLabel(unitLabel, unitSize);
        const dueToday = monthlyRent;
        const rentalMonths = getRentalMonths(moveInDate, moveOutDate);
        const remainingMonths = Math.max(0, rentalMonths - 1);
        const remainingTotal = remainingMonths * monthlyRent;
        const estimatedTotal = dueToday + remainingTotal;

        document.querySelectorAll('.state-chip').forEach(function (chip) {
            chip.textContent = fmtAED(dueToday) + ' / month - ' + selectedLabel + ' Selected';
        });

        document.querySelectorAll('.total-val').forEach(function (el) {
            if (rentalMonths > 1) {
                el.textContent = fmtAED(estimatedTotal) + ' total for ' + rentalMonths + ' months';
            } else {
                el.textContent = fmtAED(dueToday) + ' first month total';
            }
        });

        const breakdownHtml = rentalMonths > 1
            ? [
                '<span class="line">First month total: ' + fmtAED(dueToday) + '</span>',
                '<span class="line">Remaining months total: ' + fmtAED(remainingTotal) + '</span>',
                '<span class="line total">Total for ' + rentalMonths + ' months: ' + fmtAED(estimatedTotal) + '</span>'
            ].join('')
            : [
                '<span class="line">Monthly rent: ' + fmtAED(monthlyRent) + '</span>',
                '<span class="line total">Month 1 total: ' + fmtAED(dueToday) + '</span>'
            ].join('');

        document.querySelectorAll('.total-breakdown').forEach(function (el) {
            el.innerHTML = breakdownHtml;
        });
    }

    function setupStep1() {
        fillFromQuery();
        syncStep1Summary();
        setupSegmented();
        setupDateChips();
        const form = document.getElementById('step1Form');
        const desktopForm = document.getElementById('step1FormDesktop');
        const next = document.getElementById('step1Next');
        if (!form || !next) return;
        const moveInDateInput = document.getElementById('moveInDate');
        const moveOutDateInput = document.getElementById('moveOutDate');
        const moveInDateInputDesktop = document.getElementById('moveInDateD');
        const moveOutDateInputDesktop = document.getElementById('moveOutDateD');

        function bindMoveDatePair(inInput, outInput) {
            if (!inInput || !outInput) return;
            const syncMoveOutMin = function () {
                if (!inInput.value) return;
                const minOut = toYMD(addDays(1));
                const start = new Date(inInput.value + 'T00:00:00');
                if (!Number.isNaN(start.getTime())) {
                    const nextDay = new Date(start);
                    nextDay.setDate(nextDay.getDate() + 1);
                    outInput.min = toYMD(nextDay);
                    if (outInput.value && outInput.value <= inInput.value) {
                        outInput.value = '';
                    }
                } else {
                    outInput.min = minOut;
                }
            };

            inInput.addEventListener('change', function () {
                syncMoveOutMin();
                syncStep1Summary();
            });
            outInput.addEventListener('change', syncStep1Summary);
            syncMoveOutMin();
        }

        bindMoveDatePair(moveInDateInput, moveOutDateInput);
        bindMoveDatePair(moveInDateInputDesktop, moveOutDateInputDesktop);

        function firstValue(selectors) {
            for (var i = 0; i < selectors.length; i += 1) {
                var el = document.querySelector(selectors[i]);
                var value = el && typeof el.value !== 'undefined' ? String(el.value).trim() : '';
                if (value) return value;
            }
            return '';
        }

        function validate() {
            const nameVal = firstValue(['#fullName', '#fullNameD', 'input[name="fullName"]']);
            const mobileVal = firstValue(['#mobile', '#mobileD', 'input[name="mobile"]']);
            const emailVal = firstValue(['#email', '#emailD', 'input[name="email"]']);
            const moveInVal = firstValue(['#moveInDate', '#moveInDateD', 'input[name="moveInDate"]']);
            const moveOutVal = firstValue(['#moveOutDate', '#moveOutDateD', 'input[name="moveOutDate"]']);

            const name = nameVal.length > 2;
            const mobile = /^\+?[0-9\s-]{8,}$/.test(mobileVal);
            const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
            const dates = !!moveInVal && !!moveOutVal;
            next.disabled = !(name && mobile && email && dates);
        }

        ['input', 'change'].forEach(function (ev) {
            form.addEventListener(ev, validate);
        });
        if (desktopForm) {
            ['input', 'change'].forEach(function (ev) {
                desktopForm.addEventListener(ev, validate);
            });
        }
        validate();

        form.addEventListener('submit', function () {
            localStorage.setItem('pbx_step1', JSON.stringify({
                fullName: document.getElementById('fullName').value,
                mobile: document.getElementById('mobile').value,
                emirate: document.getElementById('emirate').value,
                email: document.getElementById('email').value,
                storingFor: document.getElementById('storingFor').value,
                moveInDate: document.getElementById('moveInDate').value,
                moveOutDate: (document.getElementById('moveOutDate') || {}).value || '',
                unitLabel: document.getElementById('unitLabel').value,
                unitSize: document.getElementById('unitSize').value,
                monthlyRent: document.getElementById('monthlyRent').value,
                rentalMonths: getRentalMonths(
                    (document.getElementById('moveInDate') || {}).value || '',
                    (document.getElementById('moveOutDate') || {}).value || ''
                )
            }));
        });

        if (desktopForm) {
            desktopForm.addEventListener('submit', function () {
                localStorage.setItem('pbx_step1', JSON.stringify({
                    fullName: (desktopForm.querySelector('[name="fullName"]') || {}).value || '',
                    mobile: (desktopForm.querySelector('[name="mobile"]') || {}).value || '',
                    emirate: (desktopForm.querySelector('[name="emirate"]') || {}).value || '',
                    email: (desktopForm.querySelector('[name="email"]') || {}).value || '',
                    storingFor: (desktopForm.querySelector('[name="storingFor"]') || {}).value || '',
                    moveInDate: (desktopForm.querySelector('[name="moveInDate"]') || {}).value || '',
                    moveOutDate: (desktopForm.querySelector('[name="moveOutDate"]') || {}).value || '',
                    unitLabel: (desktopForm.querySelector('[name="unitLabel"]') || {}).value || '',
                    unitSize: (desktopForm.querySelector('[name="unitSize"]') || {}).value || '',
                    monthlyRent: (desktopForm.querySelector('[name="monthlyRent"]') || {}).value || '',
                    rentalMonths: getRentalMonths(
                        (desktopForm.querySelector('[name="moveInDate"]') || {}).value || '',
                        (desktopForm.querySelector('[name="moveOutDate"]') || {}).value || ''
                    )
                }));
            });
        }
    }

    const PRODUCTS = [
        { id: 'medium_box', name: 'Medium Box', spec: '50x40x40 cm', price: 12 },
        { id: 'tape_roll', name: 'Tape Roll', spec: '50 m x 48 mm', price: 9 },
        { id: 'padlock', name: 'Padlock', spec: '50 mm steel', price: 35 },
        { id: 'bubble_wrap', name: 'Bubble Wrap', spec: '10 m roll', price: 25 },
        { id: 'wardrobe_box', name: 'Wardrobe Box', spec: 'With rail', price: 38 },
        { id: 'large_box', name: 'Large Box', spec: '60x45x45 cm', price: 16 }
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
            ['fullName', 'mobile', 'emirate', 'email', 'storingFor', 'moveInDate', 'moveOutDate', 'unitLabel', 'unitSize', 'monthlyRent', 'rentalMonths'].forEach(function (k) {
                const hidden = form.querySelector('input[name="' + k + '"]');
                if (hidden) hidden.value = p.get(k) || '';
            });
        }

        const rent = Number((p.get('monthlyRent') || form.querySelector('input[name="monthlyRent"]').value || 700));
        const moveInDate = p.get('moveInDate') || (form.querySelector('input[name="moveInDate"]') || {}).value || '';
        const moveOutDate = p.get('moveOutDate') || (form.querySelector('input[name="moveOutDate"]') || {}).value || '';
        const rentalMonths = Number(p.get('rentalMonths') || getRentalMonths(moveInDate, moveOutDate));
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
            const remainingMonths = Math.max(0, rentalMonths - 1);
            const remainingRentTotal = remainingMonths * rent;
            const due = rent + supplies;
            const estimatedTotal = rent + remainingRentTotal + supplies;

            const month1LabelEl = document.getElementById('sumMonth1Label');
            const month1ValueEl = document.getElementById('sumMonth1');
            const remainingLabelEl = document.getElementById('sumRemainingLabel');
            const remainingValueEl = document.getElementById('sumRemaining');
            const estimatedEl = document.getElementById('sumEstimated');

            if (month1LabelEl) month1LabelEl.textContent = 'Monthly rent';
            if (month1ValueEl) month1ValueEl.textContent = fmtAED(rent);
            if (remainingLabelEl) {
                remainingLabelEl.textContent = remainingMonths > 0
                    ? ('Remaining months total')
                    : 'Remaining months';
            }
            if (remainingValueEl) remainingValueEl.textContent = fmtAED(remainingRentTotal);
            if (estimatedEl) estimatedEl.textContent = fmtAED(estimatedTotal);

            const fields = {
                sumSupplies: fmtAED(supplies),
                sumDue: fmtAED(due),
                runningTotal: rentalMonths > 1 ? (fmtAED(estimatedTotal) + ' total for ' + rentalMonths + ' months') : (fmtAED(due) + ' first month total'),
                selChip: rentalMonths > 1
                    ? (fmtAED(estimatedTotal) + ' Estimated total')
                    : (fmtAED(due) + ' Due today'),
                suppliesCount: qty + ' items'
            };
            Object.keys(fields).forEach(function (id) {
                const el = document.getElementById(id);
                if (el) el.textContent = fields[id];
            });
            const dueField = form.querySelector('input[name="dueToday"]');
            const supplyField = form.querySelector('input[name="suppliesTotal"]');
            const monthsField = form.querySelector('input[name="rentalMonths"]');
            const estField = form.querySelector('input[name="estimatedTotal"]');
            if (dueField) dueField.value = String(due);
            if (supplyField) supplyField.value = String(supplies);
            if (monthsField) monthsField.value = String(rentalMonths);
            if (estField) estField.value = String(estimatedTotal);
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
            moveOutDate: pick('moveOutDate', toYMD(addDays(37))),
            unitSize: pick('unitSize', '35 sq ft (M)'),
            unitLabel: pick('unitLabel', 'SARA - M'),
            monthlyRent: Number(pick('monthlyRent', 700)),
            rentalMonths: Number(pick('rentalMonths', 1))
        };

        if (!Number.isFinite(data.rentalMonths) || data.rentalMonths < 1) {
            data.rentalMonths = getRentalMonths(data.moveInDate, data.moveOutDate);
        }

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

        const due = Number(p.get('dueToday') || (data.monthlyRent + suppliesTotal));
        const estimatedTotal = Number(
            p.get('estimatedTotal') ||
            (data.monthlyRent + Math.max(0, data.rentalMonths - 1) * data.monthlyRent + suppliesTotal)
        );

        const supplyLines = PRODUCTS.filter(function (it) { return qty[it.id] > 0; }).map(function (it) {
            return '- ' + it.name + ' x ' + qty[it.id] + ' - ' + fmtAED(it.price * qty[it.id]);
        });

        const supplyCount = PRODUCTS.reduce(function (sum, it) { return sum + (qty[it.id] || 0); }, 0);

        const text = [
            'Hi purplebox',
            '',
            "I'd like to reserve a storage unit:",
            '',
            '📦 UNIT',
            '- Size: ' + data.unitSize,
            '- Move-in: ' + fmtInputDate(data.moveInDate),
            '- Move-out: ' + fmtInputDate(data.moveOutDate),
            '- Rental period: ' + data.rentalMonths + ' month(s)',
            '- Facility: purplebox Al Quoz',
            '',
            '➕ SUPPLIES',
            supplyLines.length ? supplyLines.join('\n') : '- No supplies selected',
            '',
            '💰 PRICING',
            '- Monthly rent: ' + fmtAED(data.monthlyRent) + '/m',
            '- Supplies: ' + fmtAED(suppliesTotal),
            '- Due today: ' + fmtAED(due),
            '- Estimated total (' + data.rentalMonths + ' month(s)): ' + fmtAED(estimatedTotal),
            '',
            '👤 MY DETAILS',
            '- Name: ' + data.fullName,
            '- Mobile: ' + data.mobile,
            '- Email: ' + data.email,
            '- Emirate: ' + data.emirate,
            '- Storing for: ' + data.storingFor,
            '',
            'Please confirm availability and the next steps. Thanks!'
        ].join('\n');

        const fieldMap = {
            rName: data.fullName,
            rMobile: data.mobile,
            rEmail: data.email,
            rStore: data.storingFor,
            rUnit: data.unitSize,
            rMove: fmtInputDate(data.moveInDate) + ' -> ' + fmtInputDate(data.moveOutDate) + ' (' + data.rentalMonths + ' month(s))',
            rSupplies: supplyCount + ' items - ' + fmtAED(suppliesTotal),
            rTotalLabel: data.rentalMonths > 1 ? 'Estimated total' : 'Due today',
            dueBig: data.rentalMonths > 1 ? fmtAED(estimatedTotal) : fmtAED(due),
            runningTotal: fmtAED(estimatedTotal) + ' est. total',
            selChip: data.rentalMonths > 1
                ? (fmtAED(estimatedTotal) + ' Estimated total')
                : (fmtAED(due) + ' Due today'),
            summaryText: text
        };

        Object.keys(fieldMap).forEach(function (id) {
            const el = document.getElementById(id);
            if (el) {
                if (id === 'summaryText') el.value = fieldMap[id];
                else el.textContent = fieldMap[id];
            }
        });

        const reserveAction = document.getElementById('reserveAction');
        const leadConfig = window.PBXLeadConfig || {};

        function showLeadNotice(type, message) {
            var parent = reserveAction ? reserveAction.closest('.sticky-bar') : null;
            if (!parent) return;

            var notice = document.getElementById('reserveLeadNotice');
            if (!notice) {
                notice = document.createElement('div');
                notice.id = 'reserveLeadNotice';
                notice.style.marginTop = '12px';
                notice.style.borderRadius = '10px';
                notice.style.fontSize = '13px';
                notice.style.lineHeight = '1.5';
                parent.parentNode.insertBefore(notice, parent.nextSibling);
            }

            if (type === 'success') {
                notice.style.background = '#f3f8ff';
                notice.style.border = '1px solid #c7ddff';
                notice.style.color = '#143461';
                notice.style.padding = '16px';
                notice.innerHTML =
                    '<div style="display:flex;align-items:flex-start;gap:12px;">' +
                    '<div style="width:28px;height:28px;min-width:28px;border-radius:999px;background:#22c55e;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;">✓</div>' +
                    '<div>' +
                    '<h4 style="margin:0 0 6px;font-size:16px;line-height:1.3;color:#0f172a;">Request received</h4>' +
                    '<p style="margin:0 0 8px;color:#334155;">Your request has been prepared for contact@purplebox.ae. Our representative will contact you within the next 15 minutes to confirm your storage needs and recommend the best unit.</p>' +
                    '<p style="margin:0 0 10px;color:#475569;font-size:12px;">Need help right away? Start a live WhatsApp chat or call us now.</p>' +
                    '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                    '<a href="tel:+971542249946" style="display:inline-flex;align-items:center;justify-content:center;padding:8px 12px;border-radius:8px;border:1px solid #93c5fd;background:#fff;color:#1e3a8a;text-decoration:none;font-weight:700;font-size:12px;">Call Now</a>' +
                    '<a href="https://wa.me/971542249946?text=Hi%2C%20I%20just%20submitted%20my%20reservation%20request%20and%20need%20quick%20help" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;padding:8px 12px;border-radius:8px;border:1px solid #86efac;background:#ecfdf3;color:#166534;text-decoration:none;font-weight:700;font-size:12px;">Chat Right Away</a>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            } else {
                notice.style.background = '#fef2f2';
                notice.style.border = '1px solid #fca5a5';
                notice.style.color = '#991b1b';
                notice.style.padding = '12px 14px';
                notice.textContent = message;
            }
            notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function submitLeadForm() {
            var form = document.createElement('form');
            form.method = 'post';
            form.action = leadConfig.submitUrl || '/wp-admin/admin-post.php';
            form.style.display = 'none';

            var payload = {
                action: leadConfig.submitAction || 'pbx_submit_reservation_form',
                pbx_lead_nonce: leadConfig.formNonce || '',
                source_page_name: 'Reserve Step 3',
                full_name: data.fullName,
                mobile: data.mobile,
                email: data.email,
                emirate: data.emirate,
                storing_for: data.storingFor,
                move_in_date: data.moveInDate,
                move_out_date: data.moveOutDate,
                rental_months: String(data.rentalMonths),
                unit_size: data.unitSize,
                unit_label: data.unitLabel,
                monthly_rent: String(data.monthlyRent),
                promo_code: '',
                supplies_total: String(suppliesTotal),
                due_today: String(due),
                estimated_total: String(estimatedTotal),
                supplies_text: supplyLines.length ? supplyLines.join('\n') : 'No supplies selected',
                summary_text: text,
                source_page: window.location.href.split('#')[0]
            };

            Object.keys(payload).forEach(function (key) {
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = payload[key];
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        }

        if (leadConfig.leadSubmitted === '1') {
            showLeadNotice('success', leadConfig.leadMessage || 'Request received.');
            if (reserveAction) {
                reserveAction.textContent = 'Submitted';
                reserveAction.setAttribute('aria-disabled', 'true');
            }
        }

        if (leadConfig.leadSubmitted === '0') {
            showLeadNotice('error', leadConfig.leadMessage || 'We could not submit your reservation right now. Please try again in a moment.');
        }

        if (reserveAction) {
            reserveAction.addEventListener('click', function (e) {
                e.preventDefault();
                reserveAction.classList.add('is-loading');
                reserveAction.setAttribute('aria-disabled', 'true');
                reserveAction.textContent = 'Submitting...';
                submitLeadForm();
            });
        }
    }

    function init() {
        let step = document.body && document.body.getAttribute('data-step');
        if (!step) {
            if (document.getElementById('step1Form') || document.getElementById('step1FormDesktop')) {
                step = '1';
            } else if (document.getElementById('step2Form')) {
                step = '2';
            } else if (document.getElementById('reserveAction') || document.getElementById('summaryText')) {
                step = '3';
            }
        }
        if (step === '1') setupStep1();
        if (step === '2') setupStep2();
        if (step === '3') setupStep3();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
