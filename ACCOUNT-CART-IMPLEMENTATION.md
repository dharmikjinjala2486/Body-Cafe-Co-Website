# Account and Cart — implementation record (A–H)

Base: `3ad38b1` (Lot Reports release). Status: built and verified locally; not committed, pushed or deployed.

## What changed

All eight directions share one bag, one sign-in and one account. They use the same server rules and the same information. Each direction keeps its own look through `bg-a…bg-h` and `ac-a…ac-h`.

**Journey.** Shop → Add → Review bag → Checkout → Delivery → Payment → Confirmation. Checkout works as a guest. Sign-in is optional, and after a purchase an account is offered once, without nagging.

**Bag (`/cart`)**
- Each line shows:
  - image, name, format and pack note, unit price and line total;
  - availability and a product link;
  - −/+ quantity, which applies straight away, clamps to the server limit (10, or stock), removes the line at zero and offers Undo;
  - Save for later and Remove.
- Quantity changes go out one at a time, and a newer change replaces any queued older one. A failed request keeps the bag and offers Retry. Going offline shows a notice, and the bag is re-checked when the connection returns.
- The server quote is authoritative:
  - **Reduced or unavailable stock:** the quantity is corrected and the line explains why. An unavailable line blocks checkout until it is removed or saved for later.
  - **Price changes:** the bag takes the current price and says what it changed from and to before checkout.
  - **Unknown products:** removed, with an explanation.
- The summary shows:
  - subtotal;
  - the real discount, behind "Have a discount code?";
  - shipping, with its sample rule explained;
  - the tax note and total;
  - one Checkout action (or the reason it is blocked);
  - Continue shopping, a pincode check through the existing system (no delivery promise), and Shipping, Returns and Help links.
- Saved for later lives in this browser only (`bcc-saved`).
- The bag persists through refresh, navigation and other tabs (`storage` event).
- **Signed-in customers:** the bag is also stored on the account. On sign-in the two bags are combined by taking the larger quantity per product, never by adding them, and a one-line message explains what happened.
- **Mobile:** a sticky total-and-Checkout bar sits in the page flow (it never covers content) and hides while the summary's own Checkout button is on screen.
- No auto-adds, preselected extras, countdowns or urgency copy.

**Sign-in (`/sign-in?next=…`)**
1. Enter a mobile number with a fixed +91 prefix and send a code.
2. The next screen shows the masked destination and a "Change number" link.
3. There is one code field (`autocomplete="one-time-code"`) that accepts paste and autofill.
4. Verify, then return to the original task.

- The screen says plainly that a new number creates an account and a returning number signs in. After verification a toast says which one happened and how many guest orders joined.
- Resend has a visible countdown.
- Wrong code (attempts left), expired, locked, rate-limited (with wait time), invalid number and provider-unavailable each have their own state. Buttons are disabled while a request is in flight.
- Sign-in asks for no marketing consent. Optional email and WhatsApp offers are separate, unticked choices under Preferences.
- **Honest preview mode:**
  - With `BCC_OTP_PROVIDER` unset or `preview`, the code is shown on the page labelled "Local preview code. No SMS was sent." The site never says "SMS sent".
  - Any other value fails with an "unavailable" message until a real adapter is added (`app/account.py`, `UnconfiguredOtpSender`).
- `next` accepts only an allowlist of internal paths: checkout, payment, orders, reviews, contact/support and account sections. Anything else falls back to `/account`.
- Checkout and support-form drafts are kept in `sessionStorage` across sign-in, without the code.

**Account (`/account/…`)**
- **Overview:** next useful step, recent orders.
- **Orders:** timeline. Tracking text is honest that shipping isn't connected.
- **Invoices:** shown as "Not available"; none are fabricated.
- **Lots:** the allocated lots link to their lot report, with manual lookup as a fallback.
- **Order actions** follow the actual policy:
  - Cancel only before shipping.
  - Refund approval is explained.
  - Buy again validates against the quote, then sends you to the bag to review; it never orders by itself.
  - Get help opens a support case for that order.
  - Actions that aren't available are explained, not hidden.
- **Addresses (signed-in only; the server returns 401 for guests):** add, edit, remove and make default. Field errors appear beside each field and keep what you typed. Server ownership checks apply, with a maximum of 20.
- **Support:** order-specific cases and history.
- **Reviews:** eligibility and status per purchased product.
- **Profile & security:** verified mobile (masked, with the support route for changing it); name; optional email marked unverified; session count; sign out here or on all devices.
- **Communication preferences:** order updates are always on. Email and WhatsApp offers are opt-in.
- Guests see Overview, Orders, Support and Preferences for this browser session. Signing in carries this session's support cases and matching guest orders into the account.
- Signed-in customers get Sign out in the account header, plus Sign out on all devices under Profile & security.
- If the session ends while a page is open, a toast says so and links to sign-in.

