# Customer OTP login with Supabase

Research date: 30 October 2026. Scope: implementation research; no authentication settings, paid services, or live code changed. Findings combine the current repository with official provider documentation. Dashboard configuration and real delivery have not been independently tested in this research.

## Recommended approach

Keep Supabase Auth responsible for generating and verifying OTPs and issuing sessions. Use an SMS delivery service for Indian mobile numbers. Supabase Realtime subscriptions are unnecessary for this request/response login flow; delivery speed depends on the messaging provider and carrier.

Evaluate two routes:

| Route | Fit | Work before choosing |
| --- | --- | --- |
| Supabase native SMS provider, such as Twilio | Fewer custom integration components | Confirm India route, approved sender/template support, delivery and total charges |
| Supabase Send SMS Hook → dedicated Edge Function → regional provider such as MSG91 | Candidate for an India-focused storefront | Confirm provider accepts Supabase-generated codes; implement authenticated hook, template mapping, failure handling and delivery monitoring |

Provisional preference: investigate the regional-provider route first, but choose only after a delivery trial and written pricing. This is an architecture recommendation, not a verified claim that one provider is cheaper. Supabase documents Send SMS hooks on Free and Pro; SMS traffic and other usage are separately chargeable. [Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks), [Send SMS Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook).

## What this repository already has

- `NETLIFY.md`: `/api/*` is proxied to the Supabase operations Edge Function.
- `supabase/functions/operations/core.js`: every `/auth/*` request currently returns a provider-not-connected error. Customer session lookup recognizes `bcc_customer` and verifies its token using Supabase Auth. There is no customer login issuance or refresh flow yet.
- `web/app.js`: `/auth/otp` and `/auth/verify` calls exist, but the UI expects a returned `preview_code` and describes local-only verification. Several login renderers need updating.
- Customer IDs already use `customer-<Supabase Auth UUID>`. Profiles, addresses, bags, orders and cases use application ownership IDs.
- Application tables have RLS enabled and direct ordinary-client privileges revoked. The privileged operations API must continue checking ownership on every read and mutation; RLS does not protect against mistakes made with a service credential.
- Admin authentication is separate and mapped through `bcc_admin`. Customer registration must never populate that table or derive admin permissions from editable metadata.
- Hosted checkout is independently disabled pending real payments. OTP activation alone does not make commerce ready.

These are source observations, not fresh production verification. Existing working-tree changes were left untouched.

## Intended customer flow

1. Customer enters a mobile number; server validates it and normalizes it to E.164 (`+91` plus ten digits for the initial India-only scope).
2. `POST /api/auth/otp` validates CSRF, Origin, CAPTCHA and limits, then requests Supabase OTP delivery. Supabase offers `signInWithOtp({phone})`; the existing REST backend can call the equivalent `/auth/v1/otp` endpoint.
3. Show a masked destination, code entry, edit-number action and resend countdown. Never return or render the OTP itself.
4. `POST /api/auth/verify` sends the number and code to Supabase `/auth/v1/verify` with `type: 'sms'` (SDK equivalent: `verifyOtp`). Successful verification supplies session tokens. The backend obtains identity from the verified response, never a browser-supplied customer ID.
5. Establish the customer session, rotate CSRF, attach eligible guest data transactionally, then return the updated account state.
6. New customers receive an application profile after verification; returning customers retain the same Auth UUID. Name and optional email can be collected afterward.

