require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  BOOKING_API_BASE,
  CHECKOUT_SUCCESS_URL,
  CHECKOUT_CANCEL_URL,
  ALLOWED_ORIGINS,
  PORT
} = process.env;

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}
if (!BOOKING_API_BASE) {
  throw new Error('BOOKING_API_BASE is not set');
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

// Server-side source of truth for monthly rent by unit size (AED).
// Mirrors the pricing shown on book-unit.html — never trust a client-supplied amount.
const MONTHLY_RENT_AED = {
  10: 330,
  25: 650,
  35: 775,
  50: 950,
  75: 1300,
  100: 1600,
  150: 2500,
  200: 3000
};

// Server-side source of truth for packing supplies pricing (AED).
// Mirrors PRODUCTS in js/reserve-flow.js.
const SUPPLY_PRICES_AED = {
  medium_box: 12,
  tape_roll: 9,
  padlock: 35,
  bubble_wrap: 25,
  wardrobe_box: 38,
  large_box: 16
};

function computeSuppliesTotalAED(supplies) {
  if (!supplies || typeof supplies !== 'object') return 0;
  let total = 0;
  Object.keys(SUPPLY_PRICES_AED).forEach((id) => {
    const qty = Number(supplies[id] || 0);
    if (Number.isFinite(qty) && qty > 0) {
      total += Math.floor(qty) * SUPPLY_PRICES_AED[id];
    }
  });
  return total;
}

const app = express();

const allowedOrigins = (ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : false
}));

// Stripe webhook needs the raw body for signature verification, so it must be
// registered before the generic express.json() body parser below.
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { bookingId, confirmToken } = session.metadata || {};

    if (bookingId && confirmToken) {
      try {
        const resp = await fetch(`${BOOKING_API_BASE}/${bookingId}/confirm-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: confirmToken, externalReference: session.id })
        });
        if (!resp.ok) {
          const body = await resp.text();
          console.error('confirm-payment failed', resp.status, body);
        }
      } catch (err) {
        console.error('confirm-payment request error', err);
      }
    } else {
      console.error('checkout.session.completed missing bookingId/confirmToken metadata', session.id);
    }
  }

  res.json({ received: true });
});

app.use(express.json());

app.post('/api/public/checkout-session', async (req, res) => {
  const { bookingId, confirmToken, sizeSqf, supplies, customer } = req.body || {};

  if (!bookingId || !confirmToken) {
    return res.status(400).json({ error: 'bookingId and confirmToken are required' });
  }

  const monthlyRent = MONTHLY_RENT_AED[Number(sizeSqf)];
  if (!monthlyRent) {
    return res.status(400).json({ error: 'sizeSqf is not a recognised unit size' });
  }

  const suppliesTotal = computeSuppliesTotalAED(supplies);
  const dueTodayAED = monthlyRent + suppliesTotal;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customer && customer.email ? customer.email : undefined,
      line_items: [
        {
          price_data: {
            currency: 'aed',
            unit_amount: Math.round(dueTodayAED * 100),
            product_data: {
              name: `PurpleBox storage reservation - ${sizeSqf} sq ft unit`,
              description: suppliesTotal > 0
                ? `First month rent (AED ${monthlyRent}) + packing supplies (AED ${suppliesTotal})`
                : `First month rent (AED ${monthlyRent})`
            }
          },
          quantity: 1
        }
      ],
      metadata: { bookingId, confirmToken },
      success_url: CHECKOUT_SUCCESS_URL,
      cancel_url: CHECKOUT_CANCEL_URL
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session creation failed', err);
    res.status(500).json({ error: 'Could not start checkout' });
  }
});

app.listen(PORT || 4242, () => {
  console.log(`PurpleBox checkout API listening on port ${PORT || 4242}`);
});