**Checkout and payment continuity**
- Each checkout carries an idempotency key (per bag contents, kept in `sessionStorage`). A double submit or resubmit returns the same order. A key used by another session is refused (409).
- Signed-in checkout pre-fills the mobile number and default address. Guests see "No account needed" and an optional sign-in that keeps their details.
- The preview payment simulator returns success, failure, cancelled or uncertain:
  - **Uncertain:** the order is marked `processing`, and retry is blocked until a status check or reconciliation gives an answer.
  - **Failed or cancelled:** the order can be retried while its reservation holds.
  - **Expired reservation:** an expired order says so and sends you back to the bag.
  - `processing` reservations are not expired by the sweeper.

**Shared Netlify preview.** The bag works with the same sample rules (`deploy/hosted-preview.js` quote). Checkout and sign-in show the existing "unavailable on this shared preview" page, and the bag says so before you press Checkout.

Not built, as the brief asked: subscriptions, wallets, saved cards, loyalty and passkeys.

## Files

New:
- `app/account.py`: AccountMixin covering bag quote and save, OTP, sign-in, profile, preferences, addresses, idempotent orders, payment states and the account view.
- `app/errors.py`: shared `Error` with structured extras.
- `app/test_account.py`: 10 tests.
- `web/bag.js`, `web/bag.css`: the bag, overriding the theme `cart` renderer for A–H.
- `web/account.js`, `web/account.css`: sign-in, account, order and payment pages; checkout and contact continuity.
- `design-tools/qa-account/verify_account.py`, `explore.py`: browser QA and screenshots.

Modified:
- `app/server.py`: Store includes AccountMixin. New routes. The old in-file otp, verify, pay and address methods moved out. Order idempotency. The expiry sweeper skips `processing` payments. Error JSON carries `reason` and `fields`.
- `app/test_http.py`: 2 new HTTP tests (structured errors and bag endpoints; guest address refusal, address and order ownership across customers, idempotent checkout and order-key reuse).
- `web/app.js` also: the header bag count keeps each direction's own label ("Bag" or "Cart") when it refreshes; previously it always wrote "Cart".
- QA updates for the new markup: `design-tools/qa-e-h/flows.py` (bag, payment and sign-in selectors) and `design-tools/qa-shop/verify_shop.py` (bag lines now carry the price seen).
- `web/app.js`: `BCCApp` bridge (cart, navigate, session, account), stored price per line, API errors carry `data` and `status`, `/sign-in` route, checkout idempotency key, sign-out hook.
- `web/index.html`: loads `bag.css`, `account.css`, `bag.js`, `account.js`.
- `deploy/hosted-preview.js`, `deploy/test_hosted_preview.mjs`: static bag quote and its checks.

### API
- GET:
  - `/api/bag`
  - `/api/account` (richer view)
  - `/api/orders/BCC-XXXXXXXX/status`
- POST:
  - `/api/bag`, `/api/bag/quote`
  - `/api/auth/otp`, `/api/auth/verify`, `/api/logout` (with `everywhere`)
  - `/api/profile`, `/api/preferences`
  - `/api/addresses`, `/api/addresses/ADDR-…/delete`, `/api/addresses/ADDR-…/default`
  - `/api/orders/<id>/pay` (outcomes `success | failure | cancelled | uncertain`)
  - `/api/orders/<id>/reconcile` (preview stand-in for the provider's later answer)

## Database and configuration

New tables are created on start; there is no migration step:
- `bags(user_id, data, updated)`
- `profiles(user_id, data)`
- `otp_requests(id, mobile, session, created)`, used for hourly caps
- `order_keys(key, user_id, order_id, created)`

New payment statuses are `processing` and `cancelled`. Existing rows are untouched.

Configuration: `BCC_OTP_PROVIDER`, which defaults to `preview`. Any other value refuses to send until a provider adapter exists.

Server limits:

| Limit | Value |
|---|---|
| Code lifetime | 5 min |
| Resend wait | 20 s |
| Attempts per code | 5 |
| Codes per number per hour | 5 |
| Codes per session per hour | 10 |
| Quantity per product | 10 (or stock) |
| Saved addresses | 20 |

## Remaining dependencies (provider, policy, data)
- **SMS/OTP provider:** account, DLT template registration, adapter, delivery receipts and abuse controls.
- **Payments:** Razorpay (or the chosen provider) order creation, webhooks and reconciliation. This replaces the simulator and `/reconcile`.
- **GST:** approved rates and invoicing (number series, PDF, storage) before invoices appear.
- **Courier:** serviceability and delivery estimates for pincodes; tracking numbers and events.
- **Approved policies:** shipping fee and threshold, cancellation window, returns and refunds, and discount-code rules (PREVIEW10 is a sample).
- **Email:** verification flow before email can be used for receipts or recovery.
- **Number change:** a verified support process to move an account to a new mobile number.
- **Notifications:** an order-update service (SMS, WhatsApp or email) that honours the stored preferences.
- **Stock and price:** live data from the operations system. The preview uses the catalogue snapshot.
