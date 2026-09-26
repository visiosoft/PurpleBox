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

const MAX_SUPPLY_QTY_PER_ITEM = 50;

function computeSuppliesTotalAED(supplies) {
  if (!supplies || typeof supplies !== 'object') return 0;
  let total = 0;
  Object.keys(SUPPLY_PRICES_AED).forEach((id) => {
    const rawQty = Number(supplies[id] || 0);
    if (Number.isFinite(rawQty) && rawQty > 0) {
      const qty = Math.min(Math.floor(rawQty), MAX_SUPPLY_QTY_PER_ITEM);
      total += qty * SUPPLY_PRICES_AED[id];
    }
  });
  return total;
}

// bookingId/confirmToken come from the client and get spliced into a URL path sent to
// the external booking API, so they're restricted to a safe charset before use anywhere.
const SAFE_TOKEN_RE = /^[a-zA-Z0-9_-]+$/;
const MAX_TOKEN_LEN = 128;
function isSafeToken(value) {
  return typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_TOKEN_LEN &&
    SAFE_TOKEN_RE.test(value);
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

    if (isSafeToken(bookingId) && isSafeToken(confirmToken)) {
      try {
        const resp = await fetch(`${BOOKING_API_BASE}/${encodeURIComponent(bookingId)}/confirm-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: confirmToken, externalReference: session.id })
        });

        if (resp.status === 410) {
          // Hold expired before payment completed — the customer was charged by Stripe but
          // the booking will never be confirmed on the API side, so refund automatically.
          console.error('BOOKING HOLD EXPIRED AFTER PAYMENT -- refunding', {
            sessionId: session.id,
            bookingId,
            paymentIntent: session.payment_intent
          });
          try {
            if (session.payment_intent) {
              await stripe.refunds.create({ payment_intent: session.payment_intent });
            } else {
              console.error('BOOKING HOLD EXPIRED AFTER PAYMENT -- no payment_intent on session, cannot auto-refund', session.id);
            }
          } catch (refundErr) {
            console.error('BOOKING HOLD EXPIRED AFTER PAYMENT -- refund attempt failed', session.id, refundErr);
          }
        } else if (!resp.ok) {
          const body = await resp.text();
          console.error('confirm-payment failed', resp.status, body);
        }
      } catch (err) {
        console.error('confirm-payment request error', err);
      }
    } else {
      console.error('checkout.session.completed has invalid/missing bookingId/confirmToken metadata', session.id);
    }
  }

  res.json({ received: true });
});

app.use(express.json());

app.post('/api/public/checkout-session', async (req, res) => {
  const { bookingId, confirmToken, sizeSqf, supplies, customer } = req.body || {};

  if (!isSafeToken(bookingId) || !isSafeToken(confirmToken)) {
    return res.status(400).json({ error: 'bookingId and confirmToken must be alphanumeric (with _ or -) and non-empty' });
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

// Lets the frontend verify a Stripe Checkout session actually paid before showing a
// success message, instead of trusting the ?payment=success URL param at face value.
// Only { paid: boolean } is ever exposed — no other Stripe session detail leaks.
app.get('/api/public/checkout-status', async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'session_id is required' });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json({ paid: session.payment_status === 'paid' });
  } catch (err) {
    res.json({ paid: false });
  }
});

app.listen(PORT || 4242, () => {
  console.log(`PurpleBox checkout API listening on port ${PORT || 4242}`);
});