Supabase documents passwordless phone login, OTP verification and configurable SMS setup. Configure expiry explicitly rather than copying a documentation default. [Phone sign-in](https://supabase.com/docs/guides/auth/phone-login).

## Session and account work

Prefer an opaque customer-session cookie backed by a private server-side session record. Store refresh credentials encrypted at rest with a dedicated encryption secret; keep tokens out of browser JavaScript, logs and URLs. Use Secure, HttpOnly, SameSite cookies, expiry, rotation and CSRF protection. Implement refresh-token rotation with concurrency control, expiration, logout and revocation; the existing bare access-token cookie lookup needs adapting.

Guest transfer needs a new server-only transactional operation. Merge the cart deterministically and cap quantities against current stock. For initial order claiming, require both the signed current guest session and a verified phone matching the order contact. Do not globally claim historical orders or private support cases solely because their contact number matches: recycled numbers and third-party checkout contacts make that unsafe. Repeated login/claim requests must be idempotent.

Require fresh verification for sensitive phone changes. Treat SMS login as single-factor authentication. Admin MFA is separate work and should use an authenticator factor enforced by the API.

Email login can be added later using custom SMTP and an OTP email template containing `{{ .Token }}`. First verify and attach the email to the signed-in account through a designed account-linking flow. A separately entered email must not become an automatic fallback into a phone account. [Email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [SMTP requirements](https://supabase.com/docs/guides/auth/auth-smtp).

## Delivery setup and abuse controls

For an Indian domestic SMS route, obtain the provider's required business onboarding, DLT entity, sender/header, approved message template and applicable entity-to-telemarketer chain setup. Confirm exact requirements with the selected provider before paying. Message text and variables must match its approved template. [MSG91 DLT guidance](https://msg91.com/help/dlt-registration-in-india/dlt-faqs).

For a custom hook, validate Supabase's signed HTTP payload using its documented verification scheme before any send. Use the supplied code as the template variable; do not independently generate or verify a second code. Provider API credentials stay in Edge Function secrets. Confirm the provider API supports that delivery mode: MSG91 also offers a separate generate/verify OTP product, which is not automatically interchangeable. [MSG91 OTP API overview](https://docs.msg91.com/otp).

Proposed application policy: six-digit code, five-minute expiry, 60-second resend cooldown, and five failed attempts per challenge before restarting. These are implementation targets requiring configuration and acceptance tests. Apply durable limits per destination, trusted client IP and project, plus CAPTCHA and provider spending caps. Mirror limits in the hook where applicable so direct Auth requests cannot bypass delivery controls.

Preserve useful 429/Retry-After behavior: the current `remote()` helper collapses most upstream failures to HTTP 400. Return safe errors for expired codes, delivery failure and throttling without exposing account existence. Record masked operational metrics for send success, latency, verification failures and spending; never log codes or credentials.

The API proxy can make users share one upstream IP. Supabase documents optional `Sb-Forwarded-For` support with a secret API key and explicit project enablement; legacy `service_role` keys are not supported for that forwarding feature. Validate trusted Netlify/Edge client-IP propagation rather than accepting an arbitrary browser header. [Rate limits and IP forwarding](https://supabase.com/docs/guides/auth/rate-limits).

## Implementation sequence and acceptance

1. Select delivery route after onboarding, integration compatibility, pricing and carrier trials. Obtain secrets through the provider/dashboard, not source files.
2. Add customer session storage and a server-only guest transfer migration; keep existing direct-table restrictions.
3. Implement send/verify/refresh/logout handlers and the dedicated SMS hook if selected.
4. Replace preview UI across login entry points; add autofill (`autocomplete="one-time-code"`), paste, loading/error states and accessible focus handling.
5. Test valid/invalid/expired/reused codes, resend behavior, parallel attempts, provider outages, rate limits, CAPTCHA and forged hook signatures.
6. Test returning-user identity, cookie renewal/expiry, logout, guest ownership/merge retries, cross-customer access denial and customer-to-admin denial.
7. Trial actual SMS on consenting test numbers across relevant carriers; record delivery time, actual billed cost and failure recovery. Configure test numbers only in isolated testing. Enable customer login after acceptance while keeping payment readiness separate.

Budget estimate should include billable sends (including resends and failed attempts where billed), provider minimums, onboarding charges/taxes, Supabase usage and optional email costs. No price or delivery-time guarantee has been established. Remaining external dependencies are a selected funded messaging account, completed onboarding/template approvals, secure credentials and actual delivery testing.
