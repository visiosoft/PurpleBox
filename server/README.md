# PurpleBox Checkout API

Small Express service that sits between the static reservation flow
(`reserve-step-3.html`) and Stripe. It does two things:

1. `POST /api/public/checkout-session` — creates a Stripe Checkout Session
   for the first month's rent + any packing supplies, using **server-side**
   pricing tables (never a client-supplied amount).
2. `POST /webhook/stripe` — on `checkout.session.completed`, calls the
   existing PurpleBox booking API's `confirm-payment` endpoint so the held
   unit is marked as a paid booking.

This service does **not** create the booking hold itself — the front end
calls the existing booking API (`POST {BOOKING_API_BASE}`) directly for that,
then passes the returned `bookingId`/`confirmToken` to
`/api/public/checkout-session` here.

## Setup

```
cd server
npm install
cp .env.example .env   # fill in the real values
npm start
```

Required env vars (see `.env.example`):

- `STRIPE_SECRET_KEY` — from Stripe Dashboard → Developers → API keys.
- `STRIPE_WEBHOOK_SECRET` — from Dashboard → Developers → Webhooks, after
  adding an endpoint pointing at `https://<this-service>/webhook/stripe`
  for the `checkout.session.completed` event.
- `BOOKING_API_BASE` — base URL of the existing public booking API, e.g.
  `https://api.purplebox.ae/api/public/bookings`.
- `CHECKOUT_SUCCESS_URL` / `CHECKOUT_CANCEL_URL` — where Stripe redirects
  the browser back to.
- `ALLOWED_ORIGINS` — comma-separated list of origins allowed to call this
  API from the browser (CORS).

## Restricting to Visa / Mastercard only

Stripe Checkout Sessions don't take a per-request "allowed card brands"
list — brand availability is controlled account-wide. To accept **only**
Visa and Mastercard (no Amex, Discover, etc.):

Stripe Dashboard → **Settings → Payment methods** → find **Cards** →
**Manage** → turn off every card brand except Visa and Mastercard.

This applies to all Checkout Sessions created by this account, including
the ones this service creates with `payment_method_types: ['card']`.

## Pricing tables

`MONTHLY_RENT_AED` and `SUPPLY_PRICES_AED` in `index.js` mirror the prices
shown on `book-unit.html` and the `PRODUCTS` list in `js/reserve-flow.js`.
If those prices change, update this file too — the amount charged always
comes from here, not from anything the browser sends.
