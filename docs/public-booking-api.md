# PurpleBox Public Booking API

> Source: pasted into the project chat by the team that owns this API (not authored in
> this repo). Persisted here as the committed contract so `server/index.js` and
> `js/reserve-flow.js` have a durable spec to implement against, instead of the contract
> living only in chat history.

Two endpoints. No login, no API key, no auth header on either. CORS is open
to any origin, so they can be called directly from a browser.

Base URL: `https://<your-api-domain>/api/public/bookings`
(replace with wherever the PurpleBox server is deployed — ask for the exact
production URL if you don't have it)

Rate limit: 10 requests per minute per IP address on each endpoint. A real
visitor filling out the form once will never hit this; a script calling
repeatedly will get `429 Too Many Requests`.

---

## 1. Check a size and reserve a unit

```
POST /api/public/bookings
Content-Type: application/json
```

**Request body:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `firstName` | string | yes | |
| `lastName` | string | yes | |
| `phone` | string | yes | Any format; used to avoid creating a duplicate customer if they book again |
| `sizeSqf` | number | yes | The unit size in square feet, e.g. `50` |
| `email` | string | no | |
| `startDate` | string (`YYYY-MM-DD`) | no | Defaults to today |
| `durationWeeks` | number | no | Defaults to `4` (one billing cycle) |

**Example request:**

```json
{
  "firstName": "Ahmed",
  "lastName": "Khan",
  "phone": "+971501234567",
  "email": "ahmed@example.com",
  "sizeSqf": 50
}
```

**If a unit is available** — `201 Created`:

```json
{
  "bookingId": "66f1a2b3c4d5e6f7a8b9c0d1",
  "unitNumber": "F2-40",
  "sizeSqf": 50,
  "expiresInMinutes": 15,
  "confirmToken": "9f8e7d6c5b4a...64 hex characters"
}
```

- `bookingId` and `confirmToken` — **save both**. You need both to call
  endpoint 2 once payment succeeds.
- The unit is held for **15 minutes**. If you don't call endpoint 2 within
  that window, the hold is released automatically and the unit becomes
  available to someone else — your Stripe checkout should complete well
  inside that time.

**If nothing is free** — `200 OK` (this is a normal result, not an error):

```json
{ "available": false, "message": "No unit available for that size" }
```

**If the request is malformed** — `400 Bad Request`:

```json
{ "error": "firstName, lastName and phone are required" }
```

---

## 2. Confirm payment succeeded

Call this **immediately after your Stripe checkout confirms the charge**.

```
POST /api/public/bookings/:bookingId/confirm-payment
Content-Type: application/json
```

Replace `:bookingId` with the `bookingId` from step 1.

**Request body:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `token` | string | yes | The `confirmToken` from step 1 |
| `externalReference` | string | no | Your Stripe payment/session id, stored for our records |

```json
{
  "token": "9f8e7d6c5b4a...64 hex characters",
  "externalReference": "cs_test_a1b2c3d4"
}
```

**Success** — `200 OK`:

```json
{ "ok": true }
```

Safe to call twice with the same token (e.g. if your webhook retries) — the
second call also returns `{ "ok": true }` and does nothing further.

**Errors:**

| Status | Meaning |
|---|---|
| `400` | `token` missing from the request |
| `401` | `token` doesn't match this booking |
| `404` | No booking with that id |
| `410` | The 15-minute hold already expired before payment was confirmed — the unit may no longer be available; you'll need to start over from endpoint 1 |

---

## What happens on our side

A successful booking creates a real customer record and a lead in our CRM
immediately (step 1) — our sales team can see it before payment even
completes. Confirming payment (step 2) marks it as a genuine accepted
booking rather than a browsing session, and the unit stays held for that
customer. A member of our team then follows up to complete the paperwork and
signature — this API does not itself generate a signed contract.

## Suggested flow on your side

1. Customer fills in name, phone, size (and optionally email/dates) →
   call endpoint 1.
2. If `available: false`, show "sorry, nothing available" and stop.
3. If you get a `unitNumber` back, show it to the customer and proceed to
   your Stripe checkout for that unit's price.
4. On Stripe's success callback/webhook, call endpoint 2 with the saved
   `bookingId` and `confirmToken`.
5. If more than ~15 minutes pass between steps 1 and 4 (e.g. checkout
   abandoned and retried), just call endpoint 1 again to get a fresh hold.
