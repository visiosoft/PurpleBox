/*
 * Live unit pricing from the PurpleBox API.
 *
 * Any element with data-pbx-price="<sizeSqf>" gets its contents replaced with the
 * current price for that size, as the design system's PriceCard (option A):
 *   struck "was" price -> price + "/ 4 weeks" -> green "Save AED 66 · first 4 weeks" chip.
 * Styles live in css/pb-unit-card.css. The static HTML inside each element is
 * left in place as a fallback if the API fails.
 */
(function () {
  var API_URL = 'https://api.purplebox.ae/api/public/pricing';

  function fmt(n) {
    return Math.round(n).toLocaleString('en-US');
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render(el, size, data) {
    var cur = esc(data.currency || 'AED');
    var period = esc(data.period || '4 weeks');
    var discounted = size.hasDiscount && size.offerPrice < size.price;
    // Promo prices are rounded to whole dirhams; the saving is worked out from the
    // rounded figure so the numbers on the card always add up.
    var now = discounted ? Math.round(size.offerPrice) : size.price;
    var ranged = !discounted && size.hasPriceRange && size.priceTo > size.price;

    // The "was" line is always present (empty when there is nothing to show) so
    // every card's price sits on the same baseline.
    var was = '<span class="pb-price__was" aria-hidden="true"></span>';
    if (discounted) {
      was = '<s class="pb-price__was"><span class="pbx-sr">Was </span>' + cur + ' ' + fmt(size.price) + '</s>';
    } else if (ranged) {
      was = '<span class="pb-price__was pb-price__was--label">From</span>';
    }

    var html = was +
      '<div class="pb-price__row">' +
      '<span class="pb-price__now">' + cur + ' ' + fmt(now) + '</span>' +
      '<span class="pb-price__per">/ ' + period + '</span>' +
      '</div>';

    if (size.available === 0) {
      html += '<span class="pb-save pb-save--soldout">Fully booked</span>';
    } else if (discounted) {
      html += '<span class="pb-save">Save ' + cur + ' ' + fmt(size.price - now) +
        ' <span>&middot; first ' + period + '</span></span>';
    } else {
      // Hold the chip's line too, so full-price and discounted prices line up.
      html += '<span class="pb-save pb-save--empty" aria-hidden="true">&nbsp;</span>';
    }

    el.innerHTML = html;
    el.setAttribute('data-pbx-price-live', '');
  }

  function apply(data) {
    if (!data || !Array.isArray(data.sizes)) return;
    var bySize = {};
    data.sizes.forEach(function (sz) { bySize[sz.sizeSqf] = sz; });

    document.querySelectorAll('[data-pbx-price]').forEach(function (el) {
      var size = bySize[el.getAttribute('data-pbx-price')];
      if (size) render(el, size, data);
    });
  }

  function load() {
    if (!document.querySelector('[data-pbx-price]')) return;
    fetch(API_URL, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(apply)
      .catch(function () { /* keep static fallback prices */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
