(function () {
    function parsePrice(priceText) {
        return Number(String(priceText || '').replace(/[^0-9.]/g, '') || 0);
    }

    function loadCart() {
        try {
            var data = JSON.parse(localStorage.getItem('pbCartItems') || '[]');
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem('pbCartItems', JSON.stringify(cart));
        var count = cart.reduce(function (t, item) { return t + Number(item.qty || 0); }, 0);
        localStorage.setItem('pbCartCount', String(count));

        var badge = document.getElementById('shopCartBadge');
        if (badge) {
            badge.textContent = String(count);
            badge.classList.toggle('has-items', count > 0);
        }
    }

    function upsertCartItem(product, qty) {
        var cart = loadCart();
        var existing = cart.find(function (x) { return x.id === product.id; });

        if (existing) {
            existing.qty = Number(existing.qty || 0) + qty;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                cat: product.cat,
                qty: qty,
            });
        }

        saveCart(cart);
    }

    document.addEventListener('click', function (e) {
        var addBtn = e.target.closest('.shop-add[data-add-id]');
        if (!addBtn) {
            return;
        }

        var card = addBtn.closest('.shop-card[data-id]');
        if (!card) {
            return;
        }

        var id = card.getAttribute('data-id') || '';
        var nameEl = card.querySelector('.shop-title');
        var specEl = card.querySelector('.shop-spec');
        var priceEl = card.querySelector('.shop-price');
        var qtyEl = card.querySelector('.shop-qty[data-qty-id]');

        var qty = Math.max(1, Number((qtyEl && qtyEl.value) || 1));
        var priceText = (priceEl && priceEl.textContent) ? priceEl.textContent.trim() : 'AED 0';

        upsertCartItem({
            id: id,
            name: nameEl ? nameEl.textContent.trim() : id,
            cat: 'Boxes',
            spec: specEl ? specEl.textContent.trim() : '',
            price: 'AED ' + Math.round(parsePrice(priceText)),
        }, qty);

        addBtn.textContent = 'Added';
        addBtn.style.background = '#16a34a';
        setTimeout(function () {
            addBtn.textContent = 'Add to cart';
            addBtn.style.background = '';
        }, 800);
    });
})();
