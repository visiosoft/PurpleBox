# PurpleBox Checkout API

## Outstanding placeholders (not yet supplied)

This integration is otherwise complete but cannot go live until PurpleBox supplies:

- `BOOKING_API_BASE` (`server/.env`) — the real production base URL of the Public
  Booking API (contract documented in `../docs/public-booking-api.md`). Currently
  unset in `.env.example`.
- `bookingApiBase` and `checkoutApiBase` in `window.PBXBookingConfig`
  (`reserve-step-3.html` and `purplebox-static-theme/static-pages/reserve-step-3.html`)
  — currently `REPLACE_WITH_BOOKING_API_BASE_URL` and
  `REPLACE_WITH_CHECKOUT_API_BASE_URL`. `checkoutApiBase` is wherever this `server/`
  app ends up deployed (its public origin, no trailing slash); `bookingApiBase` is
  the same Public Booking API base referenced above.

These values must come from PurpleBox, or from whoever owns the Public Booking API
and the deployment target for this `server/` app — they should not be invented.

Small Express service that sits between the static reservation flow
(`reserve-step-3.html`) and Stripe. It does three things:

1. `POST /api/public/checkout-session` — creates a Stripe Checkout Session
   for the first month's rent + any packing supplies, using **server-side**
   pricing tables (never a client-supplied amount).
2. `POST /webhook/stripe` — on `checkout.session.completed`, calls the
   existing PurpleBox booking API's `confirm-payment` endpoint so the held
   unit is marked as a paid booking. If that call comes back `410` (the
   15-minute hold expired before payment completed), it automatically
   refunds the Stripe charge so the customer isn't charged for a booking
   that will never be confirmed.
3. `GET /api/public/checkout-status?session_id=...` — lets the frontend
   verify a session actually paid (via Stripe) before showing a success
   message, instead of trusting the `?payment=success` URL param outright.
   Returns only `{ paid: boolean }`.

This service does **not** create the booking hold itself — the front end
calls the existing booking API (`POST {BOOKING_API_BASE}`) directly for that,
then passes the returned `bookingId`/`confirmToken` to
`/api/public/checkout-session` here. See `../docs/public-booking-api.md` for
the full Public Booking API contract.

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
  `https://api.purplebox.ae/api/public/bookings`. See
  `../docs/public-booking-api.md` for the full contract.
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
