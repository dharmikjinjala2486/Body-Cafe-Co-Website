/* Razorpay Standard Checkout for the hosted API (13 Nov 2026). Test or live is chosen by RAZORPAY_MODE (18 Nov 2026):
   "test" (the default) uses RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET, "live" uses RAZORPAY_LIVE_KEY_ID /
   RAZORPAY_LIVE_KEY_SECRET (core.js picks the pair). Test mode refuses an rzp_live_ key and live mode an rzp_test_ one,
   so real money is only taken when the mode says live. All are function secrets; the key id is public (the browser
   needs it to open Checkout), the secrets never leave this function. Same flow and rules as app/razorpay.py:
     1. POST /orders/<id>/pay         -> a Razorpay order for our order's total (reused while it is still open)
     2. the browser opens Checkout     (web/part2-e.js)
     3. POST /orders/<id>/pay/verify  -> signature check, then the Razorpay order is read back and must carry our order
                                         number as its receipt, our total, and a successful payment. Only then: paid.
   The Razorpay order's id is recorded on our order (rzp_order) so Pay reuses it, and a customer who paid but lost the
   page is recognised the next time the payment step is opened. The receipt (our order number) is the fallback search.
   Webhook (18 Nov 2026): POST …/api/razorpay/webhook, signed with RAZORPAY_WEBHOOK_SECRET (webhookOk below; the route is
   payWebhook in core.js), so an order is marked paid even when the customer closes the page before step 3. */
export const RAZORPAY_BASE = 'https://api.razorpay.com/v1/';
export const RZP_ID = /^(order|pay)_[A-Za-z0-9]{6,40}$/;
const hex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');

/* fail(message, status, extra) builds the API's own error; fetcher is replaceable in tests. */
export function razorpay({key = '', secret = '', live = false, webhookSecret = '', fetcher = fetch, fail, base = RAZORPAY_BASE}) {
  key = String(key || '').trim(); secret = String(secret || '').trim(); webhookSecret = String(webhookSecret || '').trim();
  const configured = !!(key && secret), names = live ? 'RAZORPAY_LIVE_KEY_ID and RAZORPAY_LIVE_KEY_SECRET' : 'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET';
  async function call(method, path, body) {
    if (!configured) throw fail('Online payment isn’t connected yet. Nothing was charged.', 503);
    if (key.startsWith('rzp_live_') !== live) throw fail('The payment keys don’t match RAZORPAY_MODE (' + (live ? 'live' : 'test') + '). Nothing was charged.', 503);
    let r, data;
    try {
      r = await fetcher(base + path, {method, headers: {Authorization: 'Basic ' + btoa(key + ':' + secret), 'Content-Type': 'application/json', Accept: 'application/json'}, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000)});
      data = await r.json();
    } catch { throw fail('The payment service didn’t respond. Nothing was charged. Try again shortly.', 503, {reason: 'unavailable'}); }
    if (r.status === 401) throw fail('The payment keys were not accepted. Check ' + names + '.', 503);
    if (!r.ok) throw fail('The payment service didn’t accept the request. Nothing was charged.' + (data?.error?.description ? ' (' + String(data.error.description).slice(0, 200) + ')' : ''), 502);
    return data;
  }
  /* The Razorpay order for one of our orders: the one we recorded if it is paid or still open, else a paid or open one
     found by receipt, else new. Razorpay lists a new order by receipt only after about half a minute, so the recorded id
     (read directly, which is immediate) comes first; the receipt search covers orders made before the id was recorded. */
  async function orderFor(receipt, paise, known = '') {
    const fits = o => o.receipt === receipt && o.amount === paise && o.currency === 'INR';
    if (known && RZP_ID.test(known)) {
      // Razorpay doesn't know the recorded order (a 502 from call): it was made in the other mode (test or live) before a
      // switch. Treat it as gone; a payment of ours would still be found by the receipt search below.
      let o = {}; try { o = await call('GET', 'orders/' + known); } catch (e) { if (e?.status !== 502) throw e; }
      if (fits(o) && ['paid', 'created', 'attempted'].includes(o.status)) return o;
    }
    const mine = ((await call('GET', 'orders?' + new URLSearchParams({receipt, count: '20'}))).items || []).filter(fits);
    return mine.find(o => o.status === 'paid') || mine.find(o => o.status === 'created' || o.status === 'attempted')
      || await call('POST', 'orders', {amount: paise, currency: 'INR', receipt, notes: {order: receipt}});
  }
  async function signatureOk(order, payment, signature) {
    if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/.test(signature)) return false;
    const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
    const want = hex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(order + '|' + payment)));
    let diff = 0; for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ signature.charCodeAt(i);
    return diff === 0;
  }
  /* Razorpay signs each webhook body with the webhook secret (HMAC-SHA256, hex) in X-Razorpay-Signature. */
  async function webhookOk(raw, signature) {
    signature = String(signature || '').trim();
    if (!webhookSecret || typeof raw !== 'string' || !/^[a-f0-9]{64}$/.test(signature)) return false;
    const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(webhookSecret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
    const want = hex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(raw)));
    let diff = 0; for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ signature.charCodeAt(i);
    return diff === 0;
  }
  /* The id of the payment that paid a Razorpay order, or ''. */
  async function paidPayment(order) { return ((await call('GET', 'orders/' + order + '/payments')).items || []).find(p => p.status === 'captured')?.id || ''; }
  return {configured, key, live, test: key.startsWith('rzp_test_'), webhookConfigured: !!webhookSecret, call, orderFor, signatureOk, webhookOk, paidPayment};
}
